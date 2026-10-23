import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { requireAuth, logAudit } from '@/lib/guard';
import { changePasswordSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = changePasswordSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Current password and valid new password are required.' },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parseResult.data;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json(
        { error: 'Database service configuration missing.' },
        { status: 503 }
      );
    }

    const supabase = getAdminClient();

    // Fetch user from DB
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, password, session_version')
      .eq('id', auth.session.userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // MANDATORY current password verification (cannot be bypassed)
    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Current password is incorrect. Please enter your existing password correctly.' },
        { status: 400 }
      );
    }

    // Hash and update new password + bump session_version to invalidate stolen sessions
    const hashedPassword = await hashPassword(newPassword.trim());
    const nextSessionVersion = (user.session_version || 0) + 1;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        session_version: nextSessionVersion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auth.session.userId);

    if (updateError) {
      throw updateError;
    }

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'user.password_changed',
      entity: 'user',
      entityId: auth.session.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
