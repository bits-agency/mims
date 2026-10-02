import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionName = searchParams.get('session') || '2025/2026';
    const term = searchParams.get('term') || 'first';

    const session = await getSession();
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase && session?.userId) {
      try {
        const supabase = getAdminClient();

        // 1. Get student profile
        const { data: student } = await supabase
          .from('students')
          .select('id, admission_no, firstname, lastname, class_id, classes(class_name, section)')
          .eq('user_id', session.userId)
          .single();

        if (student) {
          // 2. Check fee clearance
          const { data: clearance } = await supabase
            .from('student_fee_clearance')
            .select('is_cleared, balance')
            .eq('student_id', student.id)
            .eq('session', sessionName)
            .eq('term', term)
            .single();

          // 3. Check term release
          const { data: termData } = await supabase
            .from('academic_terms')
            .select('results_released')
            .eq('term_number', term === 'first' ? 1 : term === 'second' ? 2 : 3)
            .single();

          // 4. Get results
          const { data: results } = await supabase
            .from('results')
            .select('ca1, ca2, exam, total, grade, remark, subjects(subject_name)')
            .eq('student_id', student.id)
            .eq('session', sessionName)
            .eq('term', term);

          return NextResponse.json({
            success: true,
            student,
            isCleared: clearance?.is_cleared ?? false,
            balance: Number(clearance?.balance || 0),
            isReleased: termData?.results_released ?? false,
            results: results || [],
            source: 'supabase_database',
          });
        }
      } catch (err) {
        console.warn('Student results DB query fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      student: null,
      isCleared: false,
      balance: 0,
      isReleased: false,
      results: [],
      source: 'database_empty',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
