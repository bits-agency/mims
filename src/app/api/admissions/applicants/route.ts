import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/guard';

export async function GET() {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, applicants: [] });
    }

    const supabase = getAdminClient();
    const { data: applicants, error } = await supabase
      .from('students')
      .select(`
        id,
        admission_no,
        firstname,
        lastname,
        gender,
        dob,
        category,
        guardian_name,
        guardian_phone,
        guardian_email,
        address,
        photo,
        exam_date,
        exam_time,
        exam_venue,
        exam_status,
        exam_notes,
        application_details,
        created_at,
        classes (class_name, section),
        users (email)
      `)
      .is('class_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, applicants: applicants || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
