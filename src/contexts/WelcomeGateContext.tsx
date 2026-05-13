/**
 * WelcomeGateContext — DEPRECATED no-op shim.
 *
 * The legacy "Welcome / First time?" modal is removed. All entrypoints now
 * route directly to `/auth` (or `/` for signed-in users) so AION starts the
 * conversation naturally — no wizard, no marketing splash.
 *
 * Kept as a passthrough so existing callsites keep compiling.
 */
import { createContext, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface WelcomeGateContextType {
  openWelcomeGate: () => void;
}

const WelcomeGateContext = createContext<WelcomeGateContextType>({
  openWelcomeGate: () => {},
});

export const useWelcomeGate = () => useContext(WelcomeGateContext);

export function WelcomeGateProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const openWelcomeGate = useCallback(() => {
    navigate(user ? '/' : '/auth');
  }, [navigate, user]);

  return (
    <WelcomeGateContext.Provider value={{ openWelcomeGate }}>
      {children}
    </WelcomeGateContext.Provider>
  );
}
