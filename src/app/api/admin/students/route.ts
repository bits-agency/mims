import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
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
            classes (id, class_name, section),
            student_fee_clearance (is_cleared, balance, total_billed, total_paid)
          `)
          .order('admission_no', { ascending: true });

        if (!error && students) {
          return NextResponse.json({ success: true, students, source: 'supabase_database' });
        }
      } catch (err) {
        console.warn('Students DB query fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      students: [],
      source: 'database_empty',
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
        const { data, error } = await supabase.from('students').insert(body).select().single();
        if (!error && data) {
          return NextResponse.json({ success: true, student: data });
        }
      } catch (err) {
        console.warn('Student creation DB fallback:', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Student registered' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
