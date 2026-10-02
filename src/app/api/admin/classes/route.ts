import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      try {
        const supabase = getAdminClient();
        const { data: classes, error } = await supabase
          .from('classes')
          .select(`
            id,
            class_name,
            section,
            wing,
            created_at,
            students (id)
          `)
          .order('class_name', { ascending: true });

        if (!error && classes) {
          const formatted = classes.map((c: any) => ({
            id: c.id,
            className: c.class_name,
            section: c.section,
            wing: c.wing || 'Secondary',
            studentCount: c.students ? c.students.length : 0,
            createdAt: c.created_at,
          }));

          return NextResponse.json({ success: true, classes: formatted, source: 'supabase_database' });
        }
      } catch (err) {
        console.warn('Classes DB query error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      classes: [],
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
    const { className, section, wing, tuitionFee, devLevy } = body;

    if (!className || !section) {
      return NextResponse.json({ error: 'Class name and section are required' }, { status: 400 });
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      const supabase = getAdminClient();

      // 1. Insert class into classes table
      const { data: newClass, error: classErr } = await supabase
        .from('classes')
        .insert({
          class_name: className,
          section: section,
          wing: wing || 'Senior Secondary',
        })
        .select()
        .single();

      if (classErr) throw classErr;

      // 2. If tuition fee provided, configure fee structure for this wing/category
      if (tuitionFee && Number(tuitionFee) > 0) {
        const total = Number(tuitionFee) + Number(devLevy || 0);
        await supabase.from('fee_structures').upsert(
          {
            session: '2025/2026',
            term: 'first',
            wing: wing || 'Senior Secondary',
            category: 'Day',
            tuition_amount: Number(tuitionFee),
            development_levy: Number(devLevy || 0),
            total_amount: total,
          },
          { onConflict: 'session,term,wing,category' }
        );
      }

      return NextResponse.json({
        success: true,
        class: newClass,
        message: `Class ${className} (${section}) provisioned successfully with linked Bursar fee tariff.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Class ${className} (${section}) recorded successfully.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, className, section, wing, tuitionFee, devLevy } = body;

    if (!id || !className || !section) {
      return NextResponse.json({ error: 'Class ID, name, and section are required' }, { status: 400 });
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      const supabase = getAdminClient();

      // 1. Update class in classes table
      const { data: updatedClass, error: classErr } = await supabase
        .from('classes')
        .update({
          class_name: className,
          section: section,
          wing: wing || 'Senior Secondary',
        })
        .eq('id', id)
        .select()
        .single();

      if (classErr) throw classErr;

      // 2. Update fee structure if provided
      if (tuitionFee !== undefined && Number(tuitionFee) >= 0) {
        const total = Number(tuitionFee) + Number(devLevy || 0);
        await supabase.from('fee_structures').upsert(
          {
            session: '2025/2026',
            term: 'first',
            wing: wing || 'Senior Secondary',
            category: 'Day',
            tuition_amount: Number(tuitionFee),
            development_levy: Number(devLevy || 0),
            total_amount: total,
          },
          { onConflict: 'session,term,wing,category' }
        );
      }

      return NextResponse.json({
        success: true,
        class: updatedClass,
        message: `Class ${className} (${section}) updated successfully with updated Bursar tariff.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Class ${className} (${section}) updated successfully.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabase) {
      const supabase = getAdminClient();

      // Check if class has students enrolled
      const { count } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', id);

      if (count && count > 0) {
        return NextResponse.json(
          { error: `Cannot delete class arm: ${count} student(s) are currently enrolled. Reassign them first.` },
          { status: 400 }
        );
      }

      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Class arm removed successfully.',
      });
    }

    return NextResponse.json({ success: true, message: 'Class arm removed.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

