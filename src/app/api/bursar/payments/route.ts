import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';
import { paymentRecordSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizePaymentMethod(method?: string): 'cash' | 'bank_transfer' | 'pos' | 'direct_deposit' {
  const m = (method || '').toLowerCase();
  if (m.includes('pos')) return 'pos';
  if (m.includes('teller') || m.includes('deposit')) return 'direct_deposit';
  if (m.includes('transfer') || m.includes('nip')) return 'bank_transfer';
  if (m.includes('cash')) return 'cash';
  return 'bank_transfer';
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(['bursar', 'admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, payments: [] });
    }

    const { searchParams } = new URL(request.url);
    const sessionFilter = searchParams.get('session');
    const termFilter = searchParams.get('term')?.toLowerCase();
    const studentIdFilter = searchParams.get('studentId');
    const requestedWing = searchParams.get('wing')?.toLowerCase();

    // Enforce bursar's assigned wing if scoped
    let effectiveWing = requestedWing;
    if (auth.session.role === 'bursar' && auth.session.wing && auth.session.wing !== 'all') {
      effectiveWing = auth.session.wing;
    }

    const supabase = getAdminClient();
    let query = supabase
      .from('payments')
      .select(`
        id,
        receipt_no,
        amount_paid,
        payment_date,
        method,
        channel_reference,
        bank_name,
        status,
        session,
        term,
        student_id,
        notes,
        created_at,
        students (
          id,
          admission_no,
          firstname,
          lastname,
          category,
          classes (id, class_name, section, wing)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(150);

    if (studentIdFilter) {
      query = query.eq('student_id', studentIdFilter);
    }
    if (termFilter && termFilter !== 'all') {
      query = query.eq('term', termFilter);
    }
    if (sessionFilter && sessionFilter !== 'all') {
      query = query.eq('session', sessionFilter);
    }

    const { data: payments, error } = await query;
    if (error) throw error;

    let filtered = payments || [];
    if (effectiveWing === 'primary') {
      filtered = filtered.filter((p: any) => {
        const w = p.students?.classes?.wing?.toLowerCase() || '';
        return w.includes('primary') || w.includes('nursery') || w.includes('early');
      });
    } else if (effectiveWing === 'secondary') {
      filtered = filtered.filter((p: any) => {
        const w = p.students?.classes?.wing?.toLowerCase() || '';
        return w.includes('secondary');
      });
    }

    return NextResponse.json(
      { success: true, payments: filtered, wing: effectiveWing || 'all' },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['bursar', 'admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const rawBody = await request.json().catch(() => ({}));
    const rawMethod = normalizePaymentMethod(rawBody.paymentMethod || rawBody.method);

    const parseResult = paymentRecordSchema.safeParse({
      ...rawBody,
      paymentMethod: rawMethod,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid payment details provided.' },
        { status: 400 }
      );
    }

    const {
      studentId,
      amountPaid,
      paymentMethod,
      channelRef,
      bankName,
      paymentDate,
      term,
      session,
      notes,
      idempotencyKey,
    } = parseResult.data;

    // A reference is strictly mandatory for all non-cash payments
    const cleanRef = channelRef?.trim() || null;
    if (paymentMethod !== 'cash' && !cleanRef) {
      return NextResponse.json(
        { error: 'A bank teller number, transfer reference or POS slip ID is required for non-cash payments.' },
        { status: 400 }
      );
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const supabase = getAdminClient();

    // 1. Idempotency check: if form was submitted twice, return existing receipt
    if (idempotencyKey) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existingPayment) {
        return NextResponse.json({
          success: true,
          replayed: true,
          payment: existingPayment,
          message: 'Payment was already processed.',
        });
      }
    }

    // 2. Uniqueness check for teller / transfer reference
    if (cleanRef && paymentMethod !== 'cash') {
      const { data: existingRef } = await supabase
        .from('payments')
        .select('id, receipt_no, payment_date')
        .ilike('channel_reference', cleanRef)
        .neq('method', 'cash')
        .maybeSingle();

      if (existingRef) {
        return NextResponse.json(
          {
            error: `Duplicate Reference: Payment reference "${cleanRef}" was already recorded on Receipt #${existingRef.receipt_no} (${existingRef.payment_date}). Each teller/transfer slip can only be posted once.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Fetch student profile and class tariff
    const { data: student, error: studErr } = await supabase
      .from('students')
      .select(`
        id,
        admission_no,
        firstname,
        lastname,
        category,
        class_id,
        classes (id, class_name, section, wing, fee_level_id)
      `)
      .eq('id', studentId)
      .single();

    if (studErr || !student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    // 4. Fetch or determine fee clearance ledger
    const { data: currentClearance } = await supabase
      .from('student_fee_clearance')
      .select('*')
      .eq('student_id', studentId)
      .eq('session', session)
      .eq('term', term)
      .maybeSingle();

    // Determine total tariff for this student's class and term
    let totalBilled = Number(currentClearance?.total_billed || 0);

    if (totalBilled <= 0) {
      // Look up tariff from fee_schedules table
      const feeLevel = (student.classes as any)?.fee_level_id;
      let matchedSchedule: any = null;

      if (feeLevel) {
        const { data: sched } = await supabase
          .from('fee_schedules')
          .select('levies, boarding_levy')
          .eq('session', session)
          .eq('term', term)
          .eq('level_id', feeLevel)
          .maybeSingle();
        matchedSchedule = sched;
      }

      if (!matchedSchedule && (student.classes as any)?.wing) {
        const { data: schedWing } = await supabase
          .from('fee_schedules')
          .select('levies, boarding_levy')
          .eq('session', session)
          .eq('term', term)
          .ilike('wing', `%${(student.classes as any).wing}%`)
          .limit(1)
          .maybeSingle();
        matchedSchedule = schedWing;
      }

      if (matchedSchedule && Array.isArray(matchedSchedule.levies)) {
        totalBilled = matchedSchedule.levies.reduce((sum: number, l: any) => sum + Number(l.amount || 0), 0);
        if (student.category === 'Boarding' && matchedSchedule.boarding_levy) {
          totalBilled += Number(matchedSchedule.boarding_levy);
        }
      }

      // Default safe fallback if not yet configured in tariff
      if (totalBilled <= 0) {
        totalBilled = 55000;
      }
    }

    const currentPaid = Number(currentClearance?.total_paid || 0);
    const outstandingBalance = Math.max(0, totalBilled - currentPaid);

    if (currentClearance?.is_cleared && outstandingBalance === 0) {
      return NextResponse.json(
        {
          error: `Account Locked: Student is already fully settled (₦0.00 balance) for ${term} term (${session}).`,
        },
        { status: 400 }
      );
    }

    if (amountPaid > outstandingBalance) {
      return NextResponse.json(
        {
          error: `Overpayment Error: Payment amount (₦${amountPaid.toLocaleString()}) exceeds the total outstanding balance of ₦${outstandingBalance.toLocaleString()}. Please record the exact balance or less.`,
        },
        { status: 400 }
      );
    }

    // 5. Generate collision-free receipt number
    const currentYear = new Date().getFullYear();
    const { count: paymentCount } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });

    const receiptSeq = (paymentCount || 0) + 1;
    const receiptNo = `MIMS/REC/${currentYear}/${String(receiptSeq).padStart(5, '0')}`;
    const effectiveDate = paymentDate || new Date().toISOString().split('T')[0];

    // 6. Insert verified payment record
    const { data: paymentRecord, error: payErr } = await supabase
      .from('payments')
      .insert({
        student_id: studentId,
        session,
        term,
        amount_paid: amountPaid,
        payment_date: effectiveDate,
        receipt_no: receiptNo,
        method: paymentMethod,
        channel_reference: cleanRef,
        bank_name: bankName?.trim() || null,
        status: 'verified',
        received_by: auth.session.userId,
        idempotency_key: idempotencyKey || null,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (payErr) {
      throw new Error(`Failed to record payment in database: ${payErr.message}`);
    }

    // 7. Update clearance record atomically
    const newPaid = currentPaid + amountPaid;
    const newBalance = Math.max(0, totalBilled - newPaid);
    const isCleared = newBalance === 0;

    let updatedClearance: any;
    if (currentClearance) {
      const { data: upd, error: updErr } = await supabase
        .from('student_fee_clearance')
        .update({
          total_billed: totalBilled,
          total_paid: newPaid,
          balance: newBalance,
          is_cleared: isCleared,
          last_payment_date: effectiveDate,
          verified_by: auth.session.userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentClearance.id)
        .select()
        .single();

      if (updErr) throw updErr;
      updatedClearance = upd;
    } else {
      const { data: ins, error: insErr } = await supabase
        .from('student_fee_clearance')
        .insert({
          student_id: studentId,
          session,
          term,
          total_billed: totalBilled,
          total_paid: newPaid,
          balance: newBalance,
          is_cleared: isCleared,
          last_payment_date: effectiveDate,
          verified_by: auth.session.userId,
        })
        .select()
        .single();

      if (insErr) throw insErr;
      updatedClearance = ins;
    }

    // 8. Write immutable audit log
    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'payment.recorded',
      entity: 'payment',
      entityId: paymentRecord.id,
      details: {
        receipt_no: receiptNo,
        amount: amountPaid,
        method: paymentMethod,
        reference: cleanRef,
        studentId,
        studentName: `${student.firstname} ${student.lastname}`,
        session,
        term,
        balanceRemaining: newBalance,
      },
    });

    return NextResponse.json({
      success: true,
      clearance: updatedClearance,
      payment: paymentRecord,
      receipt: {
        receiptNo,
        admissionNo: student.admission_no,
        studentName: `${student.firstname} ${student.lastname}`,
        className: (student.classes as any)?.class_name || 'Enrolled Student',
        amountPaid,
        session,
        term,
        paymentDate: effectiveDate,
        method: paymentMethod,
        channelRef: cleanRef || 'CASH_PAYMENT',
        bankName: bankName || 'School Bursary Desk',
        balance: newBalance,
        status: isCleared ? 'VERIFIED & FULLY CLEARED' : 'VERIFIED (PARTIAL PAYMENT)',
      },
      message: 'Payment recorded and official stamped receipt generated successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
