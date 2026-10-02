import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();

        let teacherRecord: any = null;
        if (session?.userId) {
          const { data: teacher } = await supabase
            .from('teachers')
            .select('id, staff_no, firstname, lastname, department')
            .eq('user_id', session.userId)
            .maybeSingle();
          teacherRecord = teacher;
        }

        // Fetch subjects allocated to this teacher
        let query = supabase
          .from('subjects')
          .select(`
            id,
            subject_name,
            class_id,
            teacher_id,
            classes (id, class_name, section, wing)
          `);

        if (teacherRecord?.id) {
          query = query.eq('teacher_id', teacherRecord.id);
        }

        let { data: allocations, error } = await query;

        // If no specific allocations found for this teacher or unassigned, load available school subjects
        if (!allocations || allocations.length === 0) {
          const { data: allSubjects } = await supabase
            .from('subjects')
            .select(`
              id,
              subject_name,
              class_id,
              teacher_id,
              classes (id, class_name, section, wing)
            `)
            .limit(10);
          allocations = allSubjects || [];
        }

        return NextResponse.json({
          success: true,
          teacher: teacherRecord,
          allocations: allocations || [],
          source: 'supabase_database',
        });
      } catch (dbErr) {
        console.warn('Teacher allocations DB query error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      teacher: null,
      allocations: [],
      source: 'database_empty',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
