import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { searchParams } = new URL(request.url);
    const wingFilter = searchParams.get('wing')?.toLowerCase();

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();

        // 1. Fetch total payments with wing link
        const { data: payments } = await supabase
          .from('payments')
          .select(`
            amount_paid,
            payment_date,
            method,
            channel_reference,
            students (
              classes (wing, class_name)
            )
          `);

        // 2. Fetch clearance counts with wing link
        const { data: clearances } = await supabase
          .from('student_fee_clearance')
          .select(`
            is_cleared,
            balance,
            total_billed,
            total_paid,
            students (
              classes (wing, class_name)
            )
          `);

        let safeClearances = clearances || [];
        let safePayments = payments || [];

        if (wingFilter === 'primary') {
          safeClearances = safeClearances.filter((c: any) => {
            const w = c.students?.classes?.wing?.toLowerCase() || '';
            return w.includes('primary') || w.includes('nursery');
          });
          safePayments = safePayments.filter((p: any) => {
            const w = p.students?.classes?.wing?.toLowerCase() || '';
            return w.includes('primary') || w.includes('nursery');
          });
        } else if (wingFilter === 'secondary') {
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
          wing: wingFilter || 'all',
          totalCollected,
          totalBilled,
          totalOutstanding,
          clearanceRate: Math.round(clearanceRate * 10) / 10,
          clearedCount,
          defaulterCount: safeClearances.length - clearedCount,
          paymentsCount: safePayments.length,
          source: 'supabase_database',
        });
      } catch (dbErr) {
        console.warn('Bursar stats DB error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      totalCollected: 0,
      totalBilled: 0,
      totalOutstanding: 0,
      clearanceRate: 0,
      clearedCount: 0,
      defaulterCount: 0,
      paymentsCount: 0,
      source: 'database_empty',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
