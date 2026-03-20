import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeb3AuthReady } from '@/providers/Web3AuthProviderWrapper';
import { lazy, Suspense } from 'react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: 'login' | 'signup';
  onSuccess?: () => void;
}

// Lazy-load the hooks-based login button so it only evaluates
// inside the Web3AuthProvider tree
const Web3AuthLoginButton = lazy(() => import('./Web3AuthLoginButton'));

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
            <Suspense fallback={
              <Button variant="outline" size="lg" className="w-full gap-2" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </Button>
            }>
              <Web3AuthLoginButton open={open} onOpenChange={onOpenChange} onSuccess={onSuccess} />
            </Suspense>
          ) : (
            <Button variant="outline" size="lg" className="w-full gap-2" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing authentication…
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
