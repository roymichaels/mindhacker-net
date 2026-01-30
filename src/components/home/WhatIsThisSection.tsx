import { motion } from 'framer-motion';
import { 
  Brain, 
  Gamepad2, 
  AudioLines,
  Sparkles,
  Clock,
  Users,
  Check
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const pillars = [
  { 
    icon: Brain, 
    key: 'ai',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30'
  },
  { 
    icon: Gamepad2, 
    key: 'gamification',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  { 
    icon: AudioLines, 
    key: 'hypnosis',
    color: 'from-teal-400 to-cyan-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30'
  },
];

const valueProps = [
  { icon: Clock, key: 'available247' },
  { icon: Sparkles, key: 'personalizedAI' },
  { icon: Users, key: 'noJudgment' },
];

export default function WhatIsThisSection() {
  const { t, isRTL } = useTranslation();

  return (
    <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-primary/5 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t('home.whatBadge')}
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.whatTitle')}
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('home.whatSubtitle')}
          </p>
        </motion.div>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -5 }}
                className={cn(
                  "relative p-6 sm:p-8 rounded-2xl",
                  "bg-card/80 backdrop-blur-sm",
                  "border",
                  pillar.borderColor,
                  "hover:shadow-xl transition-all duration-300"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-5",
                  pillar.bgColor
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                    pillar.color
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  {t(`home.pillar${pillar.key.charAt(0).toUpperCase() + pillar.key.slice(1)}Title`)}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {t(`home.pillar${pillar.key.charAt(0).toUpperCase() + pillar.key.slice(1)}Desc`)}
                </p>

                {/* Features list */}
                <ul className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-foreground/80">
                        {t(`home.pillar${pillar.key.charAt(0).toUpperCase() + pillar.key.slice(1)}Feature${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Value Props */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-6 px-4 rounded-2xl bg-card/50 border border-border/50"
        >
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <div key={prop.key} className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">
                  {t(`home.value${prop.key.charAt(0).toUpperCase() + prop.key.slice(1)}`)}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
