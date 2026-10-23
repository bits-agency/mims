import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, classes: [] });
    }

    const supabase = getAdminClient();
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        id,
        class_name,
        section,
        wing,
        fee_level_id,
        created_at,
        students (id)
      `)
      .order('class_name', { ascending: true });

    if (error) throw error;

    const formatted = (classes || []).map((c: any) => ({
      id: c.id,
      className: c.class_name,
      section: c.section,
      wing: c.wing || 'Secondary',
      feeLevelId: c.fee_level_id || null,
      studentCount: c.students ? c.students.length : 0,
      createdAt: c.created_at,
    }));

    return NextResponse.json({ success: true, classes: formatted });
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
    const { className, section, wing, feeLevelId } = body;

    if (!className || !section) {
      return NextResponse.json({ error: 'Class name and section arm are required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // 1. Insert class into classes table
    const { data: newClass, error: classErr } = await supabase
      .from('classes')
      .insert({
        class_name: className.trim(),
        section: section.trim(),
        wing: wing || 'Senior Secondary',
        fee_level_id: feeLevelId || null,
      })
      .select()
      .single();

    if (classErr) throw classErr;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'class.created',
      entity: 'class',
      entityId: newClass.id,
      details: { className, section, wing },
    });

    return NextResponse.json({
      success: true,
      class: newClass,
      message: `Class ${className} (${section}) provisioned successfully.`,
    });
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
    const { id, className, section, wing, feeLevelId } = body;

    if (!id || !className || !section) {
      return NextResponse.json({ error: 'Class ID, name, and section are required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const updatePayload: Record<string, any> = {
      class_name: className.trim(),
      section: section.trim(),
      wing: wing || 'Senior Secondary',
    };
    if (feeLevelId !== undefined) {
      updatePayload.fee_level_id = feeLevelId;
    }

    const { data: updatedClass, error: classErr } = await supabase
      .from('classes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (classErr) throw classErr;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'class.updated',
      entity: 'class',
      entityId: id,
      details: { className, section, wing },
    });

    return NextResponse.json({
      success: true,
      class: updatedClass,
      message: `Class ${className} (${section}) updated successfully.`,
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
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Check if class has students enrolled
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete class arm: ${count} student(s) are currently enrolled. Reassign them first.` },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'class.deleted',
      entity: 'class',
      entityId: id,
    });

    return NextResponse.json({
      success: true,
      message: 'Class arm removed successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
