/**
 * GameHeroSection - Aurora HoloOrb hero with all 14 life domains orbiting
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { CORE_DOMAINS, ARENA_DOMAINS } from '@/navigation/lifeDomains';
import { cn } from '@/lib/utils';

const ALL_DOMAINS = [...CORE_DOMAINS, ...ARENA_DOMAINS];

export default function GameHeroSection() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-primary/5 to-transparent" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
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
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isRTL ? 'מערכת הפעלה לחיים' : 'Life Operating System'}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]"
          >
            <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              {isRTL ? 'החיים שלך, משודרגים עם AI' : 'Your Life, Upgraded by AI'}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            {isRTL
              ? 'מאמן AI אישי שמכיר אותך, תוכנית 100 יום מותאמת, ומערכת שלמה ל-14 תחומים בחייך — הכל במקום אחד.'
              : 'A personal AI coach that knows you, a tailored 100-day plan, and a complete system for 14 areas of your life — all in one place.'}
          </motion.p>

          {/* Central Orb with Orbiting Domains */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, type: 'spring', stiffness: 100 }}
            className="relative mx-auto py-8"
          >
            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="w-[400px] h-[400px] rounded-full bg-primary/15 blur-[100px]"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] mx-auto">
              {/* Orbital Track */}
              <div className="absolute inset-0 rounded-full border border-border/30" />

              {/* Rotating Domains */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              >
                {ALL_DOMAINS.map((domain, index) => {
                  const angle = (index * (360 / ALL_DOMAINS.length)) * (Math.PI / 180);
                  const radius = 145;
                  const Icon = domain.icon;

                  return (
                    <motion.div
                      key={domain.id}
                      className={cn(
                        'absolute w-11 h-11 sm:w-12 sm:h-12 rounded-xl',
                        'flex items-center justify-center',
                        'bg-card/90 backdrop-blur-sm border border-border/50',
                        'shadow-lg hover:scale-110 transition-transform cursor-pointer group'
                      )}
                      style={{
                        left: `calc(50% + ${Math.cos(angle) * radius}px - 22px)`,
                        top: `calc(50% + ${Math.sin(angle) * radius}px - 22px)`,
                      }}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                      whileHover={{ scale: 1.2 }}
                      title={isRTL ? domain.labelHe : domain.labelEn}
                    >
                      <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', `text-${domain.color}-500`)} />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {isRTL ? domain.labelHe : domain.labelEn}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Central Aurora HoloOrb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {[1, 2].map((ring) => (
                    <motion.div
                      key={ring}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <motion.div
                        className={cn(
                          'rounded-full border border-primary/40',
                          ring === 1 ? 'w-44 h-44' : 'w-52 h-52'
                        )}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: ring * 0.4 }}
                      />
                    </motion.div>
                  ))}
                  <AuroraHoloOrb size={200} glow="full" className="relative z-10" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
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
                {isRTL ? '🚀 התחל את האבחון שלך' : '🚀 Start Your Assessment'}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                />
              </Button>
            </motion.div>

            <p className="text-sm text-muted-foreground">
              {isRTL ? '⏱️ 5 דקות • מותאם אישית מהיום הראשון' : '⏱️ 5 minutes • Personalized from day 1'}
            </p>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="pt-8">
            <motion.button
              onClick={scrollToContent}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors mx-auto"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm font-medium">{isRTL ? 'גלול למטה' : 'Scroll Down'}</span>
              <ChevronDown className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
