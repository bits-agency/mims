import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { searchParams } = new URL(request.url);
    const wingFilter = searchParams.get('wing')?.toLowerCase();
    const sessionFilter = searchParams.get('session') || '2025/2026';
    const termFilter = searchParams.get('term')?.toLowerCase();

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        let query = supabase
          .from('student_fee_clearance')
          .select(`
            id,
            total_billed,
            total_paid,
            balance,
            is_cleared,
            session,
            term,
            students (
              id,
              admission_no,
              firstname,
              lastname,
              guardian_name,
              guardian_phone,
              classes (class_name, section, wing)
            )
          `)
          .eq('is_cleared', false)
          .gt('balance', 0)
          .eq('session', sessionFilter);

        if (termFilter && termFilter !== 'all') {
          query = query.eq('term', termFilter);
        }

        const { data: defaulters, error } = await query
          .order('balance', { ascending: false });

        if (!error && defaulters) {
          let filtered = defaulters;
          if (wingFilter === 'primary') {
            filtered = defaulters.filter((d: any) => {
              const w = d.students?.classes?.wing?.toLowerCase() || '';
              return w.includes('primary') || w.includes('nursery');
            });
          } else if (wingFilter === 'secondary') {
            filtered = defaulters.filter((d: any) => {
              const w = d.students?.classes?.wing?.toLowerCase() || '';
              return w.includes('secondary');
            });
          }

          return NextResponse.json({ success: true, defaulters: filtered, wing: wingFilter || 'all', source: 'supabase_database' });
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
