'use client';

import { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';

import { User } from '@/constants/auth';
import { UserInfo } from '@/constants/game';
import { useAuth } from '@/hooks/useAuth';

type LayoutContextType = {
  user: UserInfo;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [user, setCurrUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (auth.user) setCurrUser({ ...auth.user, id: String(auth.user.id) });
  }, [auth.user]);

  return !user ? (
    <div></div>
  ) : (
    <LayoutContext.Provider value={{ user }}>{children}</LayoutContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used inside UserProvider');
  return ctx;
}
