/**
 * @module contexts/CoachesModalContext
 * @purpose Global context to open the coaches directory modal from anywhere
 * @data CoachesModal component
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CoachesModal } from '@/components/coaches/CoachesModal';

interface CoachesModalContextType {
  openCoaches: (coachId?: string) => void;
}

const CoachesModalContext = createContext<CoachesModalContextType | null>(null);

export const useCoachesModal = () => {
  const ctx = useContext(CoachesModalContext);
  if (!ctx) {
    // Return a no-op when outside provider (e.g. homepage without dashboard)
    return { openCoaches: () => {} };
  }
  return ctx;
};

/** @deprecated Use useCoachesModal */
export const usePractitionersModal = useCoachesModal;

export const CoachesModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [_selectedId, setSelectedId] = useState<string | undefined>();

  const openCoaches = useCallback((coachId?: string) => {
    setSelectedId(coachId);
    setOpen(true);
  }, []);

  return (
    <CoachesModalContext.Provider value={{ openCoaches }}>
      {children}
      <CoachesModal open={open} onOpenChange={setOpen} />
    </CoachesModalContext.Provider>
  );
};

/** @deprecated Use CoachesModalProvider */
export const PractitionersModalProvider = CoachesModalProvider;
