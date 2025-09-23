'use client';

import React, { Children } from 'react';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

import { LayoutProvider } from '@/context/LayoutContext';
import { useLayout } from '@/context/LayoutContext';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { hideHeaderSidebar } = useLayout();
  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white mx-auto px-10">
    // {children}
    // </div>
    <div className='text-white'>
      <Sidebar />
      <Header />
      <main className={`md:ml-[72px] ${!hideHeaderSidebar ? 'mt-[72px]' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
