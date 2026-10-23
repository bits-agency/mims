import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const audience = searchParams.get('audience');

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, announcements: [] });
    }

    const supabase = getAdminClient();
    let query = supabase
      .from('announcements')
      .select('id, title, sender, message, category, pinned, audience, created_at')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (audience && audience !== 'all') {
      query = query.in('audience', ['all', audience]);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formatted = (data || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      sender: a.sender,
      date: a.created_at ? a.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      category: a.category,
      message: a.message,
      pinned: a.pinned,
      audience: a.audience,
    }));

    return NextResponse.json({ success: true, announcements: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin', 'teacher']);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { title, message, category, pinned, audience } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 });
    }

    const senderTitle =
      auth.session.role === 'super_admin'
        ? 'Governing Board / Super Administrator'
        : auth.session.role === 'teacher'
        ? `${auth.session.fullName || 'Subject Tutor'} (Faculty Tutor)`
        : auth.session.fullName
        ? `${auth.session.fullName} (School Admin)`
        : 'Office of the Principal';

    const supabase = getAdminClient();
    const { data: inserted, error } = await supabase
      .from('announcements')
      .insert({
        title: title.trim(),
        message: message.trim(),
        category: category || 'Academic',
        pinned: !!pinned,
        audience: audience || 'students',
        sender: senderTitle,
        created_by: auth.session.userId,
      })
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'announcement.created',
      entity: 'announcement',
      entityId: inserted.id,
      details: { title: inserted.title, audience: inserted.audience },
    });

    return NextResponse.json({
      success: true,
      message: 'Notice broadcasted to noticeboard successfully.',
      announcement: inserted,
    });
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
      return NextResponse.json({ error: 'Announcement ID is required.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'announcement.deleted',
      entity: 'announcement',
      entityId: id,
    });

    return NextResponse.json({
      success: true,
      message: 'Broadcast notice removed from noticeboard.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
