import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us, Campuses & Location Directory | MSSN Islamic Model Schools Akure',
  description:
    'Visit our 3 modern campuses in Akure: Madinah Main College, Omi Eja Primary Campus, and High School Center. Call +234 803 358 1947 or send an official registry inquiry.',
  keywords: [
    'MIMS Akure contact number',
    'Al-Birr Islamic Model College address',
    'MSSN school Akure location',
    'Madinah campus Akure',
    'Omi Eja campus Akure',
  ],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Campuses, Directory & Registry Contact | MIMS Akure',
    description:
      'Locate our 3 campuses across Akure metropolis. Speak directly with admissions officers and school administrators.',
    url: 'https://mims.sch.ng/contact',
    images: [{ url: '/images/campus-annex.jpg', width: 1200, height: 630, alt: 'MIMS Campuses' }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
