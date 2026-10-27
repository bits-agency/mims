import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/guard';
import { getLeviesForStudentClass } from '@/lib/bursary';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(['student', 'admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const sessionName = searchParams.get('session') || '2025/2026';
    const term = (searchParams.get('term') as 'first' | 'second' | 'third') || 'first';
    const queryStudentId = searchParams.get('studentId');

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({
        success: true,
        student: null,
        isCleared: false,
        balance: 0,
        isReleased: false,
        results: [],
      });
    }

    const supabase = getAdminClient();

    // 1. Identify target student
    let studentId: string | null = null;
    if (auth.session.role === 'student') {
      const { data: studentRecord } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', auth.session.userId)
        .single();
      studentId = studentRecord?.id || null;
    } else {
      // Admin/Super Admin inspecting a student's broadsheet
      studentId = queryStudentId || null;
    }

    if (!studentId) {
      return NextResponse.json({ error: 'Student record could not be identified.' }, { status: 404 });
    }

    // 2. Fetch student profile
    const { data: student, error: studErr } = await supabase
      .from('students')
      .select('id, admission_no, firstname, lastname, class_id, classes(id, class_name, section, wing)')
      .eq('id', studentId)
      .single();

    if (studErr || !student) {
      return NextResponse.json({ error: 'Student details not found.' }, { status: 404 });
    }

    // 3. Check fee clearance for this student, session, and term
    const { data: clearance } = await supabase
      .from('student_fee_clearance')
      .select('is_cleared, balance, total_billed, total_paid')
      .eq('student_id', student.id)
      .eq('session', sessionName)
      .eq('term', term)
      .maybeSingle();

    let isCleared = false;
    let balance = 55000;

    if (clearance) {
      isCleared = clearance.is_cleared === true && Number(clearance.balance || 0) <= 0;
      balance = Number(clearance.balance || 0);
    } else {
      // If no clearance record exists yet, calculate their actual class tariff so they see the real term fee due
      try {
        const studentClassName = (student as any).classes?.class_name;
        const levies = getLeviesForStudentClass(studentClassName);
        const classTotal = levies.reduce((sum, l) => sum + Number(l.amount || 0), 0);
        balance = classTotal || 55000;
        isCleared = false;
      } catch {
        balance = 55000;
        isCleared = false;
      }
    }

    // 4. Check term release status joined with the specific academic session
    const termNumber = term === 'first' ? 1 : term === 'second' ? 2 : 3;

    // First find session ID for this sessionName
    const { data: sessionData } = await supabase
      .from('academic_sessions')
      .select('id')
      .eq('session_name', sessionName)
      .maybeSingle();

    let isReleased = false;
    if (sessionData?.id) {
      const { data: termData } = await supabase
        .from('academic_terms')
        .select('results_released')
        .eq('session_id', sessionData.id)
        .eq('term_number', termNumber)
        .maybeSingle();
      isReleased = termData?.results_released === true;
    } else {
      // Fallback: check current term
      const { data: fallbackTerm } = await supabase
        .from('academic_terms')
        .select('results_released')
        .eq('is_current', true)
        .maybeSingle();
      isReleased = fallbackTerm?.results_released === true;
    }

    // 5. SERVER-SIDE GATING: Protect results from being leaked before publication or payment
    const isStaffOrAdmin = auth.session.role === 'admin' || auth.session.role === 'super_admin';

    if (!isStaffOrAdmin) {
      if (!isReleased) {
        return NextResponse.json({
          success: true,
          student,
          isCleared,
          balance,
          isReleased: false,
          results: [],
          lockedReason: `Results for ${term === 'first' ? '1st' : term === 'second' ? '2nd' : '3rd'} Term (${sessionName}) are currently locked pending formal release by the Principal & Academic Board.`,
        });
      }

      if (!isCleared) {
        return NextResponse.json({
          success: true,
          student,
          isCleared: false,
          balance,
          isReleased: true,
          results: [],
          lockedReason: `Terminal broadsheet locked: An outstanding tuition balance of ₦${balance.toLocaleString()} is recorded for this term. Please settle your account with the Bursary to access your report card.`,
        });
      }
    }

    // 6. Fetch approved/submitted results
    let resultsQuery = supabase
      .from('results')
      .select(`
        id,
        ca1,
        ca2,
        exam,
        total,
        grade,
        remark,
        status,
        subjects (id, subject_name)
      `)
      .eq('student_id', student.id)
      .eq('session', sessionName)
      .eq('term', term);

    if (!isStaffOrAdmin) {
      // Students can only see submitted/published results, never drafts
      resultsQuery = resultsQuery.eq('status', 'submitted');
    }

    const { data: results, error: resErr } = await resultsQuery;
    if (resErr) throw resErr;

    return NextResponse.json({
      success: true,
      student,
      isCleared,
      balance,
      isReleased,
      results: results || [],
      source: 'database',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
