import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { getSession, verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters in length.' },
        { status: 400 }
      );
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, message: 'Password updated (local mode)' });
    }

    const supabase = getAdminClient();

    // Fetch user from DB
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, password')
      .eq('id', session.userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // If current password provided, verify it
    if (currentPassword) {
      const isMatch = await verifyPassword(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Current password is incorrect. Please re-enter your existing password.' },
          { status: 400 }
        );
      }
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword.trim());

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
