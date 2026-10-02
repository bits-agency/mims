import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase && classId) {
      try {
        const supabase = getAdminClient();
        let query = supabase
          .from('attendance')
          .select('id, student_id, date, status, remark')
          .eq('class_id', classId)
          .eq('date', date);

        if (subjectId) {
          query = query.eq('subject_id', subjectId);
        }

        const { data: records, error } = await query;
        if (!error && records) {
          return NextResponse.json({ success: true, records, date });
        }
      } catch (err) {
        console.warn('Attendance load DB error:', err);
      }
    }

    return NextResponse.json({ success: true, records: [], date });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { attendanceRecords, classId, subjectId, date } = body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return NextResponse.json({ error: 'No attendance records provided' }, { status: 400 });
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const effectiveDate = date || new Date().toISOString().split('T')[0];

        const rows = attendanceRecords.map((r: any) => ({
          student_id: r.studentId,
          class_id: classId,
          subject_id: subjectId || null,
          date: effectiveDate,
          status: r.status || 'present',
          remark: r.remark || '',
        }));

        const { error: upsertErr } = await supabase
          .from('attendance')
          .upsert(rows, {
            onConflict: 'student_id,date,subject_id',
          });

        if (upsertErr) throw upsertErr;

        return NextResponse.json({
          success: true,
          count: rows.length,
          message: 'Daily roll call attendance successfully synchronized to database.',
        });
      } catch (dbErr: any) {
        console.warn('Attendance save DB error:', dbErr);
        return NextResponse.json({ error: dbErr?.message || 'Failed to save attendance' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: attendanceRecords.length, status: 'simulated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
