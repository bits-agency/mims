import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/guard';
import { contactMessageSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => ({}));
    const parseResult = contactMessageSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || 'Please provide your name, phone number, and message.' },
        { status: 400 }
      );
    }

    const { parentName, email, phone, campus, level, message } = parseResult.data;
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json(
        { error: 'Contact registry is currently unavailable. Please call our admissions hotline.' },
        { status: 503 }
      );
    }

    const supabase = getAdminClient();

    // Rate limit: max 5 messages per hour per IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    try {
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('ip', clientIp)
        .gte('created_at', oneHourAgo);

      if (count && count >= 5) {
        return NextResponse.json(
          { error: 'You have submitted multiple inquiries. Please wait a little while before sending another message.' },
          { status: 429 }
        );
      }
    } catch {}

    const subjectLine = `Admissions Inquiry: ${campus || 'Akure Campuses'} — ${level || 'General'}`;

    const { error: insertErr } = await supabase
      .from('contact_messages')
      .insert({
        full_name: parentName.trim(),
        email: email?.trim() || 'no-email-provided@mims.sch.ng',
        phone: phone.trim(),
        subject: subjectLine,
        message: message.trim(),
        ip: clientIp,
      });

    if (insertErr) throw insertErr;

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been received by our Admissions Registry. A representative will contact you shortly.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const supabase = getAdminClient();
    const { data: messages, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ success: true, messages: messages || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
