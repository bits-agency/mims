import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (session && (session.email?.toLowerCase() === 'bamiebot@gmail.com' || session.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Governing Board / Super Admin is in supervisory mode only. Operational student scheduling and enrollment must be performed by the School Principal / Admin.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, studentId, examDate, examTime, examVenue, classArm, newAdmissionNo } = body;

    if (!studentId || !action) {
      return NextResponse.json({ error: 'Missing required parameters: action and studentId' }, { status: 400 });
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, message: 'Action processed (local fallback)' });
    }

    const supabase = getAdminClient();

    if (action === 'schedule') {
      const { data, error } = await supabase
        .from('students')
        .update({
          exam_date: examDate || null,
          exam_time: examTime || '09:00 AM Prompt',
          exam_venue: examVenue || 'MSSN Campus Complex Main Hall',
          exam_status: 'scheduled',
        })
        .eq('id', studentId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({ success: true, student: data });
    }

    if (action === 'enrol') {
      // Find matching class ID
      let classId: string | null = null;
      if (classArm) {
        const parts = classArm.trim().split(' ');
        const section = parts.pop() || '';
        const className = parts.join(' ');

        const { data: cls } = await supabase
          .from('classes')
          .select('id')
          .ilike('class_name', `%${className}%`)
          .limit(1)
          .single();

        if (cls) {
          classId = cls.id;
        } else {
          // fallback to any first class
          const { data: anyCls } = await supabase.from('classes').select('id').limit(1).single();
          if (anyCls) classId = anyCls.id;
        }
      }

      // Generate or use provided matriculation number
      const matricNo = newAdmissionNo || `MIMS/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;

      const { data: updatedStudent, error: enrolError } = await supabase
        .from('students')
        .update({
          admission_no: matricNo,
          class_id: classId,
          exam_status: 'passed',
        })
        .eq('id', studentId)
        .select()
        .single();

      if (enrolError) {
        throw new Error(enrolError.message);
      }

      // Activate student user account
      if (updatedStudent.user_id) {
        await supabase
          .from('users')
          .update({ status: 'active' })
          .eq('id', updatedStudent.user_id);
      }

      return NextResponse.json({ success: true, student: updatedStudent, matricNo });
    }

    if (action === 'reject') {
      const { data, error } = await supabase
        .from('students')
        .update({ exam_status: 'failed' })
        .eq('id', studentId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({ success: true, student: data });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
