import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
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
            created_at,
            classes (class_name, section),
            users (email)
          `)
          .is('class_id', null)
          .order('created_at', { ascending: false });

        if (!error && applicants) {
          return NextResponse.json({ success: true, applicants, source: 'supabase_database' });
        }
      } catch (err) {
        console.warn('Applicants DB query fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      applicants: [],
      source: 'database_empty',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
