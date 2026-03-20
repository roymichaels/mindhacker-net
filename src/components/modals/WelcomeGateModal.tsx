/**
 * WelcomeGateModal — Gamified entry gate: "First time?" or "Welcome back"
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Rocket } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useNavigate } from 'react-router-dom';
import { useSmartOnboarding } from '@/contexts/SmartOnboardingContext';
import { Orb } from '@/components/orb/Orb';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import { cn } from '@/lib/utils';

interface WelcomeGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeGateModal({ open, onOpenChange }: WelcomeGateModalProps) {
  const { isRTL } = useTranslation();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
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
        className="sm:max-w-md p-0 overflow-hidden border-2 border-primary/30 bg-card/95 backdrop-blur-xl shadow-[0_0_80px_hsl(var(--primary)/0.15)]"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 p-8 space-y-6">
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
            <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
              className="w-full h-auto p-5 flex items-center gap-4 rounded-2xl
                bg-gradient-to-r from-primary to-accent hover:opacity-90
                text-primary-foreground font-bold text-base
                shadow-lg shadow-primary/25 transition-all duration-300 group"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <Rocket className="w-6 h-6" />
              </div>
              <div className={cn('flex-1 text-start', isRTL && 'text-start')}>
                <span className="block font-bold text-base">
                  {isRTL ? 'התחל את המסע' : 'Begin Your Journey'}
                </span>
                <span className="block text-xs opacity-80 mt-0.5">
                  {isRTL ? 'הרשמה או התחברות' : 'Sign up or sign in'}
                </span>
              </div>
              <Sparkles className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
