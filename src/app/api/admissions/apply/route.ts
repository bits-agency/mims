import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { generateApplicationRef } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      firstname,
      middlename,
      lastname,
      email,
      password,
      gender,
      dob,
      target_class,
      campus_preference,
      guardian_name,
      guardian_phone,
      address,
      prev_school_name,
      prev_grade_completed,
      medical_history,
      special_needs,
      photo,
    } = body;

    if (!firstname || !lastname || !email || !gender) {
      return NextResponse.json(
        { error: 'First name, last name, valid email address, and gender are required.' },
        { status: 400 }
      );
    }

    if (!password || String(password).trim().length < 6) {
      return NextResponse.json(
        { error: 'Please provide a secure account password of at least 6 characters.' },
        { status: 400 }
      );
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json(
        { error: 'Admissions database service configuration is currently unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    const supabase = getAdminClient();

    // 0. Verify admissions gate master switch
    const { data: gate } = await supabase
      .from('admissions_gate')
      .select('is_open, closed_notice')
      .limit(1)
      .maybeSingle();

    if (gate && gate.is_open === false) {
      return NextResponse.json(
        { error: gate.closed_notice || 'Online admissions are currently closed for this academic cycle.' },
        { status: 403 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const fullName = [firstname, middlename, lastname].filter(Boolean).join(' ').trim();
    const hashedPassword = await hashPassword(String(password).trim());

    // Generate unique, sequential application reference
    const currentYear = new Date().getFullYear();
    const { count: applicantCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .is('class_id', null);

    const seq = (applicantCount || 0) + 1;
    let appRef = generateApplicationRef(seq);

    // Verify uniqueness
    const { data: existingRef } = await supabase
      .from('students')
      .select('id')
      .eq('admission_no', appRef)
      .maybeSingle();

    if (existingRef) {
      appRef = `APP/${currentYear}/${String(seq + Math.floor(10 + Math.random() * 89)).padStart(4, '0')}`;
    }

    // Check if user with this email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', cleanEmail)
      .maybeSingle();

    let studentUserEmail = cleanEmail;
    if (existingUser) {
      const emailParts = cleanEmail.split('@');
      studentUserEmail = `${emailParts[0]}+app${Date.now().toString().slice(-4)}@${emailParts[1]}`;
    }

    // 1. Create student user account
    const username = appRef.toLowerCase().replace(/[^a-z0-9]/g, '');
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        full_name: fullName,
        username,
        email: studentUserEmail,
        password: hashedPassword,
        role: 'student',
        status: 'pending',
      })
      .select('id, full_name, username, email, role, status')
      .single();

    if (userError || !newUser) {
      return NextResponse.json(
        { error: userError?.message || 'Failed to create student user profile in database.' },
        { status: 500 }
      );
    }

    // 2. Structured application dossier
    const dossierDetails = {
      target_class: target_class || 'Junior Secondary (JSS 1)',
      campus: campus_preference || 'Madinah Quarters',
      report_card_url: body.report_file_url || null,
      prev_school: prev_school_name || null,
      prev_grade: prev_grade_completed || null,
      medical: medical_history || null,
      special_needs: special_needs || null,
      submitted_at: new Date().toISOString(),
    };

    // 3. Insert student record
    const { data: newStudent, error: studentError } = await supabase
      .from('students')
      .insert({
        user_id: newUser.id,
        admission_no: appRef,
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        gender: gender ? (gender.toLowerCase() === 'female' ? 'female' : 'male') : 'male',
        dob: dob || null,
        category: body.boarding_type === 'Boarding' ? 'Boarding' : 'Day',
        guardian_name: guardian_name?.trim() || null,
        guardian_phone: guardian_phone?.trim() || null,
        guardian_email: cleanEmail,
        address: address?.trim() || null,
        photo: photo || null,
        exam_status: 'pending',
        exam_venue: 'MSSN Campus Complex Main Examination Hall, Km 4 Oba-Ile Road, Akure',
        application_details: dossierDetails,
      })
      .select('id, admission_no, firstname, lastname, exam_status, exam_venue, created_at')
      .single();

    if (studentError || !newStudent) {
      // Rollback user if student insert fails
      await supabase.from('users').delete().eq('id', newUser.id);
      return NextResponse.json(
        { error: studentError?.message || 'Failed to register student application in database.' },
        { status: 500 }
      );
    }

    // Set authenticated session cookie for immediate applicant portal access
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.full_name,
      username: newUser.username,
      status: newUser.status,
    });
    await setSessionCookie(token);

    // Return safe data without passwords or hashes
    return NextResponse.json({
      success: true,
      applicationRef: appRef,
      message: 'Application submitted and registered successfully.',
      student: newStudent,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Application submission failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
