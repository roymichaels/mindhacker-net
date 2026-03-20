/**
 * Web3Auth login button — triggers the REAL SDK modal (not a custom UI).
 * After successful Web3Auth login, bridges to a Supabase session.
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { exchangeForSupabaseSession } from '@/lib/web3auth';
import {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthUser,
  useIdentityToken,
} from '@web3auth/modal/react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function Web3AuthLoginButton({ open, onOpenChange, onSuccess }: Props) {
  const { t } = useTranslation();
  const [isBridging, setIsBridging] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { isInitialized, isInitializing, isConnected } = useWeb3Auth();
  const { connect, loading: connectLoading } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { getIdentityToken } = useIdentityToken();

  // Bridge to Supabase after successful Web3Auth connection
  useEffect(() => {
    if (!isConnected || !open || isBridging) return;
    if (!userInfo?.email) return;

    let cancelled = false;
    const doBridge = async () => {
      setIsBridging(true);
      setAuthError(null);
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
        toast({ title: t('messages.loginSuccess'), description: t('messages.welcomeBack') });
        onOpenChange(false);
        onSuccess?.();
      } catch (err: any) {
        if (cancelled) return;
        console.error('[Web3Auth] Supabase bridge error:', err);
        setAuthError(err?.message || 'Failed to complete authentication');
      } finally {
        if (!cancelled) setIsBridging(false);
      }
    };

    doBridge();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, userInfo?.email, open]);

  const handleConnect = useCallback(async () => {
    setAuthError(null);

    if (!isInitialized) {
      console.warn('[Web3Auth] SDK not initialized yet. isInitializing:', isInitializing);
      setAuthError('Authentication service is still loading. Please try again in a moment.');
      return;
    }

    try {
      // This opens the REAL Web3Auth / MetaMask Embedded Wallets modal
      // with all configured social logins & wallet options
      await connect();
    } catch (err: any) {
      // User closed the modal — not an error
      if (
        err?.message?.includes('user closed') ||
        err?.message?.includes('popup') ||
        err?.code === 5000
      ) {
        return;
      }
      console.error('[Web3Auth] Connect error:', err);
      setAuthError(err?.message || 'Connection failed');
    }
  }, [isInitialized, isInitializing, connect]);

  // Auto-open the SDK modal when AuthModal opens and SDK is ready
  useEffect(() => {
    if (open && isInitialized && !isConnected && !connectLoading && !isBridging) {
      handleConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isInitialized]);

  const isLoading = connectLoading || isBridging || isInitializing;

  return (
    <>
      {authError && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <Button
        variant="outline"
        size="lg"
        className="w-full gap-2"
        disabled={isLoading}
        onClick={handleConnect}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isBridging ? 'Setting up session…' : isInitializing ? 'Initializing…' : 'Opening login…'}
          </>
        ) : (
          'Sign in with Web3Auth'
        )}
      </Button>

      {isInitializing && (
        <p className="text-xs text-center text-muted-foreground animate-pulse">
          Preparing authentication…
        </p>
      )}
    </>
  );
}
