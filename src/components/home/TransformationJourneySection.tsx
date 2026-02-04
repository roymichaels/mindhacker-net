/**
 * TransformationJourneySection - Visual Timeline of the 90-Day Transformation Path
 * Shows the journey from Day 1 to Mastery
 */

import { motion } from 'framer-motion';
import { 
  Rocket, 
  Target, 
  Crown,
  Sparkles,
  Check,
  ArrowRight,
  Flame,
  Star,
  Trophy,
  Zap
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const phases = [
  {
    id: 'foundation',
    days: '1-7',
    icon: Rocket,
    gradient: 'from-emerald-500 to-green-600',
    bgGlow: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 'deepWork',
    days: '8-30',
    icon: Target,
    gradient: 'from-primary to-accent',
    bgGlow: 'bg-primary/20',
    borderColor: 'border-primary/40',
  },
  {
    id: 'mastery',
    days: '31+',
    icon: Crown,
    gradient: 'from-amber-500 to-yellow-500',
    bgGlow: 'bg-amber-500/20',
    borderColor: 'border-amber-500/40',
  },
];

export default function TransformationJourneySection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const phaseVariants = {
    hidden: { opacity: 0, x: isRTL ? 50 : -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {t('home.journeyBadge')}
            </span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('home.journeyTitle')}
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('home.journeySubtitle')}
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="relative"
        >
          {/* Connecting Line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-emerald-500 via-primary to-amber-500 rounded-full hidden md:block" />
          
          {/* Phases */}
          <div className="space-y-8 md:space-y-0">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={phase.id}
                  variants={phaseVariants}
                  className={cn(
                    "relative md:flex items-center gap-8",
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  )}
                >
                  {/* Timeline Node */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      className={cn(
                        "w-16 h-16 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg border-4 border-background",
                        phase.gradient
                      )}
                      whileHover={{ scale: 1.2 }}
                      animate={{ 
                        boxShadow: [
                          '0 0 20px rgba(0,0,0,0.2)',
                          '0 0 40px rgba(0,0,0,0.3)',
                          '0 0 20px rgba(0,0,0,0.2)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>
                  </div>
                  
                  {/* Content Card */}
                  <div className={cn(
                    "flex-1",
                    isEven ? "md:pr-16 md:text-end" : "md:pl-16 md:text-start"
                  )}>
                    <motion.div
                      className={cn(
                        "p-6 sm:p-8 rounded-2xl",
                        "bg-card/80 backdrop-blur-xl",
                        "border-2",
                        phase.borderColor,
                        "hover:shadow-xl transition-all duration-500",
                        "overflow-hidden group"
                      )}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Glow */}
                      <div className={cn(
                        "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity",
                        phase.bgGlow
                      )} />
                      
                      {/* Mobile Icon */}
                      <div className="md:hidden flex justify-center mb-4">
                        <div className={cn(
                          "w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg",
                          phase.gradient
                        )}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      
                      {/* Days Badge */}
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border mb-4",
                        isEven ? "md:ml-auto" : ""
                      )}>
                        <span className="text-sm font-bold text-foreground">
                          {isRTL ? `${t('common.days')} ${phase.days}` : `Day ${phase.days}`}
                        </span>
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground relative z-10">
                        {t(`home.phase${phase.id.charAt(0).toUpperCase() + phase.id.slice(1)}Title`)}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 relative z-10 leading-relaxed">
                        {t(`home.phase${phase.id.charAt(0).toUpperCase() + phase.id.slice(1)}Desc`)}
                      </p>
                      
                      {/* Features */}
                      <ul className={cn(
                        "space-y-2 relative z-10",
                        isEven ? "md:items-end" : ""
                      )}>
                        {[1, 2, 3].map((i) => (
                          <li 
                            key={i} 
                            className={cn(
                              "flex items-center gap-2",
                              isEven ? "md:flex-row-reverse" : ""
                            )}
                          >
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground/80">
                              {t(`home.phase${phase.id.charAt(0).toUpperCase() + phase.id.slice(1)}Feature${i}`)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                  
                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Gamification Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-6 py-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="text-start">
                <div className="text-xs text-muted-foreground">{t('home.journeyXpLabel')}</div>
                <div className="font-bold text-foreground">+12,000 XP</div>
              </div>
            </div>
            
            <div className="w-px h-10 bg-border hidden sm:block" />
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="text-start">
                <div className="text-xs text-muted-foreground">{t('home.journeyLevelLabel')}</div>
                <div className="font-bold text-foreground">Level 50+</div>
              </div>
            </div>
            
            <div className="w-px h-10 bg-border hidden sm:block" />
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div className="text-start">
                <div className="text-xs text-muted-foreground">{t('home.journeyAchievementsLabel')}</div>
                <div className="font-bold text-foreground">30+ {t('home.journeyBadgesLabel')}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/free-journey')}
            className="group relative text-lg px-10 py-7 rounded-2xl 
              bg-gradient-to-r from-primary via-primary to-accent
              hover:from-primary/90 hover:to-accent/90
              text-primary-foreground font-bold
              shadow-xl shadow-primary/25
              transition-all duration-300"
          >
            <Sparkles className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
            {t('home.journeyCta')}
            
            {/* Shine */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
