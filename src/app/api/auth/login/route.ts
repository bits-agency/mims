import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const parseResult = loginSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid input credentials.' },
        { status: 400 }
      );
    }

    const { identifier, password } = parseResult.data;

    // Fast in-memory brute-force protection (max 10 attempts per 60 seconds per IP)
    const clientIp = getClientIp(request);
    const ipRate = checkRateLimit(`login_ip:${clientIp}`, 10, 60 * 1000);
    if (!ipRate.allowed) {
      return NextResponse.json(
        {
          error: `High volume of authentication attempts detected. Please wait ${ipRate.retryAfterSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(ipRate.retryAfterSeconds) },
        }
      );
    }

    // Check if Supabase credentials are configured
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasSupabase) {
      return NextResponse.json(
        { error: 'Database service key not configured in .env.local. SUPABASE_SERVICE_ROLE_KEY is required.' },
        { status: 503 }
      );
    }

    const supabase = getAdminClient();

    // Sanitize identifier to prevent PostgREST filter injection (remove commas, parentheses, quotes)
    const cleanIdent = identifier.trim().replace(/[(),"\\]/g, '');

    // 0. Rate limiting check (max 5 failed attempts in past 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    try {
      const { count: failCount } = await supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('identifier', cleanIdent.toLowerCase())
        .eq('success', false)
        .gte('created_at', fifteenMinutesAgo);

      if (failCount && failCount >= 5) {
        return NextResponse.json(
          { error: 'Too many failed login attempts. For security reasons, please wait 15 minutes before retrying.' },
          { status: 429 }
        );
      }
    } catch {
      // If login_attempts table is not yet migrated, continue safely
    }

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
      // Record failed attempt
      try {
        await supabase.from('login_attempts').insert({
          identifier: cleanIdent.toLowerCase(),
          ip: clientIp,
          success: false,
        });
      } catch {}

      return NextResponse.json(
        { error: 'Invalid Admission Number, username/email or password.' },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === 'suspended' || user.status === 'inactive') {
      return NextResponse.json(
        { error: 'This account has been deactivated or suspended. Please contact the school administration.' },
        { status: 403 }
      );
    }

    // Verify password against stored hash
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      try {
        await supabase.from('login_attempts').insert({
          identifier: cleanIdent.toLowerCase(),
          ip: clientIp,
          success: false,
        });
      } catch {}

      return NextResponse.json(
        { error: 'Invalid username/email or password.' },
        { status: 401 }
      );
    }

    // Record successful login attempt
    try {
      await supabase.from('login_attempts').insert({
        identifier: cleanIdent.toLowerCase(),
        ip: clientIp,
        success: true,
      });
    } catch {}

    // Read bursar wing directly from database column (no heuristics)
    const userWing: 'primary' | 'secondary' | 'all' =
      user.wing === 'primary' || user.wing === 'secondary' ? user.wing : 'all';

    // Create signed session token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      username: user.username,
      status: user.status,
      wing: userWing,
      sessionVersion: user.session_version || 0,
    });

    await setSessionCookie(token);

    // Determine redirect
    let redirectUrl = '/students/dashboard';
    if (user.role === 'admin' || user.role === 'super_admin') redirectUrl = '/admin/dashboard';
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
        wing: userWing,
        status: user.status,
      },
      redirectUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
