import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { exchangeForSupabaseSession, loginWithWeb3AuthModal } from '@/lib/web3auth';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: 'login' | 'signup';
  onSuccess?: () => void;
}

/* ---------- icons (unchanged) ---------- */

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

/* ---------- component ---------- */

export function AuthModal({ open, onOpenChange, defaultView = 'login', onSuccess }: AuthModalProps) {
  const { t, isRTL } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Unified handler: open native Web3Auth modal → exchange for backend session.
   */
  const handleLogin = async () => {
    setIsLoading(true);

    try {
      // 1. Authenticate with Web3Auth (opens native modal)
      const userInfo = await loginWithWeb3AuthModal();

      // 2. Exchange Web3Auth identity for Supabase session
      await exchangeForSupabaseSession({
        email: userInfo.email,
        name: userInfo.name,
        idToken: userInfo.idToken,
      });

      toast({ title: t('messages.loginSuccess'), description: t('messages.welcomeBack') });
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      // User closed popup → not a real error
      if (err?.message?.includes('user closed') || err?.message?.includes('popup')) {
        // silently ignore
      } else {
        toast({
          title: t('auth.loginError'),
          description: err?.message || 'Login failed',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            disabled={isLoading}
            onClick={handleLogin}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Web3Auth
          </Button>

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
