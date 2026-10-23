import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/guard';

export async function GET() {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({
        success: true,
        students: 0,
        pendingApplicants: 0,
        staff: 0,
        revenue: 0,
        attendanceRate: 0,
      });
    }

    const supabase = getAdminClient();

    // Count enrolled students (with assigned class)
    const { count: enrolledCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .not('class_id', 'is', null);

    // Count pending admission applicants (without assigned class)
    const { count: applicantCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .is('class_id', null);

    // Count staff
    const { count: staffCount } = await supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true });

    // Sum verified revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('status', 'verified');

    const totalRevenue = payments ? payments.reduce((acc, p) => acc + Number(p.amount_paid || 0), 0) : 0;

    return NextResponse.json({
      success: true,
      students: enrolledCount ?? 0,
      pendingApplicants: applicantCount ?? 0,
      staff: staffCount ?? 0,
      revenue: totalRevenue,
      attendanceRate: 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
