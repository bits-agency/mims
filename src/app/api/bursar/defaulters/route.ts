import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const { data: defaulters, error } = await supabase
          .from('student_fee_clearance')
          .select(`
            id,
            total_billed,
            total_paid,
            balance,
            is_cleared,
            students (
              id,
              admission_no,
              firstname,
              lastname,
              guardian_name,
              guardian_phone,
              classes (class_name, section)
            )
          `)
          .eq('is_cleared', false)
          .gt('balance', 0)
          .order('balance', { ascending: false });

        if (!error && defaulters) {
          return NextResponse.json({ success: true, defaulters, source: 'supabase_database' });
        }
      } catch (err) {
        console.warn('Defaulters DB query fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      defaulters: [],
      source: 'database_empty',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
