/**
 * InlineCTA — Reusable mid-page call-to-action strip
 */
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useWelcomeGate } from '@/contexts/WelcomeGateContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface InlineCTAProps {
  variant?: 'default' | 'subtle' | 'bold';
}

export default function InlineCTA({ variant = 'default' }: InlineCTAProps) {
  const { t, isRTL } = useTranslation();
  const { openWelcomeGate } = useWelcomeGate();

  if (variant === 'subtle') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-12 flex justify-center"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Button
          size="lg"
          variant="outline"
          onClick={openWelcomeGate}
          className="rounded-full px-8 py-6 border-primary/30 hover:bg-primary/10 
            text-primary font-bold gap-2 transition-all duration-300 hover:scale-105
            shadow-lg shadow-primary/5"
        >
          <Sparkles className="h-5 w-5" />
          {isRTL ? 'התחל עכשיו — בחינם' : 'Start Now — Free'}
        </Button>
      </motion.div>
    );
  }

  if (variant === 'bold') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-16 px-4"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="container mx-auto max-w-2xl text-center space-y-4">
          <p className="text-lg text-muted-foreground font-medium">
            {isRTL ? 'מוכן לראות מה אתה באמת מסוגל?' : 'Ready to see what you\'re truly capable of?'}
          </p>
          <Button
            size="lg"
            onClick={openWelcomeGate}
            className="rounded-2xl px-10 py-7 text-lg font-black
              bg-gradient-to-r from-primary via-primary to-accent
              hover:from-primary/90 hover:to-accent/90
              text-primary-foreground border-0
              shadow-[0_0_30px_hsl(var(--primary)/0.3)]
              transition-all duration-300 hover:scale-105"
          >
            <Sparkles className={cn('h-5 w-5', isRTL ? 'ml-2' : 'mr-2')} />
            {t('home.gameHero.cta')}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Default — minimal divider-style CTA
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-10 px-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-center gap-4
        p-6 rounded-2xl bg-card/50 backdrop-blur border border-primary/10">
        <p className="text-sm text-muted-foreground text-center sm:text-start">
          {isRTL ? '5 דקות אבחון • חינם להתחלה' : '5 min diagnostic • Free to start'}
        </p>
        <Button
          onClick={openWelcomeGate}
          className="rounded-xl px-6 py-5 font-bold
            bg-gradient-to-r from-primary to-accent text-primary-foreground
            hover:from-primary/90 hover:to-accent/90 border-0
            shadow-lg shadow-primary/10 transition-all duration-300 hover:scale-105"
        >
          <Sparkles className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
          {isRTL ? 'התחל לבנות' : 'Start Building'}
        </Button>
      </div>
    </motion.div>
  );
}
