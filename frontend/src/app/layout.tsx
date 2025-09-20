import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

import { LayoutProvider } from '@/context/LayoutContext';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ping Pong',
  description: 'Challenge yourself to be the winner',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg-color`}
      >
        <LayoutProvider>
          <Sidebar />
          <Header />
          <main className='md:ml-[72px] md:mt-[72px]'>{children}</main>
        </LayoutProvider>
      </body>
    </html>
  );
}
