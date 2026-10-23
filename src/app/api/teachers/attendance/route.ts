import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(['teacher', 'admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase || !classId) {
      return NextResponse.json({ success: true, records: [], date });
    }

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
    if (error) throw error;

    return NextResponse.json({ success: true, records: records || [], date });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(['teacher', 'admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { attendanceRecords, classId, subjectId, date } = body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0 || !classId) {
      return NextResponse.json({ error: 'Valid class ID and attendance records are required' }, { status: 400 });
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const supabase = getAdminClient();
    const effectiveDate = date || new Date().toISOString().split('T')[0];

    const rows = attendanceRecords.map((r: any) => ({
      student_id: r.studentId,
      class_id: classId,
      subject_id: subjectId || null,
      date: effectiveDate,
      status: r.status === 'absent' ? 'absent' : 'present',
      remark: r.remark?.trim() || '',
      recorded_by: auth.session.userId,
    }));

    // Perform upsert with single or composite key
    const { error: upsertErr } = await supabase
      .from('attendance')
      .upsert(rows);

    if (upsertErr) throw upsertErr;

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'attendance.recorded',
      entity: 'attendance',
      entityId: `${classId}:${effectiveDate}`,
      details: { classId, subjectId, studentCount: rows.length, date: effectiveDate },
    });

    return NextResponse.json({
      success: true,
      count: rows.length,
      message: 'Daily roll call attendance successfully recorded in database.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
