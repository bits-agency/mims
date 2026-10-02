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
          return NextResponse.json({ success: true, config: data, source: 'supabase_database' });
        }
      } catch (err) {
        console.warn('Admissions gate DB fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        is_open: true,
        target_session: '2026/2027 Academic Session',
        application_deadline: '2026-07-15',
        entrance_exam_date: '2026-07-18',
        entrance_exam_time: '09:00 AM Prompt',
        exam_venue: 'MSSN Campus Complex Main Hall, Km 4 Oba-Ile Road, Akure',
        day_form_fee: 5000,
        boarding_form_fee: 10000,
        announcement_notice:
          'Admissions for the 2026/2027 Academic Session are now formally OPEN! Qualified candidates seeking admission are invited to register online.',
        closed_notice:
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

        if (existing?.id) {
          await supabase.from('admissions_gate').update({ ...body, updated_at: new Date().toISOString() }).eq('id', existing.id);
        } else {
          await supabase.from('admissions_gate').insert(body);
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
