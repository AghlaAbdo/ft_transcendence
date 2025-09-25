import {RouteGuard} from '@/components/auth/RouteGuard';
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

    <RouteGuard>
      <div className='text-white'>  
          <LayoutProvider>
            <Sidebar />
            <Header />
            <main className='mt-[100px] md:ml-[72px]'>{children}</main>
          </LayoutProvider>
      </div>
    </RouteGuard>
  )
}

export default AppLayout
