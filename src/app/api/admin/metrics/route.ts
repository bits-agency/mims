import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();

        // Count students
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        // Count staff
        const { count: staffCount } = await supabase
          .from('teachers')
          .select('*', { count: 'exact', head: true });

        // Sum revenue
        const { data: payments } = await supabase
          .from('payments')
          .select('amount_paid');

        const totalRevenue = payments ? payments.reduce((acc, p) => acc + Number(p.amount_paid || 0), 0) : 0;

        return NextResponse.json({
          success: true,
          students: studentCount ?? 0,
          staff: staffCount ?? 0,
          revenue: totalRevenue,
          attendanceRate: 0,
          source: 'supabase_database',
        });
      } catch (err) {
        console.warn('Admin metrics DB error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      students: 0,
      staff: 0,
      revenue: 0,
      attendanceRate: 0,
      source: 'database_empty',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
