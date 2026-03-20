import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: 'login' | 'signup';
  onSuccess?: () => void;
}

export function AuthModal({ open, onOpenChange, defaultView = 'login', onSuccess }: AuthModalProps) {
  const { t, isRTL } = useTranslation();
  const [isBridging, setIsBridging] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { isInitialized, isInitializing, web3Auth, isConnected } = useWeb3Auth();
  const { connect, loading: connectLoading } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();

  // When user becomes connected (after connect() resolves), bridge to Supabase
  useEffect(() => {
    if (!isConnected || !open || isBridging) return;
    if (!userInfo?.email) return;

    let cancelled = false;
    const doBridge = async () => {
      setIsBridging(true);
      setAuthError(null);
      try {
        // Get idToken for backend verification
        let idToken: string | undefined;
        try {
          const tokenResult = await web3Auth?.authenticateUser();
          idToken = tokenResult?.idToken;
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
      setAuthError('Authentication service is still loading. Please try again in a moment.');
      return;
    }

    try {
      // Opens the native Web3Auth / MetaMask Embedded Wallets modal
      // with all configured login methods (social, email, wallet)
      await connect();
    } catch (err: any) {
      // User closed popup → not a real error
      if (
        err?.message?.includes('user closed') ||
        err?.message?.includes('popup') ||
        err?.code === 5000
      ) {
        return;
      }
      console.error('[AuthModal] Web3Auth connect error:', err);
      setAuthError(err?.message || 'Connection failed');
    }
  };

  const isLoading = connectLoading || isBridging || isInitializing;

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
                {isBridging ? 'Setting up session…' : isInitializing ? 'Loading…' : 'Connecting…'}
              </>
            ) : (
              'Sign in'
            )}
          </Button>

          {isInitializing && (
            <p className="text-xs text-center text-muted-foreground animate-pulse">
              Preparing authentication…
            </p>
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
