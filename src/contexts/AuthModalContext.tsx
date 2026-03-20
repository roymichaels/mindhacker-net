/**
 * AuthModalContext — triggers the real Web3Auth SDK modal directly.
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
  const bridgedRef = useRef(false);

  const { isInitialized, isConnected, initError } = useWeb3Auth();
  const { connect, loading: connectLoading } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { getIdentityToken } = useIdentityToken();

  // Bridge to Supabase after Web3Auth connection
  const doBridge = useCallback(async () => {
    if (bridgedRef.current || isAuthenticating) return;

    const email = userInfo?.email;
    if (!email) {
      console.warn('[Web3Auth] No email from userInfo, cannot bridge to Supabase');
      toast({
        title: 'Authentication incomplete',
        description: 'No email was provided. Please try a social login method.',
        variant: 'destructive',
      });
      return;
    }

    bridgedRef.current = true;
    setIsAuthenticating(true);

    try {
      let idToken: string | undefined;
      try {
        idToken = (await getIdentityToken()) || undefined;
      } catch (e) {
        console.warn('[Web3Auth] Could not get idToken:', e);
      }

      console.log('[Web3Auth] Bridging to Supabase for:', email, 'hasIdToken:', !!idToken);

      await exchangeForSupabaseSession({
        email,
        name: userInfo?.name,
        idToken,
      });

      toast({ title: 'Login successful', description: 'Welcome back!' });
      pendingCallbackRef.current?.();
      setPendingCallback(undefined);
    } catch (err: any) {
      console.error('[Web3Auth] Supabase bridge error:', err);
      bridgedRef.current = false; // allow retry
      toast({
        title: 'Authentication error',
        description: err?.message || 'Failed to complete authentication',
        variant: 'destructive',
      });
    } finally {
      setIsAuthenticating(false);
    }
  }, [userInfo?.email, userInfo?.name, getIdentityToken, isAuthenticating]);

  // Trigger bridge when Web3Auth connects
  useEffect(() => {
    if (isConnected && userInfo?.email && !bridgedRef.current) {
      doBridge();
    }
  }, [isConnected, userInfo?.email, doBridge]);

  // Reset bridge flag on disconnect
  useEffect(() => {
    if (!isConnected) {
      bridgedRef.current = false;
    }
  }, [isConnected]);

  // Auto-trigger callback on Supabase session
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

    // If already connected to Web3Auth but not yet bridged, bridge now
    if (isConnected && userInfo?.email) {
      doBridge();
      return;
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
      console.log('[Web3Auth] Opening SDK modal...');
      await connect();
      console.log('[Web3Auth] connect() resolved, waiting for userInfo...');
      // Bridge will be triggered by the useEffect above when isConnected + userInfo update
    } catch (err: any) {
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
  }, [isInitialized, isConnected, initError, connect, userInfo?.email, doBridge]);

  const closeAuthModal = useCallback(() => {
    setPendingCallback(undefined);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthenticating }}>
      {children}
    </AuthModalContext.Provider>
  );
}
