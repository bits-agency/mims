import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
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
            users (id, role, status, username),
            subjects (
              id,
              subject_name,
              class_id,
              classes (id, class_name, section)
            )
          `)
          .order('staff_no', { ascending: true });

        if (!error && staff) {
          return NextResponse.json({ success: true, staff, source: 'supabase_database' });
        }
      } catch (err) {
        console.warn('Staff DB query fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      staff: [],
      source: 'database_empty',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
      role: appointedRole,
      password: customPassword,
    } = body;

    const userRole =
      appointedRole === 'Bursar'
        ? 'bursar'
        : appointedRole === 'Principal' || appointedRole === 'Vice Principal'
        ? 'admin'
        : 'teacher';

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();

        // 1. Create User account first if email provided
        let userId = null;
        const rawPassword = customPassword?.trim() || 'Mimsakure27';
        const hashedPassword = await hashPassword(rawPassword);

        if (email) {
          const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
          if (existingUser) {
            userId = existingUser.id;
            await supabase.from('users').update({ role: userRole }).eq('id', existingUser.id);
          } else {
            const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const { data: newUser } = await supabase
              .from('users')
              .insert({
                full_name: `${firstname} ${lastname}`.trim(),
                email: email,
                username: username,
                password: hashedPassword,
                role: userRole,
                status: 'active',
              })
              .select('id')
              .single();
            if (newUser) userId = newUser.id;
          }
        }

        // 2. Insert teacher record
        const { data: teacher, error } = await supabase
          .from('teachers')
          .insert({
            user_id: userId,
            staff_no: staff_no || `MIMS/STF/${Date.now().toString().slice(-4)}`,
            firstname: firstname || 'Faculty',
            lastname: lastname || 'Staff',
            gender: 'Male',
            email: email,
            phone: phone,
            department: department || 'Sciences',
            qualification: Array.isArray(assignedSubjects) ? assignedSubjects.join(', ') : qualification || '',
          })
          .select()
          .single();

        if (error) throw error;

        // 3. Link subjects
        const primaryCore = [
          'Mathematics',
          'English Language',
          'Basic Science',
          'Social Studies',
          'Islamic Religious Studies (IRS)',
          'Arabic Language',
          'Computer Studies / ICT',
          'Agricultural Science',
          'Tahfeez (Holy Quran)'
        ];

        // Scenario A: Class Teacher (Teaches all subjects for this class)
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

        // Scenario B: Specific Subject-Class Pair Allocations (e.g. SSS 2 English, SSS 3 Biology)
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
        } else if (Array.isArray(assignedSubjects) && assignedSubjects.length > 0 && Array.isArray(assignedClassIds)) {
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

        return NextResponse.json({ success: true, staff: teacher });
      } catch (err: any) {
        console.warn('Staff creation DB error:', err);
        return NextResponse.json({ error: err.message || 'Failed to create staff' }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Staff provisioned' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
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

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (hasSupabase) {
      const supabase = getAdminClient();

      const qualString = Array.isArray(assignedSubjects) ? assignedSubjects.join(', ') : undefined;

      const { data: updatedTeacher, error } = await supabase
        .from('teachers')
        .update({
          firstname,
          lastname,
          email,
          phone,
          department,
          ...(qualString ? { qualification: qualString } : {}),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (updatedTeacher?.user_id && body.role) {
        const userRole =
          body.role === 'Bursar'
            ? 'bursar'
            : body.role === 'Principal' || body.role === 'Vice Principal'
            ? 'admin'
            : 'teacher';
        await supabase.from('users').update({ role: userRole }).eq('id', updatedTeacher.user_id);
      }

      if (updatedTeacher?.user_id && body.password) {
        const hashedPassword = await hashPassword(body.password.trim());
        await supabase.from('users').update({ password: hashedPassword }).eq('id', updatedTeacher.user_id);
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
        'Tahfeez (Holy Quran)'
      ];

      // If updating allocations, unbind old subject associations for this teacher first
      if ((isClassTeacher && classTeacherClassId) || (Array.isArray(teachingAssignments) && teachingAssignments.length > 0) || (Array.isArray(assignedSubjects) && assignedSubjects.length > 0)) {
        await supabase.from('subjects').update({ teacher_id: null }).eq('teacher_id', id);
      }

      // If class teacher:
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

      // Update granular subject allocations
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

      return NextResponse.json({ success: true, staff: updatedTeacher });
    }

    return NextResponse.json({ success: true, message: 'Staff updated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

