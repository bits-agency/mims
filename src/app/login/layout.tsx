import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal Sign In | MSSN Islamic Model Schools Akure',
  description:
    'Secure sign-in for MIMS students, parents, faculty members, bursary officers, and administrators.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
