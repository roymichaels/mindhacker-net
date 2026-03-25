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
  idToken?: string;
};

const asNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeIdentityEmail = (candidate?: string): string | undefined => {
  if (!candidate) return undefined;
  const trimmed = candidate.trim().toLowerCase();
  if (!trimmed) return undefined;

  if (trimmed.includes('@')) return trimmed;

  const normalized = trimmed.replace(/^0x/, '').replace(/[^a-z0-9]/g, '');
  if (!normalized) return undefined;

  return `${normalized.slice(0, 48)}@wallet.mindos.app`;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const [, payloadPart] = token.split('.');
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const resolveIdentityFromAny = (value: unknown): BasicWeb3AuthUser => {
  if (!value || typeof value !== 'object') return {};

  const source = value as Record<string, unknown>;

  let walletAddress: string | undefined;
  if (Array.isArray(source.wallets) && source.wallets.length > 0) {
    const firstWallet = source.wallets[0];
    if (firstWallet && typeof firstWallet === 'object') {
      const walletObj = firstWallet as Record<string, unknown>;
      walletAddress =
        asNonEmptyString(walletObj.public_key) ||
        asNonEmptyString(walletObj.publicKey) ||
        asNonEmptyString(walletObj.address);
    }
  }

  const rawIdentity =
    asNonEmptyString(source.email) ||
    asNonEmptyString(source.verifierId) ||
    asNonEmptyString(source.verifier_id) ||
    asNonEmptyString(source.wallet_address) ||
    asNonEmptyString(source.public_address) ||
    asNonEmptyString(source.publicAddress) ||
    asNonEmptyString(source.walletAddress) ||
    asNonEmptyString(source.address) ||
    asNonEmptyString(source.sub) ||
    walletAddress;

  const email = normalizeIdentityEmail(rawIdentity);

  const name =
    asNonEmptyString(source.name) ||
    asNonEmptyString(source.displayName) ||
    asNonEmptyString(source.verifier) ||
    (email?.endsWith('@wallet.mindos.app') ? 'Wallet User' : undefined);

  return { email, name };
};

const resolveIdentityFromIdToken = (idToken?: string): BasicWeb3AuthUser => {
  if (!idToken) return {};
  const payload = decodeJwtPayload(idToken);
  if (!payload) return {};
  return resolveIdentityFromAny(payload);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

      const fallbackIdentity = resolveIdentityFromAny(userInfo);
      const email = sourceUser?.email || fallbackIdentity.email;
      const name = sourceUser?.name || fallbackIdentity.name;

      if (!email) {
        console.warn('[Web3Auth] No identity found, cannot bridge to backend session');
        loginIntentRef.current = false;
        return;
      }

      bridgedRef.current = true;
      setIsAuthenticating(true);

      try {
        let idToken: string | undefined = sourceUser?.idToken;
        if (!idToken) {
          try {
            idToken = (await getIdentityToken()) || undefined;
          } catch (e) {
            console.warn('[Web3Auth] Could not get idToken:', e);
          }
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
        try {
          await disconnect({ cleanup: true });
        } catch {
          // non-blocking
        }
        forceCloseW3AModal();
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
    [disconnect, forceCloseW3AModal, getIdentityToken, isAuthenticating, userInfo]
  );

  // Fallback bridge: only when user explicitly initiated login
  useEffect(() => {
    const resolvedIdentity = resolveIdentityFromAny(userInfo);
    if (loginIntentRef.current && isConnected && resolvedIdentity.email && !bridgedRef.current) {
      doBridge(resolvedIdentity);
    }
  }, [isConnected, userInfo, doBridge]);

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
      disconnect({ cleanup: true })
        .catch(() => {})
        .finally(() => {
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

        // Fetch identity from Web3Auth auth data only. Avoid provider/RPC probes here.
        let resolvedEmail: string | undefined;
        let resolvedName: string | undefined;
        let resolvedIdToken: string | undefined;

        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const info = await getUserInfo();
            console.log(`[Web3Auth] getUserInfo() attempt ${attempt + 1}:`, JSON.stringify(info));

            const identityFromInfo = resolveIdentityFromAny(info);
            if (identityFromInfo.email) {
              resolvedEmail = identityFromInfo.email;
              resolvedName = identityFromInfo.name;
            }
          } catch (e) {
            console.warn(`[Web3Auth] getUserInfo attempt ${attempt + 1} failed:`, e);
          }

          if (!resolvedEmail) {
            try {
              resolvedIdToken = (await getIdentityToken()) || resolvedIdToken;
              const tokenIdentity = resolveIdentityFromIdToken(resolvedIdToken);
              if (tokenIdentity.email) {
                resolvedEmail = tokenIdentity.email;
                resolvedName = resolvedName || tokenIdentity.name;
                console.log(`[Web3Auth] Resolved identity from idToken (attempt ${attempt + 1})`);
              }
            } catch (e) {
              console.warn(`[Web3Auth] getIdentityToken attempt ${attempt + 1} failed:`, e);
            }
          }

          if (resolvedEmail) break;

          const liveIdentity = resolveIdentityFromAny(userInfo);
          if (liveIdentity.email) {
            resolvedEmail = liveIdentity.email;
            resolvedName = liveIdentity.name;
            break;
          }

          await sleep(250);
        }

        if (!resolvedEmail) {
          // Give the fallback bridge effect a brief chance to resolve asynchronously.
          const maxWaitMs = 1000;
          const startedAt = Date.now();
          while (!bridgedRef.current && Date.now() - startedAt < maxWaitMs) {
            await sleep(100);
          }
        }

        if (resolvedEmail) {
          await doBridge({ email: resolvedEmail, name: resolvedName, idToken: resolvedIdToken });
        } else {
          // If bridged in the meantime (via the useEffect fallback), don't show error.
          if (!bridgedRef.current) {
            console.error('[Web3Auth] No identity found after all attempts');
            loginIntentRef.current = false;
            try {
              await disconnect({ cleanup: true });
            } catch {
              // non-blocking
            }
            forceCloseW3AModal();
            toast({
              title: 'Authentication incomplete',
              description: 'Could not retrieve your email. Please try again.',
              variant: 'destructive',
            });
          }
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
        forceCloseW3AModal();
        toast({
          title: 'Connection failed',
          description: err?.message || 'Could not open login',
          variant: 'destructive',
        });
      }
    },
    [
      connect,
      disconnect,
      doBridge,
      forceCloseW3AModal,
      getIdentityToken,
      getUserInfo,
      initError,
      isAuthenticating,
      isConnected,
      isInitialized,
      userInfo,
    ]
  );

  const closeAuthModal = useCallback(() => {
    loginIntentRef.current = false;
    bridgedRef.current = false;
    setPendingCallback(undefined);
    disconnect({ cleanup: true }).catch(() => {});
  }, [disconnect]);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isAuthenticating }}>
      {children}
    </AuthModalContext.Provider>
  );
}
