import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizePaymentMethod(method?: string): string {
  const m = (method || '').toLowerCase();
  if (m.includes('transfer') || m.includes('nip')) return 'bank_transfer';
  if (m.includes('teller') || m.includes('deposit')) return 'bank_teller';
  if (m.includes('pos')) return 'pos';
  if (m.includes('cash')) return 'cash';
  return (method || 'bank_transfer').slice(0, 20);
}

export async function GET(request: Request) {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { searchParams } = new URL(request.url);
    const wingFilter = searchParams.get('wing')?.toLowerCase();
    const sessionFilter = searchParams.get('session');
    const termFilter = searchParams.get('term')?.toLowerCase();
    const studentIdFilter = searchParams.get('studentId');

    if (hasSupabase) {
      try {
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
            status,
            session,
            term,
            student_id,
            students (
              id,
              admission_no,
              firstname,
              lastname,
              category,
              classes (class_name, section, wing)
            )
          `)
          .order('payment_date', { ascending: false })
          .limit(100);

        if (studentIdFilter) {
          query = query.eq('student_id', studentIdFilter);
        }

        const { data: payments, error } = await query;

        if (!error && payments) {
          let filtered = payments;
          if (wingFilter === 'primary') {
            filtered = payments.filter((p: any) => {
              const w = p.students?.classes?.wing?.toLowerCase() || '';
              return w.includes('primary') || w.includes('nursery');
            });
          } else if (wingFilter === 'secondary') {
            filtered = payments.filter((p: any) => {
              const w = p.students?.classes?.wing?.toLowerCase() || '';
              return w.includes('secondary');
            });
          }

          if (termFilter && termFilter !== 'all') {
            filtered = filtered.filter((p: any) => (p.term || 'first') === termFilter);
          }

          if (sessionFilter && sessionFilter !== 'all') {
            filtered = filtered.filter((p: any) => !p.session || p.session === sessionFilter);
          }

          return NextResponse.json(
            { success: true, payments: filtered, wing: wingFilter || 'all', source: 'supabase_database' },
            { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
          );
        }
      } catch (err) {
        console.warn('Payments DB query fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      payments: [],
      source: 'database_defaults',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, admissionNo, studentName, amountPaid, paymentMethod, channelRef, term, session } = body;

    if (!amountPaid || Number(amountPaid) <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 });
    }

    const receiptNo = `MIMS/REC/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const activeSession = session || '2025/2026';
    const activeTerm = term || 'first';
    const dbMethod = normalizePaymentMethod(paymentMethod);

    if (hasSupabase && studentId) {
      try {
        const supabase = getAdminClient();

        // Security check: Verify if the student account is already cleared for this session & term
        const { data: currentClearance } = await supabase
          .from('student_fee_clearance')
          .select('*')
          .eq('student_id', studentId)
          .eq('session', activeSession)
          .eq('term', activeTerm)
          .maybeSingle();

        if (currentClearance && currentClearance.is_cleared && Number(currentClearance.balance) === 0) {
          return NextResponse.json(
            {
              error: `Security Lock: This student's account is already fully settled (₦0.00 balance) for ${activeTerm === 'first' ? '1st Term' : activeTerm === 'second' ? '2nd Term' : '3rd Term'} (${activeSession}). Account is strictly locked against duplicate billing or re-editing.`,
              isAlreadyCleared: true,
            },
            { status: 400 }
          );
        }

        // 1. Insert payment row with normalized method (<= 20 chars)
        const { error: payErr } = await supabase.from('payments').insert({
          student_id: studentId,
          session: activeSession,
          term: activeTerm,
          amount_paid: Number(amountPaid),
          receipt_no: receiptNo,
          method: dbMethod,
          channel_reference: channelRef || 'NIP-TX-' + Date.now(),
          status: 'verified',
        });

        if (payErr) {
          console.error('Payment insert error:', payErr);
          return NextResponse.json({ error: `Payment database insert failed: ${payErr.message}` }, { status: 500 });
        }

        // 2. Update or Insert clearance row for this specific session & term
        let updatedClearanceData: any = null;

        if (currentClearance) {
          const newPaid = Number(currentClearance.total_paid || 0) + Number(amountPaid);
          const totalBilled = Number(currentClearance.total_billed || 55000);
          const newBalance = Math.max(0, totalBilled - newPaid);
          const isCleared = newBalance === 0;

          const { data: updated, error: updErr } = await supabase
            .from('student_fee_clearance')
            .update({
              total_paid: newPaid,
              balance: newBalance,
              is_cleared: isCleared,
              last_payment_date: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentClearance.id)
            .select()
            .single();

          if (updErr) {
            console.error('Clearance update error:', updErr);
            return NextResponse.json({ error: `Clearance update failed: ${updErr.message}` }, { status: 500 });
          }

          updatedClearanceData = updated;
        } else {
          // If no clearance record exists for this term, create one
          const totalBilled = 55000;
          const newPaid = Number(amountPaid);
          const newBalance = Math.max(0, totalBilled - newPaid);
          const isCleared = newBalance === 0;

          const { data: inserted, error: insErr } = await supabase
            .from('student_fee_clearance')
            .insert({
              student_id: studentId,
              session: activeSession,
              term: activeTerm,
              total_billed: totalBilled,
              total_paid: newPaid,
              balance: newBalance,
              is_cleared: isCleared,
              last_payment_date: new Date().toISOString().split('T')[0],
            })
            .select()
            .single();

          if (insErr) {
            console.error('Clearance insert error:', insErr);
            return NextResponse.json({ error: `Clearance insert failed: ${insErr.message}` }, { status: 500 });
          }

          updatedClearanceData = inserted;
        }

        return NextResponse.json({
          success: true,
          clearance: updatedClearanceData,
          receipt: {
            receiptNo,
            admissionNo: admissionNo || 'MIMS/2026/0042',
            studentName: studentName || 'Pupil',
            amountPaid: Number(amountPaid),
            session: activeSession,
            term: activeTerm,
            paymentDate: new Date().toLocaleDateString('en-GB'),
            method: paymentMethod || 'Direct Bank Transfer',
            channelRef: channelRef || `NIP-${Math.floor(100000 + Math.random() * 900000)}`,
            status: updatedClearanceData?.is_cleared ? 'VERIFIED & FULLY CLEARED' : 'VERIFIED (PARTIAL PAYMENT)',
          },
          message: 'Payment recorded and official stamped receipt generated successfully.',
        });
      } catch (dbErr: any) {
        console.error('DB payment execution exception:', dbErr);
        return NextResponse.json({ error: dbErr?.message || 'Database execution error' }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Database connection or student identifier missing. Please check your Supabase configuration.',
    }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
