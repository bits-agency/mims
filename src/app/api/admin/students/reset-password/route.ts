import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/auth';
import { requireAuth, logAudit } from '@/lib/guard';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const { studentId, newPassword } = await request.json();

    if (!studentId || !newPassword || String(newPassword).trim().length < 6) {
      return NextResponse.json(
        { error: 'Valid student ID and a new password (min 6 characters) are required.' },
        { status: 400 }
      );
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const supabase = getAdminClient();

    // 1. Get student's user_id
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, user_id, firstname, lastname, admission_no')
      .eq('id', studentId)
      .single();

    if (studentError || !student || !student.user_id) {
      return NextResponse.json({ error: 'Student record or linked portal user account not found.' }, { status: 404 });
    }

    // 2. Hash new password and bump session version
    const hashedPassword = await hashPassword(newPassword.trim());

    const { error: userError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        session_version: 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', student.user_id);

    if (userError) throw userError;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'student.password_reset',
      entity: 'user',
      entityId: student.user_id,
      details: { studentId: student.id, admission_no: student.admission_no },
    });

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for student ${student.firstname} ${student.lastname} (${student.admission_no}).`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
