import { createContext, useContext, useState, useCallback } from 'react';
import { WelcomeGateModal } from '@/components/modals/WelcomeGateModal';

interface WelcomeGateContextType {
  openWelcomeGate: () => void;
}

const WelcomeGateContext = createContext<WelcomeGateContextType>({
  openWelcomeGate: () => {},
});

export const useWelcomeGate = () => useContext(WelcomeGateContext);

export function WelcomeGateProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openWelcomeGate = useCallback(() => setOpen(true), []);

  return (
    <WelcomeGateContext.Provider value={{ openWelcomeGate }}>
      {children}
      <WelcomeGateModal open={open} onOpenChange={setOpen} />
    </WelcomeGateContext.Provider>
  );
}
