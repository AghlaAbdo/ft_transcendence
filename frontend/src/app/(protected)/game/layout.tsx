'use client';

import { useEffect } from 'react';

import { socket } from '@/app/(protected)/lib/socket';
import { UserProvider } from '@/context/UserContext';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    socket.connect();
  }, []);

  return <UserProvider>{children}</UserProvider>;
}
