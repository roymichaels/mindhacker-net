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

type BasicWeb3AuthUser = {
  email?: string;
  name?: string;
};

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
  const { connect } = useWeb3AuthConnect();
  const { userInfo, getUserInfo } = useWeb3AuthUser();
  const { getIdentityToken } = useIdentityToken();

  const doBridge = useCallback(
    async (sourceUser?: BasicWeb3AuthUser | null) => {
      if (bridgedRef.current || isAuthenticating) return;

      const email = sourceUser?.email || userInfo?.email;
      const name = sourceUser?.name || userInfo?.name;

      if (!email) {
        console.warn('[Web3Auth] No email from user info, cannot bridge to backend session');
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

        console.log('[Web3Auth] Bridging session for:', email, 'hasIdToken:', !!idToken);

        await exchangeForSupabaseSession({ email, name, idToken });

        toast({ title: 'Login successful', description: 'Welcome back!' });
        pendingCallbackRef.current?.();
        setPendingCallback(undefined);
      } catch (err: any) {
        console.error('[Web3Auth] Backend session bridge failed:', err);
        bridgedRef.current = false;
        toast({
          title: 'Authentication error',
          description: err?.message || 'Failed to complete authentication',
          variant: 'destructive',
        });
      } finally {
        setIsAuthenticating(false);
      }
    },
    [userInfo?.email, userInfo?.name, getIdentityToken, isAuthenticating]
  );

  // Fallback bridge trigger when hooks update after connect
  useEffect(() => {
    if (isConnected && userInfo?.email && !bridgedRef.current) {
      doBridge(userInfo as BasicWeb3AuthUser);
    }
  }, [isConnected, userInfo?.email, doBridge]);

  useEffect(() => {
    if (!isConnected) bridgedRef.current = false;
  }, [isConnected]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        pendingCallbackRef.current?.();
        setPendingCallback(undefined);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = useCallback(
    async (_view: 'login' | 'signup' = 'login', onSuccess?: () => void) => {
      if (onSuccess) setPendingCallback(() => onSuccess);

      if (initError) {
        const msg =
          typeof initError === 'object' && initError !== null
            ? (initError as { message?: string }).message || 'Authentication initialization failed'
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
        if (!isConnected) {
          console.log('[Web3Auth] Opening SDK modal...');
          await connect();
        }

        // Critical: fetch user info explicitly right after connect
        const latestUser = (await getUserInfo()) as BasicWeb3AuthUser | null;
        console.log('[Web3Auth] getUserInfo() after connect:', latestUser);

        if (latestUser?.email) {
          await doBridge(latestUser);
          return;
        }

        // Fallback: if hook already has user info, bridge with it
        if (userInfo?.email) {
          await doBridge(userInfo as BasicWeb3AuthUser);
          return;
        }

        toast({
          title: 'Authentication incomplete',
          description: 'Login succeeded but no email was returned. Please try another provider.',
          variant: 'destructive',
        });
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
    },
    [isInitialized, isConnected, initError, connect, getUserInfo, userInfo?.email, doBridge]
  );

  const closeAuthModal = useCallback(() => {
    setPendingCallback(undefined);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthenticating }}>
      {children}
    </AuthModalContext.Provider>
  );
}
