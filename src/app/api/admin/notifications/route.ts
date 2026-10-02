import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  link: string;
  type: 'admission' | 'payment' | 'academic' | 'gate' | 'system';
  unread: boolean;
}

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const notifications: AdminNotification[] = [];

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();

        // 1. Check pending online admissions applications
        const { data: applicants } = await supabase
          .from('students')
          .select('id, admission_no, firstname, lastname, exam_notes, created_at')
          .is('class_id', null)
          .order('created_at', { ascending: false })
          .limit(5);

        if (applicants && applicants.length > 0) {
          for (const app of applicants) {
            let targetClass = '';
            try {
              if (app.exam_notes && app.exam_notes.startsWith('{')) {
                const parsed = JSON.parse(app.exam_notes);
                targetClass = parsed.target_class || '';
              }
            } catch {}

            notifications.push({
              id: `adm-${app.id}`,
              title: 'New Admission Application',
              message: `${app.firstname} ${app.lastname} submitted application (${app.admission_no})${targetClass ? ` for ${targetClass}` : ''}.`,
              timestamp: app.created_at || new Date().toISOString(),
              link: '/admin/admissions',
              type: 'admission',
              unread: true,
            });
          }
        }

        // 2. Check recent tuition & fee payments
        const { data: payments } = await supabase
          .from('payments')
          .select('id, receipt_no, amount_paid, payment_date, channel_reference, created_at, students(firstname, lastname)')
          .order('created_at', { ascending: false })
          .limit(4);

        if (payments && payments.length > 0) {
          for (const p of payments) {
            const studentName = (p as any).students
              ? `${(p as any).students.firstname || ''} ${(p as any).students.lastname || ''}`.trim()
              : p.channel_reference || 'Student';

            notifications.push({
              id: `pay-${p.id}`,
              title: 'Tuition Payment Received',
              message: `Receipt ${p.receipt_no}: ₦${Number(p.amount_paid).toLocaleString()} received for ${studentName}.`,
              timestamp: p.payment_date || p.created_at || new Date().toISOString(),
              link: '/bursar/payments',
              type: 'payment',
              unread: false,
            });
          }
        }

        // 3. Check Admissions Gate master switch
        const { data: gate } = await supabase
          .from('admissions_gate')
          .select('is_open, target_session, updated_at')
          .limit(1)
          .maybeSingle();

        if (gate) {
          notifications.push({
            id: 'gate-status',
            title: gate.is_open ? 'Admissions Gate: OPEN' : 'Admissions Gate: CLOSED',
            message: gate.is_open
              ? `Public registration is active for ${gate.target_session || '2026/2027 Academic Session'}.`
              : `Public online admissions are closed for ${gate.target_session || 'the current session'}.`,
            timestamp: gate.updated_at || new Date().toISOString(),
            link: '/admin/cms/admissions-gate',
            type: 'gate',
            unread: false,
          });
        }

        // 4. Check active academic session & term moderation
        const { data: activeTerm } = await supabase
          .from('academic_terms')
          .select('id, term_name, status, results_released, academic_sessions(session_name)')
          .eq('is_current', true)
          .limit(1)
          .maybeSingle();

        if (activeTerm) {
          const sessionName = (activeTerm as any).academic_sessions?.session_name || 'Current Session';
          notifications.push({
            id: `term-${activeTerm.id}`,
            title: `Active Academic Term: ${activeTerm.term_name}`,
            message: `${sessionName} (${activeTerm.status || 'Active'}). Terminal result publishing is ${activeTerm.results_released ? 'RELEASED' : 'LOCKED'}.`,
            timestamp: new Date().toISOString(),
            link: '/admin/sessions',
            type: 'academic',
            unread: false,
          });
        }
      } catch (dbErr) {
        console.warn('Live notifications DB fetch error:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter((n) => n.unread).length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
