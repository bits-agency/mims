import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/guard';

export async function GET() {
  try {
    const auth = await requireAuth(['teacher', 'admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, teacher: null, allocations: [] });
    }

    const supabase = getAdminClient();

    let teacherRecord: any = null;
    if (auth.session.role === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id, staff_no, firstname, lastname, department')
        .eq('user_id', auth.session.userId)
        .maybeSingle();
      teacherRecord = teacher;
    }

    let query = supabase
      .from('subjects')
      .select(`
        id,
        subject_name,
        class_id,
        teacher_id,
        classes (id, class_name, section, wing)
      `);

    if (teacherRecord?.id) {
      query = query.eq('teacher_id', teacherRecord.id);
    }

    const { data: allocations, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      teacher: teacherRecord,
      allocations: allocations || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
