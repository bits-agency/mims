import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/guard';

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
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
