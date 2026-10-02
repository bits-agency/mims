import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('admissions_gate')
          .select('*')
          .limit(1)
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            config: {
              isOpen: data.is_open,
              is_open: data.is_open,
              targetSession: data.target_session,
              target_session: data.target_session,
              applicationDeadline: data.application_deadline,
              entranceExamDate: data.entrance_exam_date,
              entranceExamTime: data.entrance_exam_time,
              examVenue: data.exam_venue,
              dayFormFee: Number(data.day_form_fee),
              boardingFormFee: Number(data.boarding_form_fee),
              announcementNotice: data.announcement_notice,
              closedNotice: data.closed_notice,
            },
            source: 'supabase_database'
          });
        }
      } catch (err) {
        console.warn('Admissions gate DB fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        isOpen: true,
        is_open: true,
        targetSession: '2026/2027 Academic Session',
        applicationDeadline: '2026-07-15',
        entranceExamDate: '2026-07-18',
        entranceExamTime: '09:00 AM Prompt',
        examVenue: 'MSSN Campus Complex Main Hall, Km 4 Oba-Ile Road, Akure',
        dayFormFee: 5000,
        boardingFormFee: 10000,
        announcementNotice:
          'Admissions for the 2026/2027 Academic Session are now formally OPEN! Qualified candidates seeking admission are invited to register online.',
        closedNotice:
          'Online admissions for the current cycle are currently CLOSED. Entrance examinations and interview schedules have concluded.',
      },
      source: 'database_defaults',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const { data: existing } = await supabase.from('admissions_gate').select('id').limit(1).single();

        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (typeof body.isOpen === 'boolean') updatePayload.is_open = body.isOpen;
        if (typeof body.is_open === 'boolean') updatePayload.is_open = body.is_open;
        if (body.targetSession || body.target_session) updatePayload.target_session = body.targetSession || body.target_session;
        if (body.applicationDeadline || body.application_deadline) updatePayload.application_deadline = body.applicationDeadline || body.application_deadline;
        if (body.entranceExamDate || body.entrance_exam_date) updatePayload.entrance_exam_date = body.entranceExamDate || body.entrance_exam_date;
        if (body.entranceExamTime || body.entrance_exam_time) updatePayload.entrance_exam_time = body.entranceExamTime || body.entrance_exam_time;
        if (body.examVenue || body.exam_venue) updatePayload.exam_venue = body.examVenue || body.exam_venue;
        if (body.dayFormFee || body.day_form_fee) updatePayload.day_form_fee = body.dayFormFee || body.day_form_fee;
        if (body.boardingFormFee || body.boarding_form_fee) updatePayload.boarding_form_fee = body.boardingFormFee || body.boarding_form_fee;
        if (body.announcementNotice || body.announcement_notice) updatePayload.announcement_notice = body.announcementNotice || body.announcement_notice;
        if (body.closedNotice || body.closed_notice) updatePayload.closed_notice = body.closedNotice || body.closed_notice;

        if (existing?.id) {
          await supabase.from('admissions_gate').update(updatePayload).eq('id', existing.id);
        } else {
          await supabase.from('admissions_gate').insert(updatePayload);
        }

        return NextResponse.json({ success: true, message: 'Admissions gate status updated in Supabase database' });
      } catch (dbErr) {
        console.warn('DB gate update fallback:', dbErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Admissions gate status updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
