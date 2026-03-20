import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { exchangeForSupabaseSession } from '@/lib/web3auth';

// Conditionally import Web3Auth hooks — they're only available when
// the Web3AuthProvider has been rendered (i.e. client ID was fetched).
let useWeb3AuthConnect: any;
let useWeb3AuthDisconnect: any;
let useWeb3AuthUser: any;
let useWeb3Auth: any;

try {
  const mod = require('@web3auth/modal/react');
  useWeb3AuthConnect = mod.useWeb3AuthConnect;
  useWeb3AuthDisconnect = mod.useWeb3AuthDisconnect;
  useWeb3AuthUser = mod.useWeb3AuthUser;
  useWeb3Auth = mod.useWeb3Auth;
} catch {
  // Will be undefined if provider not mounted
}

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

  // Attempt to use Web3Auth hooks (available when provider is mounted)
  let w3aConnect: any = null;
  let w3aUser: any = null;
  let w3aState: any = null;

  try {
    if (useWeb3AuthConnect) w3aConnect = useWeb3AuthConnect();
    if (useWeb3AuthUser) w3aUser = useWeb3AuthUser();
    if (useWeb3Auth) w3aState = useWeb3Auth();
  } catch {
    // Hooks not available — provider not mounted
  }

  const sdkReady = !!w3aConnect && !!w3aState?.isInitialized;

  const handleConnect = async () => {
    setAuthError(null);

    if (!sdkReady) {
      setAuthError('Authentication service is still loading. Please try again in a moment.');
      return;
    }

    try {
      // Opens the native Web3Auth / MetaMask Embedded Wallets modal
      await w3aConnect.connect();
    } catch (err: any) {
      // User closed popup → not a real error
      if (err?.message?.includes('user closed') || err?.message?.includes('popup') || err?.code === 5000) {
        return;
      }
      console.error('[AuthModal] Web3Auth connect error:', err);
      setAuthError(err?.message || 'Connection failed');
      return;
    }

    // After connect, get user info and bridge to Supabase
    setIsBridging(true);
    try {
      const userInfo = w3aUser?.userInfo;
      if (!userInfo?.email) {
        // Try getting from the web3auth instance directly
        const info = await w3aState.web3Auth?.getUserInfo();
        if (!info?.email) {
          throw new Error('No email returned from authentication');
        }
        await bridgeToSupabase(info);
      } else {
        await bridgeToSupabase(userInfo);
      }

      toast({ title: t('messages.loginSuccess'), description: t('messages.welcomeBack') });
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error('[AuthModal] Supabase bridge error:', err);
      setAuthError(err?.message || 'Failed to complete authentication');
    } finally {
      setIsBridging(false);
    }
  };

  const bridgeToSupabase = async (info: { email: string; name?: string; idToken?: string }) => {
    // Get the id token for verification
    let idToken = info.idToken;
    if (!idToken && w3aState?.web3Auth) {
      try {
        const tokenResult = await w3aState.web3Auth.authenticateUser();
        idToken = tokenResult?.idToken;
      } catch {
        console.warn('[AuthModal] Could not get idToken, proceeding without verification');
      }
    }

    await exchangeForSupabaseSession({
      email: info.email,
      name: info.name,
      idToken: idToken,
    });
  };

  const isLoading = w3aConnect?.loading || isBridging || w3aState?.isInitializing;

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
          {/* Error display */}
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
                {isBridging ? 'Setting up session…' : 'Connecting…'}
              </>
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 784.37 1277.39" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <polygon fill="#343434" points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54" />
                    <polygon fill="#8C8C8C" points="392.07,0 0,650.54 392.07,882.29 392.07,472.33" />
                    <polygon fill="#3C3C3B" points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89" />
                    <polygon fill="#8C8C8C" points="392.07,1277.38 392.07,956.52 0,724.89" />
                    <polygon fill="#141414" points="392.07,882.29 784.13,650.54 392.07,472.33" />
                    <polygon fill="#393939" points="0,650.54 392.07,882.29 392.07,472.33" />
                  </g>
                </svg>
                Sign in with Web3Auth
              </>
            )}
          </Button>

          {!sdkReady && !w3aState?.isInitializing && (
            <p className="text-xs text-center text-muted-foreground">
              Loading authentication service…
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
