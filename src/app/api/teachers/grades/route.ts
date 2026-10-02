import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';

function calculateGrade(total: number) {
  if (total >= 75) return { grade: 'A1', remark: 'Excellent' };
  if (total >= 70) return { grade: 'B2', remark: 'Very Good' };
  if (total >= 65) return { grade: 'B3', remark: 'Good' };
  if (total >= 60) return { grade: 'C4', remark: 'Credit' };
  if (total >= 55) return { grade: 'C5', remark: 'Credit' };
  if (total >= 50) return { grade: 'C6', remark: 'Credit' };
  if (total >= 45) return { grade: 'D7', remark: 'Pass' };
  if (total >= 40) return { grade: 'E8', remark: 'Pass' };
  return { grade: 'F9', remark: 'Fail' };
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { grades, subjectId, classId, sessionName, term, status = 'draft' } = body;

    if (!Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json({ error: 'No grade records provided' }, { status: 400 });
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();

        let teacherId: string | null = null;
        if (session?.userId) {
          const { data: teacher } = await supabase
            .from('teachers')
            .select('id')
            .eq('user_id', session.userId)
            .maybeSingle();
          if (teacher) teacherId = teacher.id;
        }

        const upsertRows = grades.map((g: any) => {
          const ca1 = Number(g.ca1 || 0);
          const ca2 = Number(g.ca2 || 0);
          const exam = Number(g.exam || 0);
          const total = Math.min(100, Math.max(0, ca1 + ca2 + exam));
          const calculated = calculateGrade(total);

          return {
            student_id: g.studentId,
            subject_id: subjectId,
            class_id: classId,
            session: sessionName || '2025/2026',
            term: term || 'first',
            ca1,
            ca2,
            exam,
            total,
            grade: calculated.grade,
            remark: g.remark?.trim() || calculated.remark,
            status: status === 'submitted' ? 'submitted' : 'draft',
            teacher_id: teacherId,
            updated_at: new Date().toISOString(),
          };
        });

        const { error: upsertErr } = await supabase
          .from('results')
          .upsert(upsertRows, {
            onConflict: 'student_id,subject_id,session,term',
          });

        if (upsertErr) throw upsertErr;

        return NextResponse.json({
          success: true,
          count: upsertRows.length,
          status,
          message: status === 'submitted' 
            ? 'Scores successfully submitted to VP Academics for moderation.' 
            : 'Draft scores saved successfully.',
        });
      } catch (dbErr: any) {
        console.warn('Grades save DB error:', dbErr);
        return NextResponse.json({ error: dbErr?.message || 'Failed to save scores in database' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: grades.length, status: 'simulated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
