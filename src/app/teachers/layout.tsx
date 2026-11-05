import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TeacherShell from './TeacherShell';

export default async function TeacherPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login?redirect=/teachers/dashboard');
  }

  return <TeacherShell user={session}>{children}</TeacherShell>;
}
