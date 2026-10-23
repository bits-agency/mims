import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_CONFIG = {
  isOpen: true,
  is_open: true,
  targetSession: '2026/2027 Academic Session',
  target_session: '2026/2027 Academic Session',
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
};

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
          .maybeSingle();

        if (!error && data) {
          const config = {
            isOpen: Boolean(data.is_open),
            is_open: Boolean(data.is_open),
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
          };
          return NextResponse.json(
            { success: true, config, source: 'supabase_database' },
            { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
          );
        }
      } catch (err) {
        console.warn('Admissions gate DB error:', err);
      }
    }

    return NextResponse.json(
      { success: true, config: DEFAULT_CONFIG, source: 'database_defaults' },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    );
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
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const resolvedIsOpen =
      typeof body.isOpen === 'boolean'
        ? body.isOpen
        : typeof body.is_open === 'boolean'
        ? body.is_open
        : true;

    const updatedConfig = {
      is_open: resolvedIsOpen,
      target_session: body.targetSession || body.target_session || '2026/2027 Academic Session',
      application_deadline: body.applicationDeadline || body.application_deadline || '2026-07-15',
      entrance_exam_date: body.entranceExamDate || body.entrance_exam_date || '2026-07-18',
      entrance_exam_time: body.entranceExamTime || body.entrance_exam_time || '09:00 AM Prompt',
      exam_venue: body.examVenue || body.exam_venue || 'MSSN Campus Complex Main Hall, Km 4 Oba-Ile Road, Akure',
      day_form_fee: Number(body.dayFormFee || body.day_form_fee || 5000),
      boarding_form_fee: Number(body.boardingFormFee || body.boarding_form_fee || 10000),
      announcement_notice: body.announcementNotice || body.announcement_notice || '',
      closed_notice: body.closedNotice || body.closed_notice || '',
      updated_at: new Date().toISOString(),
    };

    const supabase = getAdminClient();
    const { data: existing } = await supabase.from('admissions_gate').select('id').limit(1).maybeSingle();

    if (existing?.id) {
      const { error: updErr } = await supabase
        .from('admissions_gate')
        .update(updatedConfig)
        .eq('id', existing.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from('admissions_gate')
        .insert(updatedConfig);
      if (insErr) throw insErr;
    }

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: resolvedIsOpen ? 'admissions_gate.opened' : 'admissions_gate.closed',
      entity: 'admissions_gate',
      details: { is_open: resolvedIsOpen, target_session: updatedConfig.target_session },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Admissions gate successfully ${resolvedIsOpen ? 'OPENED' : 'CLOSED'}.`,
        config: {
          ...updatedConfig,
          isOpen: resolvedIsOpen,
          targetSession: updatedConfig.target_session,
        },
      },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
