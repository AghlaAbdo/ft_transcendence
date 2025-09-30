'use client';

import { UserProvider } from '@/context/UserContext';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserProvider>{children}</UserProvider>;
}
