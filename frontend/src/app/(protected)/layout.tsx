'use client';

import {RouteGuard} from '@/components/auth/RouteGuard';

import React from 'react';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

import { useLayout } from '@/context/LayoutContext';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { hideHeaderSidebar } = useLayout();
  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white mx-auto px-10">
    // {children}
    // </div>
    <RouteGuard>
      <div className='text-white'>
        <Sidebar />
        <Header />
        <main className={`${!hideHeaderSidebar ? 'md:ml-[72px] mt-[72px]' : ''}`}>
          {children}
        </main>
      </div>
    </RouteGuard>
  );
};

export default AppLayout;
