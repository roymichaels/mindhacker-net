/**
 * GameHeroSection — Cinematic hero with auto-sliding orb carousel
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { useWelcomeGate } from '@/contexts/WelcomeGateContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { SharedOrbView } from '@/components/orb/SharedOrbView';
import { GALLERY_ORBS } from '@/data/galleryOrbData';
import { useIsMobile } from '@/hooks/use-mobile';

const HERO_ORBS = GALLERY_ORBS.slice(0, 10);

const AUTO_SLIDE_INTERVAL = 3000;

export default function GameHeroSection() {
  const { t, isRTL } = useTranslation();
  const { openWelcomeGate } = useWelcomeGate();
  const isMobile = useIsMobile();

  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = HERO_ORBS.length;
  const visibleCount = isMobile ? 3 : 5;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % total);
    }, AUTO_SLIDE_INTERVAL);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const goTo = (idx: number) => {
    setActiveIndex(((idx % total) + total) % total);
    resetTimer();
  };

  const visibleIndices: number[] = [];
  const half = Math.floor(visibleCount / 2);
  for (let i = -half; i <= half; i++) {
    visibleIndices.push(((activeIndex + i) % total + total) % total);
  }

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-primary/5 to-transparent" />

      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{ left: `${20 + i * 20}%`, top: `${25 + (i % 2) * 30}%` }}
          animate={{ y: [-20, 20, -20], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7 }}
        />
      ))}

      <div className="relative z-10 container mx-auto max-w-5xl px-4 pt-4 pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
              bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20
              border border-primary/30 shadow-lg shadow-primary/10"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase tracking-wider">
              {t('home.gameHero.badge')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05]"
          >
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t('home.gameHero.title')}
            </span>
          </motion.h1>

          {/* Orb Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="relative flex items-center justify-center gap-2 sm:gap-4 md:gap-6 min-h-[180px] sm:min-h-[240px]">
              {visibleIndices.map((presetIdx, slotIdx) => {
                const preset = HERO_ORBS[presetIdx];
                const distFromCenter = slotIdx - half;
                const isCenter = distFromCenter === 0;
                const scale = isCenter ? 1 : 0.7 - Math.abs(distFromCenter) * 0.08;
                const opacity = isCenter ? 1 : 0.5 - Math.abs(distFromCenter) * 0.1;
                const orbSize = isMobile ? (isCenter ? 140 : 80) : (isCenter ? 200 : 110);

                return (
                  <motion.div
                    key={preset.id}
                    layout
                    initial={false}
                    animate={{
                      scale,
                      opacity,
                      zIndex: isCenter ? 10 : 5 - Math.abs(distFromCenter),
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={() => goTo(presetIdx)}
                    className="cursor-pointer flex items-center justify-center"
                    style={{ width: orbSize, height: orbSize }}
                  >
                    <SharedOrbView
                      profile={preset.profile}
                      geometryFamily={preset.profile.geometryFamily || 'sphere'}
                      size={orbSize}
                      level={100}
                      randomShapeCount
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {HERO_ORBS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    idx === activeIndex
                      ? 'w-5 h-1.5 bg-primary'
                      : 'w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={openWelcomeGate}
                className="group relative text-lg px-10 py-7 rounded-2xl
                  bg-gradient-to-r from-primary via-primary to-accent
                  hover:from-primary/90 hover:to-accent/90
                  text-primary-foreground font-black
                  shadow-[0_0_40px_rgba(0,0,0,0.3),0_0_60px_hsl(var(--primary)/0.3)]
                  border-0 transition-all duration-300"
              >
                <Sparkles className={cn('h-6 w-6', isRTL ? 'ml-3' : 'mr-3')} />
                {t('home.gameHero.cta')}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/founding')}
                className="text-base px-8 py-6 rounded-2xl border-primary/40 hover:border-primary/60 hover:bg-primary/10 font-bold"
              >
                {isRTL ? 'הצטרף למייסדים ⭐' : '⭐ Join Founding Members'}
              </Button>
            </motion.div>
            <p className="text-sm text-muted-foreground">
              {t('home.gameHero.ctaMeta')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
