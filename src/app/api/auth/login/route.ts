import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email or username and password are required' },
        { status: 400 }
      );
    }

    // Check if Supabase credentials are configured
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasSupabase) {
      return NextResponse.json(
        { error: 'Database service key not configured in .env.local. Please provide SUPABASE_SERVICE_ROLE_KEY to authenticate live production users.' },
        { status: 503 }
      );
    }

    const supabase = getAdminClient();
    const cleanIdent = identifier.trim();

    // 1. Search by email or username in users table
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${cleanIdent},username.ilike.${cleanIdent}`)
      .maybeSingle();

    // 2. If not found, check if identifier is a student Admission Number
    if (!user) {
      const { data: student } = await supabase
        .from('students')
        .select('user_id, admission_no')
        .ilike('admission_no', cleanIdent)
        .maybeSingle();

      if (student?.user_id) {
        const { data: userFromStudent } = await supabase
          .from('users')
          .select('*')
          .eq('id', student.user_id)
          .maybeSingle();

        if (userFromStudent) {
          user = userFromStudent;
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid Admission Number, username/email or password' },
        { status: 401 }
      );
    }

    // Check active status
    if (user.status === 'inactive') {
      return NextResponse.json(
        { error: 'This account has been deactivated. Please contact the school administration.' },
        { status: 403 }
      );
    }

    // Verify password against stored hash or fallback check
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid username/email or password' }, { status: 401 });
    }

    // Determine bursar wing scope if applicable
    let bursarWing: 'primary' | 'secondary' | 'all' = 'all';
    if (user.role === 'bursar') {
      const identStr = `${user.email || ''} ${user.username || ''} ${user.full_name || ''}`.toLowerCase();
      if (identStr.includes('primary')) {
        bursarWing = 'primary';
      } else if (identStr.includes('secondary')) {
        bursarWing = 'secondary';
      }
    }

    // Create session token with real user payload
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      username: user.username,
      status: user.status,
      wing: bursarWing,
    });

    await setSessionCookie(token);

    let redirectUrl = '/students/dashboard';
    if (user.role === 'admin') redirectUrl = '/admin/dashboard';
    else if (user.role === 'teacher') redirectUrl = '/teachers/dashboard';
    else if (user.role === 'bursar') redirectUrl = '/bursar/dashboard';
    else if (user.status === 'pending') redirectUrl = '/admissions/status';

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        wing: bursarWing,
        status: user.status,
      },
      redirectUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
