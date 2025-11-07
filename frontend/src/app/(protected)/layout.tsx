'use client';

import {RouteGuard} from '@/components/auth/RouteGuard';

import React from 'react';
import { useEffect } from 'react';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileSidebarToggle from '@/components/MobileSidebarToggle';

import { useLayout } from '@/context/LayoutContext';
import { Toaster } from 'sonner';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { hideHeaderSidebar, hideSidebar, setHideSidebar } = useLayout();

  useEffect(() => {
  function handleResize() {
    if (window.innerWidth >= 768) {
      // md breakpoint → sidebar should be visible
      setHideSidebar(false);
    } else {
      // mobile → sidebar should be hidden (your logic)
      setHideSidebar(true);
    }
  }

  handleResize(); // run once on mount
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white mx-auto px-10">
    // {children}
    // </div>
    <RouteGuard>
      <div className='text-white'>
        <MobileSidebarToggle />
        <Sidebar />
        {!hideSidebar && (
          <div
            onClick={() => setHideSidebar(true)}
            className="fixed inset-0 left-[72px] bg-black/50 md:hidden z-40"
          />
        )}
        <Header />
        <main className={`${!hideHeaderSidebar ? 'md:ml-[72px] mt-[72px]' : ''}`}>
          {children}
          <Toaster richColors position="top-right" />
        </main>
      </div>
    </RouteGuard>
  );
};

export default AppLayout;