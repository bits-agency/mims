import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const { data: sessions, error } = await supabase
          .from('academic_sessions')
          .select(`
            id,
            session_name,
            is_current,
            academic_terms (
              id,
              term_number,
              term_name,
              start_date,
              end_date,
              is_current,
              results_released
            )
          `)
          .order('session_name', { ascending: false });

        if (!error && sessions) {
          const formatted = sessions.map((s: any) => ({
            id: s.id,
            sessionName: s.session_name,
            isCurrentSession: s.is_current,
            terms: (s.academic_terms || []).map((t: any) => ({
              id: t.id,
              termNumber: t.term_number,
              name: t.term_name || `Term ${t.term_number}`,
              startDate: t.start_date || '',
              endDate: t.end_date || '',
              isCurrent: t.is_current,
              resultsReleased: t.results_released,
              status: t.is_current ? 'Active' : t.results_released ? 'Completed' : 'Upcoming',
            })),
          }));

          return NextResponse.json({ success: true, sessions: formatted, source: 'supabase_database' });
        }
      } catch (err) {
        console.warn('Sessions DB query error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      sessions: [],
      source: 'database_empty',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionName, isCurrentSession } = body;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (hasSupabase) {
      const supabase = getAdminClient();

      if (isCurrentSession) {
        await supabase.from('academic_sessions').update({ is_current: false }).neq('session_name', sessionName);
      }

      const { data: newSession, error: sErr } = await supabase
        .from('academic_sessions')
        .insert({ session_name: sessionName, is_current: !!isCurrentSession })
        .select()
        .single();

      if (sErr) throw sErr;

      // Seed 3 standard terms
      await supabase.from('academic_terms').insert([
        { session_id: newSession.id, term_number: 1, term_name: 'First Term', start_date: '2025-09-15', end_date: '2025-12-18', is_current: true, results_released: false },
        { session_id: newSession.id, term_number: 2, term_name: 'Second Term', start_date: '2026-01-12', end_date: '2026-04-03', is_current: false, results_released: false },
        { session_id: newSession.id, term_number: 3, term_name: 'Third Term (Promotional)', start_date: '2026-04-27', end_date: '2026-07-24', is_current: false, results_released: false },
      ]);

      return NextResponse.json({ success: true, session: newSession });
    }

    return NextResponse.json({ success: true, message: 'Session provisioned' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId,
      sessionName,
      makeActive,
      termId,
      resultsReleased,
      isCurrentTerm,
      startDate,
      endDate
    } = body;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (hasSupabase) {
      const supabase = getAdminClient();

      // 1. Session activation or rename
      if (sessionId) {
        if (makeActive) {
          await supabase.from('academic_sessions').update({ is_current: false }).neq('id', sessionId);
          await supabase.from('academic_sessions').update({ is_current: true }).eq('id', sessionId);
        }
        if (sessionName) {
          await supabase.from('academic_sessions').update({ session_name: sessionName }).eq('id', sessionId);
        }
        return NextResponse.json({ success: true, message: 'Session updated' });
      }

      // 2. Term updates
      if (termId) {
        const updateData: any = {};
        if (resultsReleased !== undefined) updateData.results_released = resultsReleased;
        if (isCurrentTerm !== undefined) updateData.is_current = isCurrentTerm;
        if (startDate) updateData.start_date = startDate;
        if (endDate) updateData.end_date = endDate;

        if (isCurrentTerm) {
          // Get session_id for this term to ensure only 1 active term in session
          const { data: termData } = await supabase.from('academic_terms').select('session_id').eq('id', termId).single();
          if (termData?.session_id) {
            await supabase.from('academic_terms').update({ is_current: false }).eq('session_id', termData.session_id);
          }
        }

        await supabase.from('academic_terms').update(updateData).eq('id', termId);
        return NextResponse.json({ success: true, message: 'Term status updated' });
      }
    }

    return NextResponse.json({ success: true, message: 'Status modified' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (hasSupabase) {
      const supabase = getAdminClient();
      const { error } = await supabase.from('academic_sessions').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Session deleted successfully' });
    }

    return NextResponse.json({ success: true, message: 'Session deleted' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

