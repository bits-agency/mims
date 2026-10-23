import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/guard';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(['teacher', 'admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const session = searchParams.get('session') || '2025/2026';
    const term = searchParams.get('term') || 'first';

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, students: [], count: 0 });
    }

    const supabase = getAdminClient();

    let studentQuery = supabase
      .from('students')
      .select(`
        id,
        admission_no,
        firstname,
        lastname,
        gender,
        category,
        photo,
        class_id,
        classes (id, class_name, section, wing)
      `)
      .not('class_id', 'is', null)
      .order('admission_no', { ascending: true });

    if (classId) {
      studentQuery = studentQuery.eq('class_id', classId);
    }

    const { data: students, error: studErr } = await studentQuery;
    if (studErr) throw studErr;

    const studentList = students || [];

    let resultsMap: Record<string, any> = {};
    if (subjectId && studentList.length > 0) {
      const studentIds = studentList.map((s) => s.id);
      const { data: results } = await supabase
        .from('results')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('session', session)
        .eq('term', term)
        .in('student_id', studentIds);

      if (results) {
        results.forEach((r) => {
          resultsMap[r.student_id] = r;
        });
      }
    }

    const enrichedStudents = studentList.map((s) => ({
      ...s,
      result: resultsMap[s.id] || null,
    }));

    return NextResponse.json({
      success: true,
      students: enrichedStudents,
      count: enrichedStudents.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
