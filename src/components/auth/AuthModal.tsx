import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';
import { z } from 'zod';
import { useTranslation } from '@/hooks/useTranslation';
import { loginWithProvider, exchangeForSupabaseSession, type Web3AuthProvider } from '@/lib/web3auth';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: 'login' | 'signup';
  onSuccess?: () => void;
}

/* ---------- icons (unchanged) ---------- */

const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

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
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const emailSchema = z.string().trim().email(t('validation.invalidEmail')).max(255).toLowerCase();

  /**
   * Unified handler: authenticate via Web3Auth → exchange for Supabase session.
   */
  const handleLogin = async (provider: Web3AuthProvider, emailHint?: string) => {
    setIsLoading(true);
    setLoadingProvider(provider);

    try {
      // 1. Authenticate with Web3Auth (opens popup)
      const userInfo = await loginWithProvider(provider, emailHint);

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
      setLoadingProvider(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({ title: t('validation.validationError'), description: result.error.errors[0].message, variant: 'destructive' });
      return;
    }
    await handleLogin('email_passwordless', result.data);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEmail('');
      setLoadingProvider(null);
    }
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
          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              disabled={isLoading}
              onClick={() => handleLogin('google')}
            >
              {loadingProvider === 'google' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Google
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              disabled={isLoading}
              onClick={() => handleLogin('apple')}
            >
              {loadingProvider === 'apple' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AppleIcon />
              )}
              Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('auth.orWithEmail')}
              </span>
            </div>
          </div>

          {/* Email login */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="auth-email">{t('auth.email')}</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
              size="lg"
            >
              {loadingProvider === 'email_passwordless' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {t('auth.sendCodeToEmail')}
            </Button>
          </form>

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
