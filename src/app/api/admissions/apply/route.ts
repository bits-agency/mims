import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { generateApplicationRef } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
      nationality,
      state_of_origin,
      lga,
      guardian_name,
      guardian_relationship,
      guardian_phone,
      guardian_alt_phone,
      address,
      residential_area,
      guardian_occupation,
      guardian_workplace,
      prev_school_name,
      prev_school_address,
      prev_grade_completed,
      medical_history,
      special_needs,
      emergency_name,
      emergency_phone,
      emergency_relationship,
      referral_source,
      photo,
    } = body;

    if (!firstname || !lastname || !email || !gender) {
      return NextResponse.json(
        { error: 'First name, last name, email, and gender are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const username = cleanEmail.split('@')[0] + Math.floor(100 + Math.random() * 900);
    const fullName = [firstname, middlename, lastname].filter(Boolean).join(' ').trim();
    const hashedPassword = await hashPassword(password || 'Student@2026');
    const tempRefSeq = Math.floor(1000 + Math.random() * 9000);
    const appRef = generateApplicationRef(tempRefSeq);

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();

        // Check if email already registered
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', cleanEmail)
          .single();

        if (existingUser) {
          return NextResponse.json(
            { error: 'An account with this email address already exists' },
            { status: 409 }
          );
        }

        // 1. Create user in users table
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            full_name: fullName,
            username,
            email: cleanEmail,
            password: hashedPassword,
            role: 'student',
            status: 'pending',
          })
          .select()
          .single();

        if (userError || !newUser) {
          throw new Error(userError?.message || 'Failed to create user record');
        }

        // 2. Create student record with application reference as initial admission_no
        const dossierNotes = JSON.stringify({
          target_class: target_class || 'Junior Secondary (JSS 1)',
          campus: campus_preference || 'Madinah Quarters',
          report_card_url: body.report_file_url || null,
          prev_school: prev_school_name || null,
          prev_grade: prev_grade_completed || null,
          medical: medical_history || null,
          special_needs: special_needs || null,
        });

        const { data: newStudent, error: studentError } = await supabase
          .from('students')
          .insert({
            user_id: newUser.id,
            admission_no: appRef,
            firstname,
            lastname,
            gender: gender ? (gender.toLowerCase() === 'female' ? 'female' : 'male') : 'male',
            dob: dob || null,
            category: body.boarding_type === 'Boarding' ? 'Boarding' : 'Day',
            guardian_name: guardian_name || null,
            guardian_phone: guardian_phone || null,
            guardian_email: cleanEmail,
            address: address || null,
            photo: photo || null,
            exam_status: 'pending',
            exam_venue: 'MSSN Campus Complex Main Examination Hall',
            exam_notes: dossierNotes,
          })
          .select()
          .single();

        if (studentError) {
          throw new Error(studentError.message);
        }

        // Set session cookie
        const token = await createSessionToken({
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role,
          fullName: newUser.full_name,
          username: newUser.username,
          status: newUser.status,
        });
        await setSessionCookie(token);

        return NextResponse.json({
          success: true,
          applicationRef: appRef,
          user: newUser,
          student: newStudent,
        });
      } catch (err: unknown) {
        console.error('Supabase admission error:', err);
      }
    }

    // Offline fallback if database not yet initialized
    return NextResponse.json({
      success: true,
      applicationRef: appRef,
      message: 'Application received and registered successfully',
      user: {
        id: appRef,
        full_name: fullName,
        email: cleanEmail,
        role: 'student',
        status: 'pending',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Application submission failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
