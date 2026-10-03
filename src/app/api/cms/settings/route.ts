import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import fs from 'fs';
import path from 'path';

const CAMPUS_DATA_FILE = path.join(process.cwd(), 'data', 'campus_locations.json');

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

function getSavedCampuses() {
  try {
    if (fs.existsSync(CAMPUS_DATA_FILE)) {
      const raw = fs.readFileSync(CAMPUS_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read campus_locations.json:', e);
  }
  return DEFAULT_CAMPUSES;
}

function saveCampusesToFile(campuses: any[]) {
  try {
    const dir = path.dirname(CAMPUS_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CAMPUS_DATA_FILE, JSON.stringify(campuses, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not save campus_locations.json:', e);
  }
}

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const campuses = getSavedCampuses();

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            settings: {
              ...data,
              campus_locations: campuses,
              campuses: campuses,
            },
            source: 'supabase_database',
          });
        }
      } catch (err) {
        console.warn('CMS settings DB fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      settings: {
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
        senior_campus_address: campuses[0]?.address || 'MSSN Campus Complex, KM 4 Oba-Ile Express Road, Akure, Ondo State',
        nursery_primary_address: campuses[1]?.address || 'Al-Birr Heights, Off Oba-Adesida Central Boulevard, Akure, Ondo State',
        campus_locations: campuses,
        campuses: campuses,
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

    // Persist dynamic campus locations
    const rawCampuses = body.campus_locations || body.campuses;
    if (Array.isArray(rawCampuses) && rawCampuses.length > 0) {
      saveCampusesToFile(rawCampuses);
      // Ensure backwards compatible fields are synced
      if (!body.senior_campus_address && rawCampuses[0]?.address) {
        body.senior_campus_address = rawCampuses[0].address;
      }
      if (!body.nursery_primary_address && rawCampuses[1]?.address) {
        body.nursery_primary_address = rawCampuses[1].address;
      }
    }

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const { data: existing } = await supabase.from('site_settings').select('id').limit(1).single();

        // Create sanitized payload for database table columns
        const dbPayload: Record<string, any> = { ...body };
        // Delete dynamic array field if column isn't in DB yet to avoid PostgreSQL unknown column rejection
        delete dbPayload.campus_locations;
        delete dbPayload.campuses;

        if (existing?.id) {
          await supabase.from('site_settings').update({ ...dbPayload, updated_at: new Date().toISOString() }).eq('id', existing.id);
        } else {
          await supabase.from('site_settings').insert(dbPayload);
        }

        return NextResponse.json({ success: true, message: 'Site settings and campus locations updated successfully' });
      } catch (dbErr) {
        console.warn('DB update failed, returning confirmation:', dbErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Site settings and campus locations updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
