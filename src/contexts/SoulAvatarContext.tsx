/**
 * SoulAvatarContext — Global context for Soul Avatar mint wizard visibility.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface SoulAvatarContextType {
  wizardOpen: boolean;
  openWizard: () => void;
  closeWizard: () => void;
}

const SoulAvatarContext = createContext<SoulAvatarContextType>({
  wizardOpen: false,
  openWizard: () => {},
  closeWizard: () => {},
});

export const useSoulAvatarWizard = () => useContext(SoulAvatarContext);

export function SoulAvatarProvider({ children }: { children: ReactNode }) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const openWizard = useCallback(() => setWizardOpen(true), []);
  const closeWizard = useCallback(() => setWizardOpen(false), []);

  return (
    <SoulAvatarContext.Provider value={{ wizardOpen, openWizard, closeWizard }}>
      {children}
    </SoulAvatarContext.Provider>
  );
}
