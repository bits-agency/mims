import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentShell from './StudentShell';

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login?redirect=/students/dashboard');
  }

  return <StudentShell user={session}>{children}</StudentShell>;
}
