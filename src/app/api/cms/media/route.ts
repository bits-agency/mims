import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';
import { mediaGallerySchema } from '@/lib/validation';

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('media_gallery')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return NextResponse.json({ success: true, media: data, source: 'supabase_database' });
        }
      } catch (err) {
        console.warn('Media DB query error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      media: [],
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

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = mediaGallerySchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid media gallery parameters.' },
        { status: 400 }
      );
    }

    const { title, category, image_url, caption, date_added, is_featured, file_size } = parseResult.data;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('media_gallery')
      .insert({
        title: title.trim(),
        category,
        image_url: image_url.trim(),
        caption: caption?.trim() || null,
        date_added: date_added || new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        is_featured: is_featured !== false,
        file_size: file_size || '1.5 MB',
      })
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'cms.media_added',
      entity: 'media_gallery',
      entityId: data.id,
      details: { title: data.title, category: data.category },
    });

    return NextResponse.json({ success: true, item: data, message: 'Media recorded successfully in database' });
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
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { error } = await supabase.from('media_gallery').delete().eq('id', id);
    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'cms.media_deleted',
      entity: 'media_gallery',
      entityId: id,
    });

    return NextResponse.json({ success: true, message: 'Media item deleted.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
