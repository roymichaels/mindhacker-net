import { motion } from 'framer-motion';
import { 
  Brain, 
  Gamepad2, 
  AudioLines,
  Sparkles,
  Clock,
  Users,
  Check,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const pillars = [
  { 
    icon: Brain, 
    key: 'ai',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    shadowColor: 'shadow-violet-500/20',
    glowColor: 'bg-violet-500/20'
  },
  { 
    icon: Gamepad2, 
    key: 'gamification',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    shadowColor: 'shadow-amber-500/20',
    glowColor: 'bg-amber-500/20'
  },
  { 
    icon: AudioLines, 
    key: 'hypnosis',
    color: 'from-teal-400 to-cyan-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    shadowColor: 'shadow-teal-500/20',
    glowColor: 'bg-teal-500/20'
  },
];

const valueProps = [
  { icon: Clock, key: 'available247' },
  { icon: Sparkles, key: 'personalizedAI' },
  { icon: Users, key: 'noJudgment' },
];

export default function WhatIsThisSection() {
  const { t, isRTL } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      {/* Decorative blurs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
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
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {t('home.whatBadge')}
            </span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('home.whatTitle')}
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('home.whatSubtitle')}
          </p>
        </motion.div>

        {/* Three Pillars */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6 md:gap-8 mb-14"
        >
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.key}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
                className="group relative"
              >
                {/* Card */}
                <div className={cn(
                  "relative h-full p-7 sm:p-8 rounded-3xl",
                  "bg-card/80 backdrop-blur-sm",
                  "border-2",
                  pillar.borderColor,
                  "hover:shadow-2xl transition-all duration-500",
                  pillar.shadowColor
                )}>
                  {/* Glow effect on hover */}
                  <div className={cn(
                    "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500",
                    pillar.glowColor
                  )} />
                  
                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center mb-6",
                    pillar.bgColor
                  )}>
                    <motion.div 
                      className={cn(
                        "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                        pillar.color
                      )}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="relative z-10 text-2xl font-bold mb-4 text-foreground">
                    {t(`home.pillar${pillar.key.charAt(0).toUpperCase() + pillar.key.slice(1)}Title`)}
                  </h3>

                  {/* Description */}
                  <p className="relative z-10 text-muted-foreground mb-5 leading-relaxed">
                    {t(`home.pillar${pillar.key.charAt(0).toUpperCase() + pillar.key.slice(1)}Desc`)}
                  </p>

                  {/* Features list */}
                  <ul className="relative z-10 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                          pillar.bgColor
                        )}>
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground/80">
                          {t(`home.pillar${pillar.key.charAt(0).toUpperCase() + pillar.key.slice(1)}Feature${i}`)}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Value Props Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-7 px-6 rounded-2xl 
            bg-gradient-to-r from-card/80 via-card to-card/80 
            border border-border/50 backdrop-blur-sm
            shadow-lg shadow-black/5"
        >
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <motion.div 
                key={prop.key} 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-semibold text-foreground">
                  {t(`home.value${prop.key.charAt(0).toUpperCase() + prop.key.slice(1)}`)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
