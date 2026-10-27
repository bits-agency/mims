import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/guard';
import { getLeviesForStudentClass, allocatePaymentToLevies } from '@/lib/bursary';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(['bursar', 'admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({
        success: true,
        totalCollected: 0,
        totalBilled: 0,
        totalOutstanding: 0,
        clearanceRate: 0,
        clearedCount: 0,
        defaulterCount: 0,
        paymentsCount: 0,
        categoryBreakdown: {
          tuition: { name: 'Tuition & Instruction', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
          medical: { name: 'Medical & Healthcare Screening', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
          exams: { name: 'Terminal & External Examination Levies', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
          ict_lab: { name: 'ICT & Science Laboratory Practicals', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
          development: { name: 'Campus Development & Facility Maintenance', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
          tahfeez: { name: 'Tahfeez & Quranic / Arabic Studies', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
          activities: { name: 'Montessori & Valedictory / Exit Services', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
        },
        itemizedLevies: [],
      });
    }

    const { searchParams } = new URL(request.url);
    const requestedWing = searchParams.get('wing')?.toLowerCase();
    const sessionFilter = searchParams.get('session') || '2025/2026';
    const termFilter = searchParams.get('term')?.toLowerCase();

    // Respect bursar assigned wing
    let effectiveWing = requestedWing;
    if (auth.session.role === 'bursar' && auth.session.wing && auth.session.wing !== 'all') {
      effectiveWing = auth.session.wing;
    }

    const supabase = getAdminClient();

    // 1. Fetch payments
    const { data: payments, error: pErr } = await supabase
      .from('payments')
      .select(`
        amount_paid,
        payment_date,
        method,
        session,
        term,
        students (
          classes (wing, class_name)
        )
      `)
      .eq('status', 'verified');

    if (pErr) throw pErr;

    // 2. Fetch clearance
    const { data: clearances, error: cErr } = await supabase
      .from('student_fee_clearance')
      .select(`
        is_cleared,
        balance,
        total_billed,
        total_paid,
        session,
        term,
        students (
          classes (wing, class_name)
        )
      `);

    if (cErr) throw cErr;

    let safeClearances = clearances || [];
    let safePayments = payments || [];

    // Filter by Session
    if (sessionFilter && sessionFilter !== 'all') {
      safeClearances = safeClearances.filter((c: any) => c.session === sessionFilter);
      safePayments = safePayments.filter((p: any) => p.session === sessionFilter);
    }

    // Filter by Term
    if (termFilter && termFilter !== 'all') {
      safeClearances = safeClearances.filter((c: any) => c.term === termFilter);
      safePayments = safePayments.filter((p: any) => p.term === termFilter);
    }

    if (effectiveWing === 'primary') {
      safeClearances = safeClearances.filter((c: any) => {
        const w = c.students?.classes?.wing?.toLowerCase() || '';
        return w.includes('primary') || w.includes('nursery') || w.includes('early');
      });
      safePayments = safePayments.filter((p: any) => {
        const w = p.students?.classes?.wing?.toLowerCase() || '';
        return w.includes('primary') || w.includes('nursery') || w.includes('early');
      });
    } else if (effectiveWing === 'secondary') {
      safeClearances = safeClearances.filter((c: any) => {
        const w = c.students?.classes?.wing?.toLowerCase() || '';
        return w.includes('secondary');
      });
      safePayments = safePayments.filter((p: any) => {
        const w = p.students?.classes?.wing?.toLowerCase() || '';
        return w.includes('secondary');
      });
    }

    const totalCollected = safeClearances.reduce((acc, c) => acc + Number(c.total_paid || 0), 0);
    const totalBilled = safeClearances.reduce((acc, c) => acc + Number(c.total_billed || 0), 0);
    const totalOutstanding = safeClearances.reduce((acc, c) => acc + Number(c.balance || 0), 0);
    const clearedCount = safeClearances.filter((c) => c.is_cleared).length;
    const clearanceRate = safeClearances.length > 0 ? (clearedCount / safeClearances.length) * 100 : 0;

    // Itemized Revenue Aggregation per fee type
    const categoryBreakdown = {
      tuition: { name: 'Tuition & Academic Delivery', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
      medical: { name: 'Medical & Healthcare Screening', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
      exams: { name: 'Terminal & External Examination Levies (WAEC/NECO/BECE)', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
      ict_lab: { name: 'ICT & Science Laboratory Practicals', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
      development: { name: 'Campus Development & Facility Maintenance', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
      tahfeez: { name: 'Tahfeez & Quranic / Arabic Studies', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
      activities: { name: 'Montessori & Valedictory / Exit Services', billed: 0, collected: 0, outstanding: 0, percentage: 0 },
    };

    const detailedMap = new Map<string, { id: string; name: string; category: string; billed: number; collected: number; outstanding: number }>();

    for (const c of (safeClearances as any[])) {
      const studentClass = c.students?.classes;
      const className = (Array.isArray(studentClass) ? studentClass[0]?.class_name : studentClass?.class_name) || '';
      const levies = getLeviesForStudentClass(className);
      const paid = Number(c.total_paid || 0);
      const { allocated } = allocatePaymentToLevies(levies, paid);

      for (const item of allocated) {
        const b = Number(item.amount || 0);
        const col = Number(item.amountPaid || 0);
        const out = Number(item.balance || 0);

        // Group into key category
        const id = item.id.toLowerCase();
        if (id === 'tuition' || item.category === 'tuition') {
          categoryBreakdown.tuition.billed += b;
          categoryBreakdown.tuition.collected += col;
          categoryBreakdown.tuition.outstanding += out;
        } else if (id === 'medical') {
          categoryBreakdown.medical.billed += b;
          categoryBreakdown.medical.collected += col;
          categoryBreakdown.medical.outstanding += out;
        } else if (['exam', 'waec', 'neco', 'bece', 'bece-mock', 'common-entrance'].includes(id)) {
          categoryBreakdown.exams.billed += b;
          categoryBreakdown.exams.collected += col;
          categoryBreakdown.exams.outstanding += out;
        } else if (['ict', 'lab', 'lab-practical'].includes(id)) {
          categoryBreakdown.ict_lab.billed += b;
          categoryBreakdown.ict_lab.collected += col;
          categoryBreakdown.ict_lab.outstanding += out;
        } else if (['development'].includes(id) || item.category === 'facility') {
          if (['graduation', 'valedictory'].includes(id)) {
            categoryBreakdown.activities.billed += b;
            categoryBreakdown.activities.collected += col;
            categoryBreakdown.activities.outstanding += out;
          } else {
            categoryBreakdown.development.billed += b;
            categoryBreakdown.development.collected += col;
            categoryBreakdown.development.outstanding += out;
          }
        } else if (id === 'tahfeez') {
          categoryBreakdown.tahfeez.billed += b;
          categoryBreakdown.tahfeez.collected += col;
          categoryBreakdown.tahfeez.outstanding += out;
        } else {
          categoryBreakdown.activities.billed += b;
          categoryBreakdown.activities.collected += col;
          categoryBreakdown.activities.outstanding += out;
        }

        // Detailed itemized tracking
        const existing = detailedMap.get(item.id) || {
          id: item.id,
          name: item.name,
          category: item.category,
          billed: 0,
          collected: 0,
          outstanding: 0,
        };
        existing.billed += b;
        existing.collected += col;
        existing.outstanding += out;
        detailedMap.set(item.id, existing);
      }
    }

    // Compute category percentages
    Object.values(categoryBreakdown).forEach((cat) => {
      cat.percentage = cat.billed > 0 ? Math.round((cat.collected / cat.billed) * 1000) / 10 : 0;
    });

    const itemizedLevies = Array.from(detailedMap.values()).map((l) => ({
      ...l,
      percentage: l.billed > 0 ? Math.round((l.collected / l.billed) * 1000) / 10 : 0,
    }));

    return NextResponse.json({
      success: true,
      wing: effectiveWing || 'all',
      totalCollected,
      totalBilled,
      totalOutstanding,
      clearanceRate: Math.round(clearanceRate * 10) / 10,
      clearedCount,
      defaulterCount: safeClearances.length - clearedCount,
      paymentsCount: safePayments.length,
      categoryBreakdown,
      itemizedLevies,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
