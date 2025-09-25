import RouteGuard from '@/components/auth/RouteGuard';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { LayoutProvider } from '@/context/LayoutContext';
import React, { Children } from 'react'

const AppLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white mx-auto px-10">
      // {children}
    // </div>
    <div className='text-white'>
      {/* <RouteGuard > */}
        {/* <RouteGuard> */}

        <LayoutProvider>
          <Sidebar />
          <Header />
          <main className='mt-[100px] md:ml-[72px]'>{children}</main>
        </LayoutProvider>
        {/* </RouteGuard> */}

    </div>
  )
}

export default AppLayout
