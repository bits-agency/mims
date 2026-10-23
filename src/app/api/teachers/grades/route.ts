import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';
import { calculateGrade } from '@/lib/utils';
import { gradesSubmissionSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['teacher', 'admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = gradesSubmissionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid grading submission data.' },
        { status: 400 }
      );
    }

    const { grades, subjectId, classId, sessionName, term, status } = parseResult.data;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const supabase = getAdminClient();

    let teacherId: string | null = null;
    if (auth.session.role === 'teacher') {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', auth.session.userId)
        .maybeSingle();

      if (!teacher) {
        return NextResponse.json(
          { error: 'Forbidden: No linked teacher profile found for this account.' },
          { status: 403 }
        );
      }

      teacherId = teacher.id;

      // Security check: Verify teacher is actually assigned to this subject
      const { data: subjectRecord } = await supabase
        .from('subjects')
        .select('id, teacher_id')
        .eq('id', subjectId)
        .maybeSingle();

      if (!subjectRecord || (subjectRecord.teacher_id && subjectRecord.teacher_id !== teacher.id)) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to submit grades for this subject.' },
          { status: 403 }
        );
      }
    }

    // Standardize grades with WAEC grading scale (CA1 <= 15, CA2 <= 15, Exam <= 70, Total <= 100)
    const upsertRows = grades.map((g) => {
      const ca1 = Math.min(15, Math.max(0, Number(g.ca1 || 0)));
      const ca2 = Math.min(15, Math.max(0, Number(g.ca2 || 0)));
      const exam = Math.min(70, Math.max(0, Number(g.exam || 0)));
      const total = Math.min(100, Math.max(0, ca1 + ca2 + exam));
      const calculated = calculateGrade(total);

      return {
        student_id: g.studentId,
        subject_id: subjectId,
        class_id: classId,
        session: sessionName,
        term: term,
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

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: status === 'submitted' ? 'grades.submitted' : 'grades.draft_saved',
      entity: 'results',
      entityId: `${subjectId}:${classId}`,
      details: {
        session: sessionName,
        term,
        studentCount: upsertRows.length,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      count: upsertRows.length,
      status,
      message:
        status === 'submitted'
          ? 'Continuous assessment & examination scores submitted to Academic Board for publication.'
          : 'Draft scores successfully saved.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
