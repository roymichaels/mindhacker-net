import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';
import { DashboardModal } from '@/components/dashboard/DashboardModal';

type DashboardView = 'dashboard' | 'profile';

interface AuroraActionsContextType {
  // Modal states
  hypnosisModalOpen: boolean;
  dashboardModalOpen: boolean;
  dashboardInitialView: DashboardView;
  settingsModalOpen: boolean;
  profileDrawerOpen: boolean;
  upgradeModalOpen: boolean;
  
  // Actions
  openHypnosis: () => void;
  openDashboard: (view?: DashboardView) => void;
  closeHypnosis: () => void;
  closeDashboard: () => void;
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
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  const [dashboardInitialView, setDashboardInitialView] = useState<DashboardView>('dashboard');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const openHypnosis = useCallback(() => setHypnosisModalOpen(true), []);
  const closeHypnosis = useCallback(() => setHypnosisModalOpen(false), []);

  const openDashboard = useCallback((view: DashboardView = 'dashboard') => {
    setDashboardInitialView(view);
    setDashboardModalOpen(true);
  }, []);
  const closeDashboard = useCallback(() => setDashboardModalOpen(false), []);

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
        dashboardModalOpen,
        dashboardInitialView,
        settingsModalOpen,
        profileDrawerOpen,
        upgradeModalOpen,
        openHypnosis,
        openDashboard,
        closeHypnosis,
        closeDashboard,
        openSettings,
        closeSettings,
        openProfile,
        closeProfile,
        openUpgrade,
        closeUpgrade,
      }}
    >
      {children}
      
      {/* Modals rendered at context level */}
      <HypnosisModal 
        open={hypnosisModalOpen} 
        onOpenChange={setHypnosisModalOpen} 
      />
      <DashboardModal 
        open={dashboardModalOpen} 
        onOpenChange={setDashboardModalOpen}
        initialView={dashboardInitialView}
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
