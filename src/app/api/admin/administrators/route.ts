import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

async function checkSuperAdmin() {
  const session = await getSession();
  if (!session) return false;
  return session.email?.toLowerCase() === 'bamiebot@gmail.com' || session.role === 'super_admin';
}

export async function GET() {
  try {
    const isSuper = await checkSuperAdmin();
    if (!isSuper) {
      return NextResponse.json({ error: 'Unauthorized. Super Administrator access required.' }, { status: 403 });
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, administrators: [] });
    }

    const supabase = getAdminClient();
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, username, email, role, status, created_at')
      .in('role', ['admin', 'super_admin', 'bursar'])
      .order('created_at', { ascending: true });

    if (error) throw error;

    const administrators = (users || []).map((u) => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      username: u.username,
      role: u.role,
      status: u.status,
      isSuperAdmin: u.email?.toLowerCase() === 'bamiebot@gmail.com' || u.role === 'super_admin',
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
    const isSuper = await checkSuperAdmin();
    if (!isSuper) {
      return NextResponse.json({ error: 'Unauthorized. Super Administrator access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { fullName, email, designation, role, password, username: customUsername } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (customUsername || cleanEmail.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanRole = role === 'bursar' ? 'bursar' : 'admin';

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

    const hashedPassword = await bcrypt.hash(password, 10);
    const title = designation ? `${fullName.trim()} (${designation.trim()})` : fullName.trim();

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        full_name: title,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: cleanRole,
        status: 'active',
      })
      .select('id, full_name, email, username, role, status, created_at')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      message: `${cleanRole === 'bursar' ? 'Bursar' : 'Administrator'} created successfully`,
      administrator: newUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const isSuper = await checkSuperAdmin();
    if (!isSuper) {
      return NextResponse.json({ error: 'Unauthorized. Super Administrator access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, fullName, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'Administrator ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Check target user
    const { data: targetUser } = await supabase.from('users').select('email').eq('id', id).single();
    if (!targetUser) {
      return NextResponse.json({ error: 'Administrator not found' }, { status: 404 });
    }

    if (targetUser.email?.toLowerCase() === 'bamiebot@gmail.com') {
      return NextResponse.json({ error: 'The primary Super Administrator account cannot be modified or suspended.' }, { status: 403 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (fullName) updatePayload.full_name = fullName.trim();
    if (password) {
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select('id, full_name, email, username, role, status')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, administrator: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isSuper = await checkSuperAdmin();
    if (!isSuper) {
      return NextResponse.json({ error: 'Unauthorized. Super Administrator access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Administrator ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Verify not deleting super admin
    const { data: targetUser } = await supabase.from('users').select('email').eq('id', id).single();
    if (!targetUser) {
      return NextResponse.json({ error: 'Administrator not found' }, { status: 404 });
    }

    if (targetUser.email?.toLowerCase() === 'bamiebot@gmail.com') {
      return NextResponse.json({ error: 'Security constraint: The root Super Administrator account cannot be deleted.' }, { status: 403 });
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Administrator removed successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
