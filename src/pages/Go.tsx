/**
 * /go — Lightweight ad landing page
 * Minimal splash: orb + headline + single CTA → /onboarding
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useConversionEvents } from '@/hooks/useConversionEvents';
import { cn } from '@/lib/utils';

export default function Go() {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const { trackLead } = useConversionEvents();

  useEffect(() => {
    // UTM params are captured by the global useUTMTracker hook
  }, []);

  const handleStart = () => {
    trackLead({ source: 'go_page' });
    navigate('/onboarding');
  };

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-background relative overflow-hidden px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-lg">
        {/* Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <PersonalizedOrb size={160} state="breathing" disablePersonalization />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight">
            {isRTL
              ? 'מוכן לשנות את החיים שלך?'
              : 'Ready to Transform Your Life?'
            }
          </h1>
          <p className="text-lg text-muted-foreground">
            {isRTL
              ? 'מערכת ההפעלה שלך לחיים מתחילה כאן — חינם.'
              : 'Your personal Life OS starts here — free.'
            }
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            onClick={handleStart}
            className="group text-xl px-12 py-8 rounded-2xl 
              bg-gradient-to-r from-primary via-primary to-accent
              hover:from-primary/90 hover:to-accent/90
              text-primary-foreground font-black
              shadow-[0_0_40px_rgba(0,0,0,0.3),0_0_60px_hsl(var(--primary)/0.3)]
              border-0 transition-all duration-300 hover:scale-105"
          >
            <Sparkles className={cn("h-6 w-6", isRTL ? "ml-3" : "mr-3")} />
            {isRTL ? '🚀 התחל עכשיו — חינם' : '🚀 Start Now — Free'}
          </Button>
        </motion.div>

        {/* Subtle trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-muted-foreground/60"
        >
          {isRTL ? 'ללא כרטיס אשראי • 5 דקות להתחלה' : 'No credit card • 5 minutes to start'}
        </motion.p>
      </div>
    </div>
  );
}
