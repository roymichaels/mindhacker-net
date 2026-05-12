import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

export type HubId = 'fm' | 'community' | 'study';

interface HubModalContextValue {
  activeHub: HubId | null;
  openHub: (hub: HubId) => void;
  closeHub: () => void;
}

const HubModalContext = createContext<HubModalContextValue | null>(null);

export function HubModalProvider({ children }: { children: ReactNode }) {
  const [activeHub, setActiveHub] = useState<HubId | null>(null);
  const openHub = useCallback((hub: HubId) => setActiveHub(hub), []);
  const closeHub = useCallback(() => setActiveHub(null), []);
  const value = useMemo(() => ({ activeHub, openHub, closeHub }), [activeHub, openHub, closeHub]);
  return <HubModalContext.Provider value={value}>{children}</HubModalContext.Provider>;
}

export function useHubModal() {
  const ctx = useContext(HubModalContext);
  if (!ctx) throw new Error('useHubModal must be used within HubModalProvider');
  return ctx;
}

export function useHubModalSafe() {
  return useContext(HubModalContext);
}
