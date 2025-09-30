'use client';

import { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';

import { User } from '@/constants/auth';
import { useAuth } from '@/hooks/useAuth';

type LayoutContextType = {
  user: User;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [user, setCurrUser] = useState<User | null>(null);

  useEffect(() => {
    if (auth.user) setCurrUser(auth.user);
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
