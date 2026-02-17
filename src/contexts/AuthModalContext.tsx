import { createContext, useContext, useState, useCallback } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';

interface AuthModalContextType {
  openAuthModal: (view?: 'login' | 'signup', onSuccess?: () => void) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const useAuthModal = () => useContext(AuthModalContext);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | undefined>();

  const openAuthModal = useCallback((defaultView: 'login' | 'signup' = 'login', onSuccess?: () => void) => {
    setView(defaultView);
    setOnSuccessCallback(() => onSuccess);
    setOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setOpen(false);
    setOnSuccessCallback(undefined);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal
        open={open}
        onOpenChange={setOpen}
        defaultView={view}
        onSuccess={onSuccessCallback}
      />
    </AuthModalContext.Provider>
  );
}
