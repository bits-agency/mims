import type { Metadata } from 'next';
import { Instrument_Serif } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  variable: '--font-custom',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mimsakure.vercel.app'),
  title: {
    default: 'MSSN Islamic Model Schools Akure (MIMS) — Best Islamic & Western Education in Ondo State',
    template: '%s | MSSN Islamic Model Schools Akure',
  },
  description:
    'Awarded 1st Position in Ondo Central Senatorial District (2025). Top JAMB UTME score 285. MSSN Islamic Model Schools Akure (formerly Al-Birr Islamic Model College) offers excellence in Western curriculum, WAEC/NECO/BECE/NBAIS accreditation, and complete Hifzul Qur\'an memorization across 3 modern campuses in Akure, Ondo State.',
  keywords: [
    'MSSN Islamic Model Schools Akure',
    'MIMS Akure',
    'Al-Birr Islamic Model College Akure',
    'Best Islamic school in Ondo State',
    'Top secondary schools in Akure',
    'Islamic secondary school Akure',
    'Islamic boarding school Ondo State',
    'Hifzul Quran Akure',
    'WAEC accredited schools in Ondo State',
    'NECO examination centers Akure',
    'MSSN Akure schools',
    'Islamic private schools in Nigeria',
    'MIMS admissions 2026/2027',
  ],
  authors: [{ name: 'MSSN Akure Area Council' }, { name: 'MIMS Academic Board' }],
  creator: 'MSSN Islamic Model Schools Akure',
  publisher: 'MSSN Akure Area Council',
  category: 'Education',
  alternates: {
    canonical: 'https://mimsakure.vercel.app',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://mimsakure.vercel.app',
    siteName: 'MSSN Islamic Model Schools Akure (MIMS)',
    title: 'MSSN Islamic Model Schools Akure (MIMS) — Ranked #1 in Ondo Central',
    description:
      'Ranked 1st in Ondo Central Senatorial District (2025). 285 Top JAMB Score. 100% Malpractice-Free WAEC/NECO/BECE Exams. Comprehensive Western & Islamic education across High School, Omi Eja, and Madinah campuses.',
    images: [
      {
        url: '/images/logo.png',
        width: 800,
        height: 800,
        alt: 'MSSN Islamic Model Schools Akure Crest Logo',
      },
      {
        url: '/images/campus-annex.jpg',
        width: 1200,
        height: 630,
        alt: 'MSSN Islamic Model Schools Akure Campus Facility',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MSSN Islamic Model Schools Akure (MIMS) — Ranked #1 in Ondo Central',
    description:
      'Ranked 1st in Ondo Central Senatorial District (2025). Top JAMB UTME score 285. Fully accredited for WAEC, NECO, BECE, and NBAIS examinations.',
    images: ['/images/logo.png'],
    creator: '@mimsakure',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'MSSN Islamic Model Schools Akure',
  alternateName: ['MIMS Akure', 'Al-Birr Islamic Model College'],
  url: 'https://mimsakure.vercel.app',
  logo: 'https://mimsakure.vercel.app/images/logo.png',
  image: 'https://mimsakure.vercel.app/images/campus-annex.jpg',
  description:
    'Premier K-12 Islamic and Western educational institution in Akure, Ondo State. Winner of 1st Position in Ondo Central Senatorial District 2025.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'High School, Omi Eja & Madinah Campuses',
    addressLocality: 'Akure',
    addressRegion: 'Ondo State',
    addressCountry: 'NG',
  },
  telephone: '+2348033581947',
  award: '1st Position Ondo Central Senatorial District (2025)',
  motto: 'Knowledge is Light',
  sameAs: ['https://facebook.com/mimsakure'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#064e3b" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${instrumentSerif.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
