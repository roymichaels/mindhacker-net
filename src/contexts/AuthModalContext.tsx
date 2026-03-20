/**
 * AuthModalContext — triggers the real Web3Auth SDK modal directly.
 * After Web3Auth login, bridges to a Supabase session automatically.
 *
 * IMPORTANT: Bridging only happens after an explicit user-initiated login.
 * The SDK may retain a cached connection between page loads; we must NOT
 * auto-bridge from that cached state — otherwise logout is impossible.
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthUser,
  useIdentityToken,
  useWeb3AuthDisconnect,
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

  /** Force-close the Web3Auth modal DOM and backdrop */
  const forceCloseW3AModal = useCallback(() => {
    // Hide modal
    const modal = document.getElementById('w3a-modal') || document.querySelector('[class*="w3a-modal"]');
    if (modal) {
      (modal as HTMLElement).style.display = 'none';
      // Also try the parent container
      const parent = modal.closest('[id^="w3a"]');
      if (parent) (parent as HTMLElement).style.display = 'none';
    }
    // Also click the close button if present
    const closeBtn = document.querySelector('[class*="w3a-header__button"]') as HTMLElement;
    closeBtn?.click();
    // Hide backdrop
    const backdrop = document.getElementById('w3a-backdrop');
    if (backdrop) {
      backdrop.style.opacity = '0';
      backdrop.style.pointerEvents = 'none';
    }
  }, []);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | undefined>();
  const pendingCallbackRef = useRef<(() => void) | undefined>();
  pendingCallbackRef.current = pendingCallback;
  const bridgedRef = useRef(false);

  // Gate: only bridge when the user explicitly clicked "sign in"
  const loginIntentRef = useRef(false);

  const { isInitialized, isConnected, initError } = useWeb3Auth();
  const { connect } = useWeb3AuthConnect();
  const { userInfo, getUserInfo } = useWeb3AuthUser();
  const { getIdentityToken } = useIdentityToken();
  const { disconnect } = useWeb3AuthDisconnect();

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

        // Clean up SDK connection after successful bridge
        try {
          await disconnect({ cleanup: true });
        } catch (e) {
          console.warn('[Web3Auth] Disconnect after bridge (non-blocking):', e);
        }

        // Force-close the Web3Auth modal DOM element
        forceCloseW3AModal();

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
        loginIntentRef.current = false;
      }
    },
    [userInfo?.email, userInfo?.name, getIdentityToken, isAuthenticating, disconnect]
  );

  // Fallback bridge: only when user explicitly initiated login
  useEffect(() => {
    if (loginIntentRef.current && isConnected && userInfo?.email && !bridgedRef.current) {
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
      // Only fire callback when there's an active login intent
      if (loginIntentRef.current && session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        pendingCallbackRef.current?.();
        setPendingCallback(undefined);
        loginIntentRef.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // On mount: if SDK has a stale cached connection, disconnect it silently
  // and block any auto-bridge from the cached state.
  const mountCleanupDone = useRef(false);
  useEffect(() => {
    if (mountCleanupDone.current) return;
    if (!isInitialized) return;
    mountCleanupDone.current = true;

    if (isConnected) {
      console.log('[Web3Auth] Clearing stale SDK connection on mount');
      // Mark bridged to prevent any race with the fallback bridge effect
      bridgedRef.current = true;
      disconnect({ cleanup: true }).catch(() => {}).finally(() => {
        // After disconnect, reset bridgedRef so future intentional logins work
        bridgedRef.current = false;
      });
    }
  }, [isInitialized, isConnected, disconnect]);

  const openAuthModal = useCallback(
    async (_view: 'login' | 'signup' = 'login', onSuccess?: () => void) => {
      if (isAuthenticating) return;

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

      // Mark explicit user intent so the bridge is allowed
      loginIntentRef.current = true;
      bridgedRef.current = false;

      try {
        // Always disconnect first to clear any cached SDK session,
        // ensuring the modal shows fresh provider options.
        if (isConnected) {
          try {
            await disconnect({ cleanup: true });
          } catch {
            // non-blocking
          }
        }

        console.log('[Web3Auth] Opening SDK modal...');
        await connect();

        // Fetch user info — retry as it may take a moment after connect
        let resolvedEmail: string | undefined;
        let resolvedName: string | undefined;

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const info = await getUserInfo();
            console.log(`[Web3Auth] getUserInfo() attempt ${attempt + 1}:`, JSON.stringify(info));

            if (info) {
              resolvedEmail = (info as any).email
                || (info as any).verifierId
                || (info as any).verifier_id;
              resolvedName = (info as any).name
                || (info as any).displayName;
            }
          } catch (e) {
            console.warn(`[Web3Auth] getUserInfo attempt ${attempt + 1} failed:`, e);
          }

          if (resolvedEmail) break;

          if (userInfo?.email) {
            resolvedEmail = userInfo.email;
            resolvedName = userInfo.name;
            break;
          }

          await new Promise((r) => setTimeout(r, 800));
        }

        if (resolvedEmail) {
          await doBridge({ email: resolvedEmail, name: resolvedName });
        } else {
          console.error('[Web3Auth] No email found after all attempts');
          loginIntentRef.current = false;
          toast({
            title: 'Authentication incomplete',
            description: 'Could not retrieve your email. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        loginIntentRef.current = false;
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
    [isInitialized, isConnected, initError, connect, disconnect, getUserInfo, userInfo?.email, doBridge, isAuthenticating]
  );

  const closeAuthModal = useCallback(() => {
    loginIntentRef.current = false;
    setPendingCallback(undefined);
    disconnect({ cleanup: true }).catch(() => {});
  }, [disconnect]);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthenticating }}>
      {children}
    </AuthModalContext.Provider>
  );
}
