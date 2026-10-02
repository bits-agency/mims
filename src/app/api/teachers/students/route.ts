import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const session = searchParams.get('session') || '2025/2026';
    const term = searchParams.get('term') || 'first';

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
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
          .order('admission_no', { ascending: true });

        if (classId) {
          studentQuery = studentQuery.eq('class_id', classId);
        }

        let { data: students, error: studErr } = await studentQuery;
        if (studErr) throw studErr;

        // If class has no enrolled students yet, fallback to all active students for smooth onboarding
        if (!students || students.length === 0) {
          const { data: fallbackStudents } = await supabase
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
            .limit(20);
          students = fallbackStudents || [];
        }

        let resultsMap: Record<string, any> = {};
        if (subjectId && students && students.length > 0) {
          const studentIds = students.map((s) => s.id);
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

        const enrichedStudents = (students || []).map((s) => ({
          ...s,
          result: resultsMap[s.id] || null,
        }));

        return NextResponse.json({
          success: true,
          students: enrichedStudents,
          count: enrichedStudents.length,
          source: 'supabase_database',
        });
      } catch (dbErr) {
        console.warn('Teacher students DB error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      students: [],
      count: 0,
      source: 'database_empty',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
