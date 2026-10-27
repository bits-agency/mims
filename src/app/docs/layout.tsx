import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'School Policy, Academic Handbook & Curriculum Documentation | MIMS Akure',
  description:
    'Comprehensive public documentation for MSSN Islamic Model Schools Akure: Academic regulations, WAEC/NECO accreditation, fee schedules, Hifzul Qur’an rules, and code of conduct.',
  keywords: [
    'MIMS Akure student handbook',
    'MSSN Islamic school academic policy',
    'Al-Birr College code of conduct',
    'Hifzul Quran syllabus Akure',
    'WAEC NBAIS curriculum Akure',
  ],
  alternates: {
    canonical: '/docs',
  },
  openGraph: {
    title: 'Academic Handbook & Institutional Policy Docs | MIMS Akure',
    description:
      'Official guidelines, grading standards, dress codes, and educational philosophy of MSSN Islamic Model Schools Akure.',
    url: 'https://mims.sch.ng/docs',
    images: [{ url: '/images/library-study.jpg', width: 1200, height: 630, alt: 'MIMS Library' }],
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
