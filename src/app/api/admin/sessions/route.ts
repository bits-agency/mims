import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';

export async function GET() {
  try {
    const auth = await requireAuth(['admin', 'super_admin', 'teacher', 'bursar']);
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, sessions: [] });
    }

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

    if (error) throw error;

    const formatted = (sessions || []).map((s: any) => ({
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

    return NextResponse.json({ success: true, sessions: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { sessionName, isCurrentSession } = body;

    if (!sessionName || !sessionName.trim()) {
      return NextResponse.json({ error: 'Session name (e.g. 2026/2027) is required' }, { status: 400 });
    }

    const cleanSession = sessionName.trim();
    const supabase = getAdminClient();

    if (isCurrentSession) {
      await supabase.from('academic_sessions').update({ is_current: false }).neq('session_name', cleanSession);
    }

    const { data: newSession, error: sErr } = await supabase
      .from('academic_sessions')
      .insert({ session_name: cleanSession, is_current: !!isCurrentSession })
      .select()
      .single();

    if (sErr) throw sErr;

    // Seed 3 terms for new session
    await supabase.from('academic_terms').insert([
      { session_id: newSession.id, term_number: 1, term_name: 'First Term', is_current: true, results_released: false },
      { session_id: newSession.id, term_number: 2, term_name: 'Second Term', is_current: false, results_released: false },
      { session_id: newSession.id, term_number: 3, term_name: 'Third Term (Promotional)', is_current: false, results_released: false },
    ]);

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'session.created',
      entity: 'academic_session',
      entityId: newSession.id,
      details: { sessionName: cleanSession },
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const {
      sessionId,
      sessionName,
      makeActive,
      termId,
      resultsReleased,
      isCurrentTerm,
      startDate,
      endDate,
    } = body;

    const supabase = getAdminClient();

    // 1. Session activation or rename
    if (sessionId) {
      if (makeActive) {
        await supabase.from('academic_sessions').update({ is_current: false }).neq('id', sessionId);
        await supabase.from('academic_sessions').update({ is_current: true }).eq('id', sessionId);
      }
      if (sessionName) {
        await supabase.from('academic_sessions').update({ session_name: sessionName.trim() }).eq('id', sessionId);
      }

      await logAudit({
        actorId: auth.session.userId,
        actorRole: auth.session.role,
        action: 'session.updated',
        entity: 'academic_session',
        entityId: sessionId,
        details: { makeActive, sessionName },
      });

      return NextResponse.json({ success: true, message: 'Session updated successfully' });
    }

    // 2. Term updates (results release or current term switch)
    if (termId) {
      const updateData: Record<string, any> = {};
      if (resultsReleased !== undefined) updateData.results_released = resultsReleased;
      if (isCurrentTerm !== undefined) updateData.is_current = isCurrentTerm;
      if (startDate) updateData.start_date = startDate;
      if (endDate) updateData.end_date = endDate;

      if (isCurrentTerm) {
        const { data: termData } = await supabase.from('academic_terms').select('session_id').eq('id', termId).single();
        if (termData?.session_id) {
          await supabase.from('academic_terms').update({ is_current: false }).eq('session_id', termData.session_id);
        }
      }

      const { error: updErr } = await supabase.from('academic_terms').update(updateData).eq('id', termId);
      if (updErr) throw updErr;

      await logAudit({
        actorId: auth.session.userId,
        actorRole: auth.session.role,
        action: resultsReleased ? 'results.released' : 'term.updated',
        entity: 'academic_term',
        entityId: termId,
        details: { resultsReleased, isCurrentTerm },
      });

      return NextResponse.json({
        success: true,
        message: resultsReleased !== undefined
          ? `Terminal examination results successfully ${resultsReleased ? 'RELEASED' : 'LOCKED'}.`
          : 'Term settings updated.',
      });
    }

    return NextResponse.json({ error: 'Missing sessionId or termId' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase.from('academic_sessions').delete().eq('id', id);
    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'session.deleted',
      entity: 'academic_session',
      entityId: id,
    });

    return NextResponse.json({ success: true, message: 'Session deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
