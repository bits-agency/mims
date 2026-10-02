import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { getSession, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. School Administrator access required.' },
        { status: 403 }
      );
    }

    const { studentId, newPassword } = await request.json();

    if (!studentId || !newPassword) {
      return NextResponse.json(
        { error: 'Student ID and new password are required' },
        { status: 400 }
      );
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, message: 'Password reset (mock)' });
    }

    const supabase = getAdminClient();

    // 1. Get student's user_id
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, user_id, firstname, lastname, admission_no')
      .eq('id', studentId)
      .single();

    if (studentError || !student || !student.user_id) {
      return NextResponse.json({ error: 'Student record or associated user account not found.' }, { status: 404 });
    }

    // 2. Hash new password and update user record
    const hashedPassword = await hashPassword(newPassword.trim());

    const { error: userError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', student.user_id);

    if (userError) throw userError;

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for student ${student.firstname} ${student.lastname} (${student.admission_no}). New password: ${newPassword.trim()}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
