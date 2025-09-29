'use client';

import { IPlayer } from '@/constants/game';
import { createContext, useContext, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/constants/auth';
import { useEffect } from 'react';

type LayoutContextType = {
  hideHeaderSidebar: boolean;
  setHideHeaderSidebar: (hide: boolean) => void;
  user: User;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [hideHeaderSidebar, setHideHeaderSidebar] = useState(false);
  const auth = useAuth();
  const [user, setCurrUser] = useState<User | null>(null);

  useEffect(()=> {
    if (auth.user)
      setCurrUser(auth.user);
  }, [auth.user]);

  return ( 
    !user ? <div></div>
    :
    <LayoutContext.Provider value={{ hideHeaderSidebar, setHideHeaderSidebar, user }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used inside LayoutProvider');
  return ctx;
}
