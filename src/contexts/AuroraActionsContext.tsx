import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';

interface AuroraActionsContextType {
  hypnosisModalOpen: boolean;
  settingsModalOpen: boolean;
  profileDrawerOpen: boolean;
  upgradeModalOpen: boolean;
  
  openHypnosis: () => void;
  closeHypnosis: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openProfile: () => void;
  closeProfile: () => void;
  openUpgrade: () => void;
  closeUpgrade: () => void;
}

const AuroraActionsContext = createContext<AuroraActionsContextType | undefined>(undefined);

interface AuroraActionsProviderProps {
  children: ReactNode;
}

export function AuroraActionsProvider({ children }: AuroraActionsProviderProps) {
  const [hypnosisModalOpen, setHypnosisModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const openHypnosis = useCallback(() => setHypnosisModalOpen(true), []);
  const closeHypnosis = useCallback(() => setHypnosisModalOpen(false), []);

  const openSettings = useCallback(() => setSettingsModalOpen(true), []);
  const closeSettings = useCallback(() => setSettingsModalOpen(false), []);

  const openProfile = useCallback(() => setProfileDrawerOpen(true), []);
  const closeProfile = useCallback(() => setProfileDrawerOpen(false), []);

  const openUpgrade = useCallback(() => setUpgradeModalOpen(true), []);
  const closeUpgrade = useCallback(() => setUpgradeModalOpen(false), []);

  return (
    <AuroraActionsContext.Provider
      value={{
        hypnosisModalOpen,
        settingsModalOpen,
        profileDrawerOpen,
        upgradeModalOpen,
        openHypnosis,
        closeHypnosis,
        openSettings,
        closeSettings,
        openProfile,
        closeProfile,
        openUpgrade,
        closeUpgrade,
      }}
    >
      {children}
      
      <HypnosisModal 
        open={hypnosisModalOpen} 
        onOpenChange={setHypnosisModalOpen} 
      />
    </AuroraActionsContext.Provider>
  );
}

export function useAuroraActions() {
  const context = useContext(AuroraActionsContext);
  if (context === undefined) {
    throw new Error('useAuroraActions must be used within an AuroraActionsProvider');
  }
  return context;
}
