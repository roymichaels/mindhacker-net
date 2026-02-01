import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Orb } from '@/components/orb';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { 
  Brain, 
  Target, 
  Sparkles, 
  ArrowRight,
  Star,
  Zap,
  Clock,
  Gift,
  X
} from 'lucide-react';

const BENEFITS = [
  { icon: Brain, labelHe: 'ניתוח תודעה AI', labelEn: 'AI Analysis' },
  { icon: Target, labelHe: 'תוכנית 90 יום', labelEn: '90-Day Plan' },
  { icon: Star, labelHe: 'פרופיל זהות', labelEn: 'Identity DNA' },
  { icon: Zap, labelHe: 'ליווי אישי', labelEn: 'AI Coach' },
];

interface LaunchpadIntroProps {
  onStart: () => void;
  onSkip?: () => void;
}

export function LaunchpadIntro({ onStart, onSkip }: LaunchpadIntroProps) {
  const { isRTL } = useTranslation();
  const { profile: orbProfile } = useOrbProfile();

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 z-50" 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Gamified Card - removed aspect-square for proper content fit */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-sm flex flex-col"
      >
        {/* Glowing border effect */}
        <motion.div
          className="absolute -inset-1 rounded-3xl opacity-60 blur-lg"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))' }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Main card */}
        <div className="relative flex-1 flex flex-col rounded-3xl bg-gradient-to-br from-card via-card to-card/95 border border-white/20 shadow-2xl overflow-hidden">
          {/* Close button */}
          {onSkip && (
            <button
              onClick={onSkip}
              className={`absolute top-3 z-20 w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors ${isRTL ? 'left-3' : 'right-3'}`}
              aria-label={isRTL ? 'סגור' : 'Close'}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-accent/20 to-transparent rounded-tl-full" />
          
          {/* Badge - positioned opposite to close button */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`absolute top-3 z-10 ${isRTL ? 'right-3' : 'left-3'}`}
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold shadow-lg">
              <Gift className="w-3.5 h-3.5" />
              {isRTL ? 'חינם' : 'FREE'}
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 pt-10">
            {/* Orb */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="relative w-24 h-24 mb-4"
            >
              <Orb 
                profile={orbProfile ? { ...orbProfile, particleEnabled: false } : undefined} 
                size={96} 
                className="w-full h-full"
                showGlow={false}
              />
              {/* XP indicator */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-background"
              >
                +XP
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-4"
            >
              <h2 className="text-xl font-black mb-1 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {isRTL ? 'מסע הטרנספורמציה' : 'Transformation Journey'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'שאלון קצר → תוכנית אישית' : 'Quick quiz → Personal plan'}
              </p>
            </motion.div>

            {/* Benefits Grid - 2x2 with full text */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-3 w-full max-w-[280px] mb-4"
            >
              {BENEFITS.map((benefit, index) => (
                <motion.div
                  key={benefit.labelEn}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground/90 leading-tight">
                    {isRTL ? benefit.labelHe : benefit.labelEn}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Time */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <Clock className="w-3 h-3" />
              <span>{isRTL ? '~45 דקות' : '~45 min'}</span>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-4 pt-0">
            <Button
              size="lg"
              onClick={onStart}
              className="w-full h-12 text-base gap-2 bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/30 border border-white/20"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.span>
              {isRTL ? 'התחל את המסע' : 'Start the Journey'}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LaunchpadIntro;
