import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref')?.trim();

    if (!ref || ref.length < 3) {
      return NextResponse.json({ error: 'Please enter a valid Application Reference or Registered Email.' }, { status: 400 });
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const supabase = getAdminClient();
    const cleanRef = ref.replace(/[(),"\\]/g, '');

    // 1. Search applicant by exact admission_no / application reference
    let { data: applicant } = await supabase
      .from('students')
      .select(`
        id,
        admission_no,
        firstname,
        lastname,
        exam_date,
        exam_time,
        exam_venue,
        exam_status,
        exam_notes,
        created_at
      `)
      .ilike('admission_no', cleanRef)
      .maybeSingle();

    // 2. If not found by reference, try by guardian email
    if (!applicant) {
      const { data: byEmail } = await supabase
        .from('students')
        .select(`
          id,
          admission_no,
          firstname,
          lastname,
          exam_date,
          exam_time,
          exam_venue,
          exam_status,
          exam_notes,
          created_at
        `)
        .ilike('guardian_email', cleanRef)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      applicant = byEmail;
    }

    if (!applicant) {
      return NextResponse.json({ success: true, applicant: null, message: 'No registered applicant matching this query was found.' });
    }

    // Return safe public schedule details only (no medical, address, or guardian personal details)
    return NextResponse.json({
      success: true,
      applicant: {
        name: `${applicant.firstname} ${applicant.lastname}`.trim(),
        refNo: applicant.admission_no,
        status: applicant.exam_status || 'scheduled',
        examDate: applicant.exam_date || 'Saturday, 18th July 2026',
        examTime: applicant.exam_time || '09:00 AM Prompt',
        examVenue: applicant.exam_venue || 'MSSN Campus Complex Main Hall, Km 4 Oba-Ile Road, Akure',
        instructions:
          applicant.exam_notes ||
          'Please arrive at least 30 minutes before exam time. Candidates must bring their printed examination slip, two 2B pencils, an eraser, and their original birth certificate for physical verification.',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
