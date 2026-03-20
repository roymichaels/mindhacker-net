/**
 * AuthModalContext — triggers the real Web3Auth SDK modal directly.
 * No custom Dialog wrapper; the SDK modal IS the auth UI.
 * After Web3Auth login, bridges to a Supabase session automatically.
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthUser,
  useIdentityToken,
} from '@web3auth/modal/react';
import { exchangeForSupabaseSession } from '@/lib/web3auth';

interface AuthModalContextType {
  openAuthModal: (view?: 'login' | 'signup', onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  isAuthenticating: boolean;
}

const AuthModalContext = createContext<AuthModalContextType>({
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isAuthenticating: false,
});

export const useAuthModal = () => useContext(AuthModalContext);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | undefined>();
  const pendingCallbackRef = useRef<(() => void) | undefined>();
  pendingCallbackRef.current = pendingCallback;

  const { isInitialized, isConnected, initError } = useWeb3Auth();
  const { connect, loading: connectLoading } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { getIdentityToken } = useIdentityToken();

  // Bridge to Supabase after Web3Auth connection
  useEffect(() => {
    if (!isConnected || !userInfo?.email) return;

    let cancelled = false;
    const doBridge = async () => {
      setIsAuthenticating(true);
      try {
        let idToken: string | undefined;
        try {
          idToken = (await getIdentityToken()) || undefined;
        } catch {
          console.warn('[Web3Auth] Could not get idToken');
        }

        await exchangeForSupabaseSession({
          email: userInfo.email!,
          name: userInfo.name,
          idToken,
        });

        if (cancelled) return;
        toast({ title: 'Login successful', description: 'Welcome back!' });
        pendingCallbackRef.current?.();
        setPendingCallback(undefined);
      } catch (err: any) {
        if (cancelled) return;
        console.error('[Web3Auth] Supabase bridge error:', err);
        toast({
          title: 'Authentication error',
          description: err?.message || 'Failed to complete authentication',
          variant: 'destructive',
        });
      } finally {
        if (!cancelled) setIsAuthenticating(false);
      }
    };

    doBridge();
    return () => { cancelled = true; };
  }, [isConnected, userInfo?.email]);

  // Auto-close on Supabase session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        pendingCallbackRef.current?.();
        setPendingCallback(undefined);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = useCallback(async (
    _view: 'login' | 'signup' = 'login',
    onSuccess?: () => void
  ) => {
    if (onSuccess) {
      setPendingCallback(() => onSuccess);
    }

    if (initError) {
      const msg = typeof initError === 'object' && initError !== null
        ? (initError as any).message || 'Authentication initialization failed'
        : String(initError);
      console.error('[Web3Auth] Init error:', initError);
      toast({
        title: 'Authentication unavailable',
        description: msg,
        variant: 'destructive',
      });
      return;
    }

    if (!isInitialized) {
      toast({
        title: 'Please wait',
        description: 'Authentication is still initializing…',
      });
      return;
    }

    try {
      // This opens the REAL Web3Auth PnP modal with all configured providers
      await connect();
    } catch (err: any) {
      // User closed modal — not an error
      if (
        err?.message?.includes('user closed') ||
        err?.message?.includes('popup') ||
        err?.code === 5000
      ) {
        return;
      }
      console.error('[Web3Auth] Connect error:', err);
      toast({
        title: 'Connection failed',
        description: err?.message || 'Could not open login',
        variant: 'destructive',
      });
    }
  }, [isInitialized, initError, connect]);

  const closeAuthModal = useCallback(() => {
    setPendingCallback(undefined);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthenticating }}>
      {children}
    </AuthModalContext.Provider>
  );
}
