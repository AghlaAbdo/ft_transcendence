'use client';

import { useEffect } from 'react';

import { socket } from '@/app/(protected)/lib/socket';
import { UserProvider } from '@/context/UserContext';
import { useAuth } from '@/hooks/useAuth';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  useEffect(() => {
    if (auth.user) {
      socket.connect();
      socket.emit('hello', String(auth.user.id));
      return () => {
        socket.off();
        socket.disconnect();
      };
    }
  }, [auth.user]);

  return <UserProvider>{children}</UserProvider>;
}
