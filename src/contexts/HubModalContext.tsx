import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

export type HubId = 'home' | 'fm' | 'strategy' | 'hypnosis' | 'journal' | 'community' | 'study';

interface HubModalCtx {
  activeHub: HubId | null;
  openHub: (id: HubId) => void;
  closeHub: () => void;
}

const Ctx = createContext<HubModalCtx | null>(null);

export function HubModalProvider({ children }: { children: ReactNode }) {
  const [activeHub, setActiveHub] = useState<HubId | null>(null);
  const openHub = useCallback((id: HubId) => setActiveHub(id), []);
  const closeHub = useCallback(() => setActiveHub(null), []);
  return <Ctx.Provider value={{ activeHub, openHub, closeHub }}>{children}</Ctx.Provider>;
}

export function useHubModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHubModal must be used within HubModalProvider');
  return ctx;
}