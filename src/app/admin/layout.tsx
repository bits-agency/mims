import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminConsoleLayout from './AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login?redirect=/admin/dashboard');
  }

  const initialUser = {
    fullName: session.fullName,
    email: session.email,
    role: session.role,
    username: session.username,
    isSuperAdmin: session.role === 'super_admin',
  };

  return <AdminConsoleLayout initialUser={initialUser}>{children}</AdminConsoleLayout>;
}
