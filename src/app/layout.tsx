import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Matrix compressor',
  description: 'Matrix compress/decompress for system light communication.',
  category: 'website',
  generator: 'Next.js', // framework used
  manifest: '/manifest.json',
  icons: {
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#000000" />
      <link rel="icon" href="/favicon.ico" />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
