import type { Metadata } from 'next';

import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import { LayoutProvider } from '@/context/LayoutContext';

import './globals.css';

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

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
    // <html lang='en'>
    //   <body
    //     className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg-color`}
    //   >
    //       <Sidebar />
    //       <Header />
    //       <main className='md:ml-[72px] md:mt-[72px]'>{children}</main>
    //   </body>
    // </html>

    <html lang='en'>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-bg-color`}
      >
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
