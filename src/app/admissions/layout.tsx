import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admissions 2026/2027 Guidelines, Fees & Entry Requirements | MIMS Akure',
  description:
    'Apply for admission into MSSN Islamic Model Schools Akure (MIMS). Open for Crèche, Nursery, Basic Primary, Junior/Senior Secondary, and Special Hifzul Qur’an boarding class.',
  keywords: [
    'MIMS Akure admissions 2026/2027',
    'MSSN Islamic school Akure entry form',
    'Al-Birr College entrance exam',
    'Islamic secondary school fees Akure',
    'Hifzul Quran boarding admission Ondo State',
  ],
  alternates: {
    canonical: '/admissions',
  },
  openGraph: {
    title: 'Admissions 2026/2027 — MSSN Islamic Model Schools Akure',
    description:
      'Enroll your child in Ondo Central\'s top Islamic and Western institution. Crèche to Senior Secondary and full Qur\'an memorization boarding.',
    url: 'https://mims.sch.ng/admissions',
    images: [{ url: '/images/primary-pupils-uniform.jpg', width: 1200, height: 630, alt: 'MIMS Pupils' }],
  },
};

export default function AdmissionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
