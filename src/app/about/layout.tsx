import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Our Heritage, Mission & Excellence | MSSN Islamic Model Schools Akure',
  description:
    'Discover the history, leadership, and Islamic heritage of MSSN Islamic Model Schools Akure (formerly Al-Birr Islamic Model College). Winner of 1st Position in Ondo Central Senatorial District 2025.',
  keywords: [
    'About MIMS Akure',
    'Al-Birr Islamic Model College history',
    'MSSN Akure Area Council school',
    'Islamic education history Ondo State',
    'MIMS Akure principal and leadership',
    'Islamic boarding school heritage Akure',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Our Heritage & Academic Excellence | MIMS Akure',
    description:
      'Discover the history, leadership, and Islamic heritage of MSSN Islamic Model Schools Akure (formerly Al-Birr). Winner of 1st Position in Ondo Central 2025.',
    url: 'https://mims.sch.ng/about',
    images: [{ url: '/images/campus-annex.jpg', width: 1200, height: 630, alt: 'MIMS Akure Campus' }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
