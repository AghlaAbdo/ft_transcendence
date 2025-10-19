'use client';

import { createContext, useContext, useState } from 'react';

type LayoutContextType = {
  hideHeaderSidebar: boolean;
  setHideHeaderSidebar: (hide: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [hideHeaderSidebar, setHideHeaderSidebar] = useState(false);

  return (
    <LayoutContext.Provider value={{ hideHeaderSidebar, setHideHeaderSidebar }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used inside LayoutProvider');
  return ctx;
}