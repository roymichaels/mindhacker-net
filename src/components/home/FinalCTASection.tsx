/**
 * FinalCTASection — Epic gaming CTA
 */
import { motion } from 'framer-motion';
import { useWelcomeGate } from '@/contexts/WelcomeGateContext';
import { Rocket, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { GalleryOrbView } from '@/components/orb/GalleryMorphOrb';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import { cn } from '@/lib/utils';

export default function FinalCTASection() {
  const { t, isRTL } = useTranslation();
  const { openWelcomeGate } = useWelcomeGate();

  const guarantees = [
    { icon: Shield, text: t('home.finalCta.personalJourney') },
    { icon: Clock, text: t('home.finalCta.fiveMinutes') },
    { icon: Star, text: t('home.finalCta.cancelAnytime') },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* Epic CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 sm:p-12 rounded-3xl bg-card/80 backdrop-blur border-2 border-primary/30 shadow-2xl shadow-primary/10 text-center"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />

          <div className="relative z-10 space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <GalleryOrbView profile={DEFAULT_ORB_PROFILE} geometryFamily={DEFAULT_ORB_PROFILE.geometryFamily || 'sphere'} size={100} level={100} />
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-foreground">
              {t('home.finalCta.epicTitle')}
            </h3>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={openWelcomeGate}
                className="group text-xl px-12 py-8 rounded-2xl
                  bg-gradient-to-r from-primary via-primary to-accent
                  hover:from-primary/90 hover:to-accent/90
                  text-primary-foreground font-black
                  shadow-[0_0_40px_rgba(0,0,0,0.3),0_0_60px_hsl(var(--primary)/0.3)]
                  border-0 transition-all duration-300 hover:scale-105"
              >
                <Rocket className={cn('h-6 w-6', isRTL ? 'ml-3' : 'mr-3')} />
                {t('home.finalCta.cta')}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {guarantees.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4 text-emerald-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
