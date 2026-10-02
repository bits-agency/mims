import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  let profileData: any = null;
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (hasSupabase && session.userId) {
    try {
      const supabase = getAdminClient();
      if (session.role === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select(`
            id,
            admission_no,
            firstname,
            lastname,
            category,
            classes (id, class_name, section)
          `)
          .eq('user_id', session.userId)
          .single();
        profileData = student;
      } else if (session.role === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id, staff_no, firstname, lastname, department')
          .eq('user_id', session.userId)
          .single();
        profileData = teacher;
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
  }

    const isSuperAdmin = session.email?.toLowerCase() === 'bamiebot@gmail.com' || session.role === 'super_admin';

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        isSuperAdmin,
        fullName: session.fullName,
        username: session.username,
        status: session.status,
        profile: profileData,
      },
    });
}
