import { NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  let profileData: any = null;
  let liveRole = session.role;
  let liveWing = session.wing || 'all';
  let liveStatus = session.status;
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (hasSupabase) {
    try {
      const supabase = getAdminClient();

      // Fetch live user status to ensure revoked accounts cannot continue using old cookies
      const { data: dbUser } = await supabase
        .from('users')
        .select('id, role, wing, status, session_version')
        .eq('id', session.userId)
        .single();

      if (dbUser) {
        if (dbUser.status === 'suspended' || dbUser.status === 'inactive') {
          const res = NextResponse.json({ authenticated: false, error: 'Account suspended.' }, { status: 403 });
          res.cookies.delete(SESSION_COOKIE_NAME);
          return res;
        }

        // Verify session version against live DB: if password/status changed, kill cookie
        const currentVersion = dbUser.session_version ?? 0;
        const tokenVersion = session.sessionVersion ?? 0;
        if (currentVersion !== tokenVersion) {
          const res = NextResponse.json(
            { authenticated: false, error: 'Session invalidated due to security or password update.' },
            { status: 401 }
          );
          res.cookies.delete(SESSION_COOKIE_NAME);
          return res;
        }

        liveRole = dbUser.role;
        liveWing = dbUser.wing || 'all';
        liveStatus = dbUser.status;
      }

      if (liveRole === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select(`
            id,
            admission_no,
            firstname,
            lastname,
            category,
            classes (id, class_name, section, wing)
          `)
          .eq('user_id', session.userId)
          .maybeSingle();
        profileData = student;
      } else if (liveRole === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id, staff_no, firstname, lastname, department')
          .eq('user_id', session.userId)
          .maybeSingle();
        profileData = teacher;
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
  }

  const isSuperAdmin = liveRole === 'super_admin';

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      email: session.email,
      role: liveRole,
      wing: liveWing,
      isSuperAdmin,
      fullName: session.fullName,
      username: session.username,
      status: liveStatus,
      profile: profileData,
    },
  });
}
