import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { PractitionersModal } from '@/components/practitioners/PractitionersModal';

interface PractitionersModalContextType {
  openPractitioners: (practitionerId?: string) => void;
}

const PractitionersModalContext = createContext<PractitionersModalContextType | null>(null);

export const usePractitionersModal = () => {
  const ctx = useContext(PractitionersModalContext);
  if (!ctx) {
    // Return a no-op when outside provider (e.g. homepage without dashboard)
    return { openPractitioners: () => {} };
  }
  return ctx;
};

export const PractitionersModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [_selectedId, setSelectedId] = useState<string | undefined>();

  const openPractitioners = useCallback((practitionerId?: string) => {
    setSelectedId(practitionerId);
    setOpen(true);
  }, []);

  return (
    <PractitionersModalContext.Provider value={{ openPractitioners }}>
      {children}
      <PractitionersModal open={open} onOpenChange={setOpen} />
    </PractitionersModalContext.Provider>
  );
};
