import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return NextResponse.json({ success: true, achievements: data, source: 'supabase_database' });
        }
      } catch (err) {
        console.warn('Achievements DB query error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      achievements: [],
      source: 'database_empty',
    });
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
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase.from('achievements').insert(body).select().single();
    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'cms.achievement_added',
      entity: 'achievements',
      entityId: data.id,
      details: { title: data.title },
    });

    return NextResponse.json({ success: true, achievement: data, message: 'Achievement recorded in database' });
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
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase.from('achievements').delete().eq('id', id);
    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'cms.achievement_deleted',
      entity: 'achievements',
      entityId: id,
    });

    return NextResponse.json({ success: true, message: 'Achievement deleted.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
