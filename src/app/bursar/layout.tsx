import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BursarShell from './BursarShell';

export default async function BursarPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login?redirect=/bursar/dashboard');
  }

  return <BursarShell user={session}>{children}</BursarShell>;
}
