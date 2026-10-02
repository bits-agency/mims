import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'announcements.json');

// Helper to ensure data directory and file exist
function getStoredAnnouncements() {
  try {
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const defaultAnnouncements = [
        {
          id: 'anc-1',
          title: 'Resumption Protocol & Term 1 Orientation',
          sender: 'Office of the Principal',
          date: '2026-10-01',
          category: 'Academic',
          message: 'All students are expected to report to their assigned class arms promptly at 7:30 AM in complete, neat school uniforms. Morning assembly and orientation will commence at 7:45 AM.',
          pinned: true,
          audience: 'students',
        },
        {
          id: 'anc-2',
          title: 'Weekly Tahfeez & Holy Quran Memorization Review',
          sender: 'Tahfeez & Spiritual Affairs Unit',
          date: '2026-10-02',
          category: 'Spiritual',
          message: 'The weekly Quranic recitation and memorization assessment for all grades will hold on Thursday mornings before first period. Ensure daily revision of your assigned Surah.',
          pinned: false,
          audience: 'students',
        },
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultAnnouncements, null, 2), 'utf-8');
      return defaultAnnouncements;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredAnnouncements(list: any[]) {
  try {
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write announcements file:', e);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const audience = searchParams.get('audience');

    let announcements = getStoredAnnouncements();

    if (audience) {
      announcements = announcements.filter(
        (a: any) => a.audience === 'all' || a.audience === audience
      );
    }

    // Sort: pinned first, then newest date
    announcements.sort((a: any, b: any) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin' && session.role !== 'teacher')) {
      return NextResponse.json(
        { error: 'Unauthorized. Staff or Administrator credentials required to broadcast notices.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, message, category, pinned, audience } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 });
    }

    const senderTitle =
      session.email?.toLowerCase() === 'bamiebot@gmail.com' || session.role === 'super_admin'
        ? 'Governing Board / Super Administrator'
        : session.role === 'teacher'
        ? `${session.fullName || 'Subject Tutor'} (Faculty Tutor)`
        : session.fullName
        ? `${session.fullName} (School Admin)`
        : 'Office of the Principal';

    const newAnnouncement = {
      id: `anc-${Date.now()}`,
      title: title.trim(),
      sender: senderTitle,
      date: new Date().toISOString().split('T')[0],
      category: category || 'Academic',
      message: message.trim(),
      pinned: !!pinned,
      audience: audience || 'students',
    };

    const currentList = getStoredAnnouncements();
    const updatedList = [newAnnouncement, ...currentList];
    saveStoredAnnouncements(updatedList);

    return NextResponse.json({
      success: true,
      message: 'Notice broadcasted to student portal successfully!',
      announcement: newAnnouncement,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. School Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required.' }, { status: 400 });
    }

    const currentList = getStoredAnnouncements();
    const updatedList = currentList.filter((a: any) => a.id !== id);
    saveStoredAnnouncements(updatedList);

    return NextResponse.json({
      success: true,
      message: 'Broadcast notice removed from notice board.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
