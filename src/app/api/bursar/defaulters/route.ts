import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/guard';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(['bursar', 'admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, defaulters: [] });
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
          classes (id, class_name, section, wing)
        )
      `)
      .eq('is_cleared', false)
      .gt('balance', 0)
      .eq('session', sessionFilter);

    if (termFilter && termFilter !== 'all') {
      query = query.eq('term', termFilter);
    }

    const { data: defaulters, error } = await query.order('balance', { ascending: false });
    if (error) throw error;

    let filtered = defaulters || [];
    if (effectiveWing === 'primary') {
      filtered = filtered.filter((d: any) => {
        const w = d.students?.classes?.wing?.toLowerCase() || '';
        return w.includes('primary') || w.includes('nursery') || w.includes('early');
      });
    } else if (effectiveWing === 'secondary') {
      filtered = filtered.filter((d: any) => {
        const w = d.students?.classes?.wing?.toLowerCase() || '';
        return w.includes('secondary');
      });
    }

    return NextResponse.json({
      success: true,
      defaulters: filtered,
      wing: effectiveWing || 'all',
      count: filtered.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
