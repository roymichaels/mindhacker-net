/**
 * GameHeroSection — Cinematic minimal hero for NFT game landing
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { cn } from '@/lib/utils';

export default function GameHeroSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Dark background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/15 via-primary/5 to-transparent" />

      {/* Grid pattern */}
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

      {/* Floating particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{ left: `${20 + i * 20}%`, top: `${25 + (i % 2) * 30}%` }}
          animate={{ y: [-20, 20, -20], opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.7 }}
        />
      ))}

      <div className="relative z-10 container mx-auto max-w-4xl px-4 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-8">
          {/* Badge */}
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

          {/* Title */}
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

          {/* Central Orb — large, fast, cinematic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, type: 'spring', stiffness: 80 }}
            className="relative mx-auto py-6"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="w-[350px] h-[350px] rounded-full bg-primary/15 blur-[100px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div className="relative flex items-center justify-center">
              {[1, 2].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute rounded-full border border-primary/20"
                  style={{ width: ring === 1 ? 280 : 340, height: ring === 1 ? 280 : 340 }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: ring * 0.5 }}
                />
              ))}
              <Orb profile={DEFAULT_ORB_PROFILE} size={220} state="breathing" renderer="css" showGlow />
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={() => navigate('/onboarding')}
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
            <p className="text-sm text-muted-foreground">
              {t('home.gameHero.ctaMeta')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
