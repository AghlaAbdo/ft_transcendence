'use client';

import { UserProvider } from '@/context/UserContext';
import { socket } from '@/app/(protected)/lib/socket'
import { useEffect } from 'react';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(()=>{
    socket.connect();
  }, []);

  return <UserProvider>{children}</UserProvider>;
}
