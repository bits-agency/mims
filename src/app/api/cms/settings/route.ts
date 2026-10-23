import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth, logAudit } from '@/lib/guard';

const DEFAULT_CAMPUSES = [
  {
    id: 'senior',
    title: 'Secondary School & Boarding Hostel Campus',
    address: 'MSSN Campus Complex, KM 4 Oba-Ile Express Road, Akure, Ondo State',
    type: 'Secondary & Boarding',
  },
  {
    id: 'nursery_primary',
    title: 'Nursery & Primary School Wing Campus',
    address: 'Al-Birr Heights, Off Oba-Adesida Central Boulevard, Akure, Ondo State',
    type: 'Nursery & Primary',
  },
  {
    id: 'madinah',
    title: 'Madinah Quranic & Tahfeez Residential Campus',
    address: 'Madinah Estate, Off FUTA South Gate Road, Akure, Ondo State',
    type: 'Tahfeez Academy',
  },
];

const DEFAULT_SETTINGS = {
  school_name: 'MSSN Islamic Model Schools, Akure',
  motto: 'Knowledge, Faith and Excellent Morals • Al-Birr',
  accreditation: 'WAEC / NECO / Ondo State Ministry of Education Accredited',
  bursary_phone: '+234 802 987 6543',
  admissions_phone: '+234 803 234 5678',
  principal_phone: '+234 805 112 3344',
  whatsapp_inquiry: '+234 814 556 7788',
  general_email: 'info@mimsakure.com',
  admissions_email: 'admissions@mimsakure.com',
  bursar_email: 'bursar@mimsakure.com',
  principal_email: 'principal@mimsakure.com',
  senior_campus_address: DEFAULT_CAMPUSES[0].address,
  nursery_primary_address: DEFAULT_CAMPUSES[1].address,
  campus_locations: DEFAULT_CAMPUSES,
  campuses: DEFAULT_CAMPUSES,
  bank_name: 'Official Commercial Bank',
  account_name: 'MSSN Islamic Model Schools Akure - Operations',
  account_number: 'To Be Stated by School Management',
  sort_code: '301001',
  school_hours: 'Monday - Thursday: 7:30 AM – 3:30 PM',
  friday_hours: 'Friday: 7:30 AM – 1:00 PM (Jumu\'ah Break)',
  admin_office_hours: 'Monday - Friday: 8:00 AM – 4:30 PM',
  visiting_day_schedule: '1st Sunday of Every Month: 10:00 AM – 5:00 PM',
  facebook_url: 'https://facebook.com/mimsakure',
  youtube_url: 'https://youtube.com/@mimsakure',
  whatsapp_channel_url: 'https://whatsapp.com/channel/mimsakure',
};

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const campuses = data.campus_locations || DEFAULT_CAMPUSES;
          return NextResponse.json({
            success: true,
            settings: {
              ...DEFAULT_SETTINGS,
              ...data,
              campus_locations: campuses,
              campuses: campuses,
            },
            source: 'supabase_database',
          });
        }
      } catch (err) {
        console.warn('CMS settings DB query error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
      source: 'database_defaults',
    });
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

    const supabase = getAdminClient();
    const { data: existing } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();

    const rawCampuses = body.campus_locations || body.campuses || DEFAULT_CAMPUSES;

    const allowedFields = [
      'school_name',
      'motto',
      'accreditation',
      'bursary_phone',
      'admissions_phone',
      'principal_phone',
      'whatsapp_inquiry',
      'general_email',
      'admissions_email',
      'bursar_email',
      'principal_email',
      'senior_campus_address',
      'nursery_primary_address',
      'bank_name',
      'account_name',
      'account_number',
      'sort_code',
      'school_hours',
      'friday_hours',
      'admin_office_hours',
      'visiting_day_schedule',
      'facebook_url',
      'youtube_url',
      'whatsapp_channel_url',
    ];

    const dbPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
      campus_locations: rawCampuses,
    };

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        dbPayload[field] = body[field];
      }
    }

    if (existing?.id) {
      const { error: updErr } = await supabase
        .from('site_settings')
        .update(dbPayload)
        .eq('id', existing.id);

      if (updErr) {
        throw new Error(`Database settings update failed: ${updErr.message}`);
      }
    } else {
      const { error: insErr } = await supabase
        .from('site_settings')
        .insert(dbPayload);

      if (insErr) {
        throw new Error(`Database settings insert failed: ${insErr.message}`);
      }
    }

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'cms.settings_updated',
      entity: 'site_settings',
    });

    return NextResponse.json({
      success: true,
      message: 'Institutional settings and campus details saved to database successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
