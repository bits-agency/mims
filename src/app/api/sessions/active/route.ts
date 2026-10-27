import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasSupabase) {
      return NextResponse.json({
        success: true,
        sessionName: '2025/2026',
        sessionId: 'default-session',
        term: 'first',
        termNumber: 1,
        termName: 'First Term',
        resultsReleased: false,
        allSessions: ['2025/2026', '2024/2025'],
      });
    }

    const supabase = getAdminClient();

    // 1. Fetch current active session (or most recent)
    const { data: currentSession, error: sErr } = await supabase
      .from('academic_sessions')
      .select(`
        id,
        session_name,
        is_current,
        academic_terms (
          id,
          term_number,
          term_name,
          is_current,
          results_released
        )
      `)
      .order('is_current', { ascending: false })
      .order('session_name', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sErr) throw sErr;

    // 2. Fetch list of all existing sessions for dropdown switchers
    const { data: allSessionsList } = await supabase
      .from('academic_sessions')
      .select('session_name')
      .order('session_name', { ascending: false });

    const allSessions = allSessionsList?.map((s) => s.session_name) || ['2025/2026'];

    if (!currentSession) {
      return NextResponse.json({
        success: true,
        sessionName: '2025/2026',
        sessionId: 'default-session',
        term: 'first',
        termNumber: 1,
        termName: 'First Term',
        resultsReleased: false,
        allSessions,
      });
    }

    const terms: any[] = currentSession.academic_terms || [];
    const activeTerm = terms.find((t) => t.is_current) || terms[0];

    const termNumber = activeTerm?.term_number || 1;
    const termCode = termNumber === 1 ? 'first' : termNumber === 2 ? 'second' : 'third';

    return NextResponse.json({
      success: true,
      sessionName: currentSession.session_name,
      sessionId: currentSession.id,
      term: termCode,
      termNumber,
      termName: activeTerm?.term_name || `${termCode.toUpperCase()} Term`,
      resultsReleased: !!activeTerm?.results_released,
      allSessions,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: message,
        sessionName: '2025/2026',
        term: 'first',
        termNumber: 1,
        termName: 'First Term',
        resultsReleased: false,
        allSessions: ['2025/2026'],
      },
      { status: 200 }
    );
  }
}
