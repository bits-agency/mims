import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';
import { admissionsActionSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = admissionsActionSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid parameters provided.' },
        { status: 400 }
      );
    }

    const { action, studentId, examDate, examTime, examVenue, classId: providedClassId, classArm, newAdmissionNo } = parseResult.data;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const supabase = getAdminClient();

    // Verify student exists
    const { data: student, error: fetchErr } = await supabase
      .from('students')
      .select('id, user_id, firstname, lastname, admission_no, exam_status')
      .eq('id', studentId)
      .single();

    if (fetchErr || !student) {
      return NextResponse.json({ error: 'Applicant record not found.' }, { status: 404 });
    }

    if (action === 'schedule') {
      const { data, error } = await supabase
        .from('students')
        .update({
          exam_date: examDate || null,
          exam_time: examTime || '09:00 AM Prompt',
          exam_venue: examVenue || 'MSSN Campus Complex Main Hall, Km 4 Oba-Ile Road, Akure',
          exam_status: 'scheduled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)
        .select()
        .single();

      if (error) throw error;

      await logAudit({
        actorId: auth.session.userId,
        actorRole: auth.session.role,
        action: 'admissions.scheduled',
        entity: 'student',
        entityId: studentId,
        details: { examDate, examTime, examVenue },
      });

      return NextResponse.json({ success: true, student: data });
    }

    if (action === 'enrol') {
      let resolvedClassId: string | null = providedClassId || null;

      // Match class by ID or explicit name & section
      if (!resolvedClassId && classArm) {
        const parts = classArm.trim().split(' ');
        const section = parts.length > 1 ? parts.pop() : '';
        const className = parts.join(' ');

        if (section) {
          const { data: matched } = await supabase
            .from('classes')
            .select('id')
            .ilike('class_name', `%${className}%`)
            .ilike('section', section)
            .maybeSingle();
          if (matched) resolvedClassId = matched.id;
        }

        if (!resolvedClassId) {
          const { data: matchedName } = await supabase
            .from('classes')
            .select('id')
            .ilike('class_name', `%${className || classArm}%`)
            .limit(1)
            .maybeSingle();
          if (matchedName) resolvedClassId = matchedName.id;
        }
      }

      if (!resolvedClassId) {
        return NextResponse.json(
          { error: 'Valid class allocation is required to enrol student. Please select an existing class arm.' },
          { status: 400 }
        );
      }

      // Generate sequential, collision-free matriculation number
      let matricNo = newAdmissionNo?.trim();
      if (!matricNo) {
        const currentYear = new Date().getFullYear();
        // Count enrolled students to generate a sequential number
        const { count } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .not('class_id', 'is', null);

        const seq = (count || 0) + 1;
        matricNo = `MIMS/${currentYear}/${String(seq).padStart(4, '0')}`;

        // Ensure uniqueness
        const { data: dupCheck } = await supabase
          .from('students')
          .select('id')
          .eq('admission_no', matricNo)
          .maybeSingle();

        if (dupCheck) {
          matricNo = `MIMS/${currentYear}/${String(seq + Math.floor(10 + Math.random() * 89)).padStart(4, '0')}`;
        }
      }

      const { data: updatedStudent, error: enrolError } = await supabase
        .from('students')
        .update({
          admission_no: matricNo,
          class_id: resolvedClassId,
          exam_status: 'passed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)
        .select(`
          id,
          admission_no,
          firstname,
          lastname,
          class_id,
          classes (id, class_name, section, wing)
        `)
        .single();

      if (enrolError) throw enrolError;

      // Activate student user account
      if (student.user_id) {
        await supabase
          .from('users')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', student.user_id);
      }

      await logAudit({
        actorId: auth.session.userId,
        actorRole: auth.session.role,
        action: 'admissions.enrolled',
        entity: 'student',
        entityId: studentId,
        details: { matricNo, classId: resolvedClassId, applicantName: `${student.firstname} ${student.lastname}` },
      });

      return NextResponse.json({ success: true, student: updatedStudent, matricNo });
    }

    if (action === 'reject') {
      const { data, error } = await supabase
        .from('students')
        .update({
          exam_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)
        .select()
        .single();

      if (error) throw error;

      await logAudit({
        actorId: auth.session.userId,
        actorRole: auth.session.role,
        action: 'admissions.rejected',
        entity: 'student',
        entityId: studentId,
        details: { applicantName: `${student.firstname} ${student.lastname}` },
      });

      return NextResponse.json({ success: true, student: data });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
