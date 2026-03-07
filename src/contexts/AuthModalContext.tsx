import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/integrations/supabase/client';

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
  const openRef = useRef(open);
  openRef.current = open;

  // Auto-close modal when user signs in (covers OAuth redirects, magic links, etc.)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && openRef.current && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setOpen(false);
        onSuccessCallback?.();
        setOnSuccessCallback(undefined);
      }
    });
    return () => subscription.unsubscribe();
  }, [onSuccessCallback]);

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
