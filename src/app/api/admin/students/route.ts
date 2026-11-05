import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';
import { studentRegistrationSchema } from '@/lib/validation';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin', 'bursar']);
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

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = studentRegistrationSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Invalid student profile registration data.' },
        { status: 400 }
      );
    }

    const {
      firstname,
      lastname,
      gender,
      dob,
      category,
      class_id,
      guardian_name,
      guardian_phone,
      guardian_email,
      address,
      photo,
    } = parseResult.data;

    const supabase = getAdminClient();

    // Generate collision-free admission number
    let admissionNo = '';
    try {
      const { data: codeData } = await supabase.rpc('next_code', { p_kind: 'admission' });
      admissionNo = codeData || '';
    } catch {}

    if (!admissionNo) {
      const currentYear = new Date().getFullYear();
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .not('class_id', 'is', null);
      const seq = (count || 0) + 1;
      admissionNo = `MIMS/${currentYear}/${String(seq).padStart(4, '0')}`;
    }

    // Create user login account for the student
    const defaultPassword = 'Student@12345';
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const cleanUsername = admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '');
    const studentEmail = guardian_email || `${cleanUsername}@mims.sch.ng`;

    const { data: studentUser, error: userErr } = await supabase
      .from('users')
      .insert({
        full_name: `${firstname} ${lastname}`.trim(),
        username: cleanUsername,
        email: studentEmail,
        password: hashedPassword,
        role: 'student',
        status: 'active',
      })
      .select('id')
      .single();

    if (userErr || !studentUser) {
      return NextResponse.json(
        { error: `Failed to create user login profile: ${userErr?.message || 'Database error'}` },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('students')
      .insert({
        user_id: studentUser.id,
        admission_no: admissionNo,
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        gender: gender.toLowerCase() === 'female' ? 'female' : 'male',
        dob: dob || null,
        category,
        class_id: class_id || null,
        guardian_name: guardian_name?.trim() || null,
        guardian_phone: guardian_phone?.trim() || null,
        guardian_email: guardian_email?.trim() || null,
        address: address?.trim() || null,
        photo: photo || null,
        exam_status: 'passed',
      })
      .select()
      .single();

    if (error) {
      await supabase.from('users').delete().eq('id', studentUser.id);
      throw error;
    }

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'student.registered',
      entity: 'student',
      entityId: data.id,
      details: { admission_no: data.admission_no, name: `${data.firstname} ${data.lastname}` },
    });

    return NextResponse.json({ success: true, student: data, tempPassword: defaultPassword });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
