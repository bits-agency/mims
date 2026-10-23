import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, students: [] });
    }

    const { searchParams } = new URL(request.url);
    const wingFilter = searchParams.get('wing')?.toLowerCase();

    const supabase = getAdminClient();
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        id,
        admission_no,
        firstname,
        lastname,
        gender,
        category,
        guardian_name,
        guardian_phone,
        guardian_email,
        classes (id, class_name, section, wing),
        student_fee_clearance (id, is_cleared, balance, total_billed, total_paid, session, term)
      `)
      .not('class_id', 'is', null)
      .order('admission_no', { ascending: true });

    if (error) throw error;

    let filtered = students || [];
    if (wingFilter === 'primary') {
      filtered = filtered.filter((s: any) => {
        const w = s.classes?.wing?.toLowerCase() || '';
        return w.includes('primary') || w.includes('nursery');
      });
    } else if (wingFilter === 'secondary') {
      filtered = filtered.filter((s: any) => {
        const w = s.classes?.wing?.toLowerCase() || '';
        return w.includes('secondary');
      });
    }

    return NextResponse.json({ success: true, students: filtered });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const supabase = getAdminClient();

    const { data, error } = await supabase.from('students').insert(body).select().single();
    if (error) throw error;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'student.registered',
      entity: 'student',
      entityId: data.id,
      details: { admission_no: data.admission_no, name: `${data.firstname} ${data.lastname}` },
    });

    return NextResponse.json({ success: true, student: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
