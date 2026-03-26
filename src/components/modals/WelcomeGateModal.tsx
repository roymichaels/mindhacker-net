/**
 * WelcomeGateModal — Gamified entry gate: "First time?" or "Welcome back"
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Rocket } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useSmartOnboarding } from '@/contexts/SmartOnboardingContext';
import { Orb } from '@/components/orb/Orb';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface WelcomeGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeGateModal({ open, onOpenChange }: WelcomeGateModalProps) {
  const { isRTL } = useTranslation();
  const { openAuthModal } = useAuthModal();
  
  const { smartNavigate } = useSmartOnboarding();

  const handleEnter = () => {
    onOpenChange(false);
    openAuthModal('login', () => {
      smartNavigate();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100vw-1rem)] max-w-md p-0 overflow-hidden border-2 border-primary/30 bg-card/95 backdrop-blur-xl shadow-[0_0_80px_hsl(var(--primary)/0.15)]"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <VisuallyHidden>
          <DialogTitle>{isRTL ? 'התחברות ל-MindOS' : 'Sign in to MindOS'}</DialogTitle>
          <DialogDescription>
            {isRTL ? 'התחבר כדי להתחיל את המסע שלך.' : 'Sign in to start your journey.'}
          </DialogDescription>
        </VisuallyHidden>

        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-5 p-4 sm:space-y-6 sm:p-8">
          {/* Orb */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-[-30%] rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.2),transparent_70%)] blur-xl pointer-events-none animate-pulse" />
              <Orb profile={DEFAULT_ORB_PROFILE} size={80} state="breathing" renderer="css" showGlow />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-2"
          >
            <h2 className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent sm:text-2xl">
              {isRTL ? 'ברוכים הבאים לאימפריה' : 'Welcome to the Empire'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'בחר את הנתיב שלך כדי להתחיל' : 'Choose your path to begin'}
            </p>
          </motion.div>

          {/* Single CTA */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Button
              onClick={handleEnter}
              className="w-full h-auto items-start gap-3 overflow-hidden rounded-2xl p-3 text-left sm:items-center sm:gap-4 sm:p-5
                bg-gradient-to-r from-primary to-accent hover:opacity-90
                text-primary-foreground font-bold text-base
                shadow-lg shadow-primary/25 transition-all duration-300 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:h-12 sm:w-12">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className={cn('min-w-0 flex-1 text-start', isRTL && 'text-start')}>
                <span className="block break-words text-sm font-bold leading-tight sm:text-base">
                  {isRTL ? 'התחל את המסע' : 'Begin Your Journey'}
                </span>
                <span className="mt-1 block text-[11px] leading-snug opacity-80 sm:text-xs">
                  {isRTL ? 'הרשמה או התחברות' : 'Sign up or sign in'}
                </span>
              </div>
              <Sparkles className="mt-1 h-4 w-4 shrink-0 opacity-70 transition-opacity group-hover:opacity-100 sm:mt-0 sm:h-5 sm:w-5" />
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
