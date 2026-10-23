import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/auth';
import { requireSuperAdmin, logAudit } from '@/lib/guard';

export async function GET() {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, administrators: [] });
    }

    const supabase = getAdminClient();
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, username, email, role, wing, status, created_at')
      .in('role', ['admin', 'super_admin', 'bursar'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    const administrators = (users || []).map((u) => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      username: u.username,
      role: u.role,
      wing: u.wing || 'all',
      status: u.status,
      isSuperAdmin: u.role === 'super_admin',
      createdAt: u.created_at,
    }));

    return NextResponse.json({ success: true, administrators });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { fullName, email, designation, role, wing, password, username: customUsername } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (customUsername || cleanEmail.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanRole = role === 'bursar' ? 'bursar' : role === 'super_admin' ? 'super_admin' : 'admin';
    const cleanWing = wing === 'primary' || wing === 'secondary' ? wing : 'all';

    const supabase = getAdminClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const title = designation ? `${fullName.trim()} (${designation.trim()})` : fullName.trim();

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        full_name: title,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: cleanRole,
        wing: cleanWing,
        status: 'active',
      })
      .select('id, full_name, email, username, role, wing, status, created_at')
      .single();

    if (insertError) throw insertError;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'admin.created',
      entity: 'user',
      entityId: newUser.id,
      details: { role: cleanRole, wing: cleanWing, email: cleanEmail },
    });

    return NextResponse.json({
      success: true,
      message: `${cleanRole === 'bursar' ? 'Bursar' : cleanRole === 'super_admin' ? 'Super Administrator' : 'Administrator'} created successfully`,
      administrator: newUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { id, status, fullName, role, wing, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'Administrator ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Check target user
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, email, role, status')
      .eq('id', id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'Administrator not found' }, { status: 404 });
    }

    // Do not allow suspending or modifying own account through this endpoint
    if (targetUser.id === auth.session.userId && status === 'suspended') {
      return NextResponse.json({ error: 'Security constraint: You cannot suspend your own active administrator account.' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (fullName) updatePayload.full_name = fullName.trim();
    if (role && ['admin', 'super_admin', 'bursar'].includes(role)) updatePayload.role = role;
    if (wing && ['primary', 'secondary', 'all'].includes(wing)) updatePayload.wing = wing;
    if (password) {
      updatePayload.password = await hashPassword(password);
      updatePayload.session_version = 1; // invalidate existing sessions
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select('id, full_name, email, username, role, wing, status')
      .single();

    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'admin.updated',
      entity: 'user',
      entityId: id,
      details: { updatedFields: Object.keys(updatePayload) },
    });

    return NextResponse.json({ success: true, administrator: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Administrator ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Verify not deleting own account
    if (id === auth.session.userId) {
      return NextResponse.json({ error: 'Security constraint: You cannot delete your own logged-in account.' }, { status: 400 });
    }

    const { data: targetUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'Administrator not found' }, { status: 404 });
    }

    // Verify if target is a super_admin that there is at least one other super_admin remaining
    if (targetUser.role === 'super_admin') {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super_admin');

      if (!count || count <= 1) {
        return NextResponse.json(
          { error: 'Security constraint: Cannot delete the sole Super Administrator account in the system.' },
          { status: 403 }
        );
      }
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'admin.deleted',
      entity: 'user',
      entityId: id,
      details: { deletedEmail: targetUser.email, role: targetUser.role },
    });

    return NextResponse.json({ success: true, message: 'Administrator removed successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
