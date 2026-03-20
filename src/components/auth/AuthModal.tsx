import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { exchangeForSupabaseSession } from '@/lib/web3auth';
import { useWeb3AuthReady } from '@/providers/Web3AuthProviderWrapper';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: 'login' | 'signup';
  onSuccess?: () => void;
}

/**
 * Inner component that uses Web3Auth hooks.
 * Only rendered when Web3AuthProvider is active.
 */
function AuthModalWithWeb3Auth({ open, onOpenChange, onSuccess }: Omit<AuthModalProps, 'defaultView'>) {
  const { t } = useTranslation();
  const [isBridging, setIsBridging] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // These imports are safe here because this component is only rendered
  // inside Web3AuthProvider
  const { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthUser, useIdentityToken } =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@web3auth/modal/react');

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
          idToken = await getIdentityToken() || undefined;
        } catch {
          console.warn('[AuthModal] Could not get idToken');
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
        console.error('[AuthModal] Supabase bridge error:', err);
        setAuthError(err?.message || 'Failed to complete authentication');
      } finally {
        if (!cancelled) setIsBridging(false);
      }
    };

    doBridge();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, userInfo?.email, open]);

  const handleConnect = async () => {
    setAuthError(null);

    if (!isInitialized) {
      setAuthError('Authentication service is still loading.');
      return;
    }

    try {
      await connect();
    } catch (err: any) {
      if (err?.message?.includes('user closed') || err?.message?.includes('popup') || err?.code === 5000) {
        return;
      }
      console.error('[AuthModal] Web3Auth connect error:', err);
      setAuthError(err?.message || 'Connection failed');
    }
  };

  const isLoading = connectLoading || isBridging || isInitializing;

  return { handleConnect, isLoading, isBridging, isInitializing, authError };
}

export function AuthModal({ open, onOpenChange, defaultView = 'login', onSuccess }: AuthModalProps) {
  const { t, isRTL } = useTranslation();
  const web3AuthReady = useWeb3AuthReady();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary text-center">
            {t('auth.connectToMindOS')}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {t('auth.connectToContinue')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {web3AuthReady ? (
            <Web3AuthLoginButton open={open} onOpenChange={onOpenChange} onSuccess={onSuccess} />
          ) : (
            <Button variant="outline" size="lg" className="w-full gap-2" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading authentication…
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground pt-2">
            {t('auth.termsAgreement')}
            <a href="/terms-of-service" target="_blank" className="text-primary hover:underline mx-1">
              {t('auth.termsOfService')}
            </a>
            {t('auth.andThe')}
            <a href="/privacy-policy" target="_blank" className="text-primary hover:underline mx-1">
              {t('auth.privacyPolicy')}
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
