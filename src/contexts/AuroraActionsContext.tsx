import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';
import { DashboardModal } from '@/components/dashboard/DashboardModal';

type DashboardView = 'dashboard' | 'profile';

interface AuroraActionsContextType {
  // Modal states
  hypnosisModalOpen: boolean;
  dashboardModalOpen: boolean;
  dashboardInitialView: DashboardView;
  
  // Actions
  openHypnosis: () => void;
  openDashboard: (view?: DashboardView) => void;
  closeHypnosis: () => void;
  closeDashboard: () => void;
}

const AuroraActionsContext = createContext<AuroraActionsContextType | undefined>(undefined);

interface AuroraActionsProviderProps {
  children: ReactNode;
}

export function AuroraActionsProvider({ children }: AuroraActionsProviderProps) {
  const [hypnosisModalOpen, setHypnosisModalOpen] = useState(false);
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  const [dashboardInitialView, setDashboardInitialView] = useState<DashboardView>('dashboard');

  const openHypnosis = useCallback(() => {
    setHypnosisModalOpen(true);
  }, []);

  const closeHypnosis = useCallback(() => {
    setHypnosisModalOpen(false);
  }, []);

  const openDashboard = useCallback((view: DashboardView = 'dashboard') => {
    setDashboardInitialView(view);
    setDashboardModalOpen(true);
  }, []);

  const closeDashboard = useCallback(() => {
    setDashboardModalOpen(false);
  }, []);

  return (
    <AuroraActionsContext.Provider
      value={{
        hypnosisModalOpen,
        dashboardModalOpen,
        dashboardInitialView,
        openHypnosis,
        openDashboard,
        closeHypnosis,
        closeDashboard,
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
