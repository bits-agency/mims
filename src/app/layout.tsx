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
  title: 'MIMS Akure — MSSN Islamic Model Schools',
  description:
    'MSSN Islamic Model Schools Akure nurtures young minds through a balanced integration of British curriculum rigor and timeless Islamic values.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSerif.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
