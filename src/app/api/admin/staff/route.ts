import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/auth';
import { requireAuth, logAudit } from '@/lib/guard';

export async function GET() {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ success: true, staff: [] });
    }

    const supabase = getAdminClient();
    const { data: staff, error } = await supabase
      .from('teachers')
      .select(`
        id,
        staff_no,
        firstname,
        lastname,
        gender,
        phone,
        email,
        qualification,
        department,
        user_id,
        users (id, role, status, username),
        subjects (
          id,
          subject_name,
          class_id,
          classes (id, class_name, section)
        )
      `)
      .order('staff_no', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, staff: staff || [] });
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
    const {
      staff_no,
      firstname,
      lastname,
      email,
      phone,
      department,
      qualification,
      assignedSubjects,
      assignedClassIds,
      appointedRole,
      customPassword,
    } = body;

    if (!firstname || !lastname) {
      return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 });
    }

    const cleanEmail = email?.trim()?.toLowerCase();
    const targetRole =
      appointedRole === 'Bursar'
        ? 'bursar'
        : appointedRole === 'Principal' || appointedRole === 'Vice Principal'
        ? 'admin'
        : 'teacher';

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) {
      return NextResponse.json({ error: 'Database service configuration missing.' }, { status: 503 });
    }

    const supabase = getAdminClient();

    let userId: string | null = null;
    if (cleanEmail) {
      // Security Check: Verify user does not already exist. Prevent privilege hijacking.
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { error: `An account with email "${cleanEmail}" already exists with role "${existingUser.role}". Cannot re-register or elevate via staff creation.` },
          { status: 409 }
        );
      }

      // Password must be provided or generated securely
      const initialPassword = customPassword?.trim() || `MIMS@${Math.floor(1000 + Math.random() * 9000)}`;
      const hashedPassword = await hashPassword(initialPassword);
      const username = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      const { data: newUser, error: userErr } = await supabase
        .from('users')
        .insert({
          full_name: `${firstname} ${lastname}`.trim(),
          email: cleanEmail,
          username,
          password: hashedPassword,
          role: targetRole,
          status: 'active',
        })
        .select('id')
        .single();

      if (userErr) throw userErr;
      userId = newUser.id;
    }

    // Generate staff number using year sequence or fallback
    const currentYear = new Date().getFullYear();
    const autoStaffNo = staff_no || `MIMS/STF/${currentYear}/${Math.floor(100 + Math.random() * 900)}`;

    const { data: teacher, error: teacherErr } = await supabase
      .from('teachers')
      .insert({
        user_id: userId,
        staff_no: autoStaffNo,
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        gender: body.gender || 'Male',
        email: cleanEmail || null,
        phone: phone?.trim() || null,
        department: department || 'General Studies',
        qualification: Array.isArray(assignedSubjects) ? assignedSubjects.join(', ') : qualification || '',
      })
      .select()
      .single();

    if (teacherErr) throw teacherErr;

    // Link subjects if provided
    const primaryCore = [
      'Mathematics',
      'English Language',
      'Basic Science',
      'Social Studies',
      'Islamic Religious Studies (IRS)',
      'Arabic Language',
      'Computer Studies / ICT',
      'Agricultural Science',
      'Tahfeez (Holy Quran)',
    ];

    if (body.isClassTeacher && body.classTeacherClassId) {
      for (const sub of primaryCore) {
        await supabase.from('subjects').upsert(
          {
            subject_name: sub,
            class_id: body.classTeacherClassId,
            teacher_id: teacher.id,
          },
          { onConflict: 'subject_name,class_id' }
        );
      }
    }

    if (Array.isArray(body.teachingAssignments) && body.teachingAssignments.length > 0) {
      for (const item of body.teachingAssignments) {
        if (item.subject && item.classId) {
          await supabase.from('subjects').upsert(
            {
              subject_name: item.subject,
              class_id: item.classId,
              teacher_id: teacher.id,
            },
            { onConflict: 'subject_name,class_id' }
          );
        }
      }
    } else if (Array.isArray(assignedSubjects) && Array.isArray(assignedClassIds)) {
      for (const subjectName of assignedSubjects) {
        for (const classId of assignedClassIds) {
          await supabase.from('subjects').upsert(
            {
              subject_name: subjectName,
              class_id: classId,
              teacher_id: teacher.id,
            },
            { onConflict: 'subject_name,class_id' }
          );
        }
      }
    }

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'staff.created',
      entity: 'teacher',
      entityId: teacher.id,
      details: { staff_no: teacher.staff_no, name: `${firstname} ${lastname}`, email: cleanEmail },
    });

    return NextResponse.json({ success: true, staff: teacher });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const {
      id,
      firstname,
      lastname,
      email,
      phone,
      department,
      assignedSubjects,
      assignedClassIds,
      teachingAssignments,
      isClassTeacher,
      classTeacherClassId,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const qualString = Array.isArray(assignedSubjects) ? assignedSubjects.join(', ') : undefined;

    const { data: updatedTeacher, error } = await supabase
      .from('teachers')
      .update({
        firstname: firstname?.trim(),
        lastname: lastname?.trim(),
        email: email?.trim()?.toLowerCase(),
        phone: phone?.trim(),
        department,
        ...(qualString ? { qualification: qualString } : {}),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If updating allocations, unbind old subject associations for this teacher first
    if (
      (isClassTeacher && classTeacherClassId) ||
      (Array.isArray(teachingAssignments) && teachingAssignments.length > 0) ||
      (Array.isArray(assignedSubjects) && assignedSubjects.length > 0)
    ) {
      await supabase.from('subjects').update({ teacher_id: null }).eq('teacher_id', id);
    }

    const primaryCore = [
      'Mathematics',
      'English Language',
      'Basic Science',
      'Social Studies',
      'Islamic Religious Studies (IRS)',
      'Arabic Language',
      'Computer Studies / ICT',
      'Agricultural Science',
      'Tahfeez (Holy Quran)',
    ];

    if (isClassTeacher && classTeacherClassId) {
      for (const sub of primaryCore) {
        await supabase.from('subjects').upsert(
          {
            subject_name: sub,
            class_id: classTeacherClassId,
            teacher_id: id,
          },
          { onConflict: 'subject_name,class_id' }
        );
      }
    }

    if (Array.isArray(teachingAssignments) && teachingAssignments.length > 0) {
      for (const item of teachingAssignments) {
        if (item.subject && item.classId) {
          await supabase.from('subjects').upsert(
            {
              subject_name: item.subject,
              class_id: item.classId,
              teacher_id: id,
            },
            { onConflict: 'subject_name,class_id' }
          );
        }
      }
    } else if (Array.isArray(assignedSubjects) && Array.isArray(assignedClassIds)) {
      for (const subjectName of assignedSubjects) {
        for (const classId of assignedClassIds) {
          await supabase.from('subjects').upsert(
            {
              subject_name: subjectName,
              class_id: classId,
              teacher_id: id,
            },
            { onConflict: 'subject_name,class_id' }
          );
        }
      }
    }

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'staff.updated',
      entity: 'teacher',
      entityId: id,
    });

    return NextResponse.json({ success: true, staff: updatedTeacher });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { teacherId, status, resetPassword } = body;

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data: teacher } = await supabase
      .from('teachers')
      .select('id, user_id, firstname, lastname')
      .eq('id', teacherId)
      .single();

    if (!teacher) {
      return NextResponse.json({ error: 'Staff member not found.' }, { status: 404 });
    }

    if (teacher.user_id) {
      const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
      if (status && ['active', 'suspended', 'inactive'].includes(status)) {
        updateData.status = status;
      }
      if (resetPassword) {
        updateData.password = await hashPassword(resetPassword);
        updateData.session_version = 1; // invalidate existing sessions
      }

      const { error: userErr } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', teacher.user_id);

      if (userErr) throw userErr;
    }

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'staff.status_toggled',
      entity: 'teacher',
      entityId: teacherId,
      details: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Staff account status updated to "${status}".`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth(['admin', 'super_admin']);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data: teacher } = await supabase
      .from('teachers')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Unassign subjects
    await supabase.from('subjects').update({ teacher_id: null }).eq('teacher_id', id);

    // Delete teacher record
    const { error: delErr } = await supabase.from('teachers').delete().eq('id', id);
    if (delErr) throw delErr;

    // Delete associated user account if present
    if (teacher.user_id) {
      await supabase.from('users').delete().eq('id', teacher.user_id);
    }

    await logAudit({
      actorId: auth.session.userId,
      actorRole: auth.session.role,
      action: 'staff.deleted',
      entity: 'teacher',
      entityId: id,
    });

    return NextResponse.json({ success: true, message: 'Staff member removed successfully.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
