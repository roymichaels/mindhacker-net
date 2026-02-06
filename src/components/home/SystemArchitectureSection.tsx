/**
 * SystemArchitectureSection - Layered Mind OS Architecture Diagram
 * Shows how Conscious → Application → Subconscious → Motivation layers work together
 */

import { motion } from 'framer-motion';
import { 
  Brain, 
  Layers, 
  Sparkles, 
  Heart,
  Gamepad2,
  AudioLines,
  ArrowDown,
  Zap,
  User,
  Briefcase,
  Users,
  Wallet,
  GraduationCap,
  Compass,
  Palette
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const layers = [
  {
    id: 'conscious',
    icon: Brain,
    gradient: 'from-violet-500 to-purple-600',
    bgGlow: 'bg-violet-500/20',
    borderColor: 'border-violet-500/40',
  },
  {
    id: 'application',
    icon: Layers,
    gradient: 'from-primary to-accent',
    bgGlow: 'bg-primary/20',
    borderColor: 'border-primary/40',
    pillars: [
      { icon: User, color: 'text-blue-400' },
      { icon: Briefcase, color: 'text-amber-400' },
      { icon: Heart, color: 'text-red-400' },
      { icon: Users, color: 'text-pink-400' },
      { icon: Wallet, color: 'text-emerald-400' },
      { icon: GraduationCap, color: 'text-indigo-400' },
      { icon: Compass, color: 'text-purple-400' },
      { icon: Palette, color: 'text-teal-400' },
    ],
  },
  {
    id: 'subconscious',
    icon: AudioLines,
    gradient: 'from-teal-500 to-cyan-600',
    bgGlow: 'bg-teal-500/20',
    borderColor: 'border-teal-500/40',
  },
  {
    id: 'motivation',
    icon: Gamepad2,
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/20',
    borderColor: 'border-amber-500/40',
  },
];

export default function SystemArchitectureSection() {
  const { t, isRTL } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const layerVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-violet-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
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
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {t('home.systemArchBadge')}
            </span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('home.systemArchTitle')}
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('home.systemArchSubtitle')}
          </p>
        </motion.div>

        {/* Layered Architecture Diagram */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-4"
        >
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            const isApplicationLayer = layer.id === 'application';
            
            return (
              <motion.div key={layer.id} variants={layerVariants}>
                {/* Connection Arrow (except first) */}
                {index > 0 && (
                  <motion.div 
                    className="flex justify-center -my-2 relative z-10"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                      <motion.div
                        animate={{ y: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowDown className="h-5 w-5 text-muted-foreground" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                
                {/* Layer Card */}
                <motion.div
                  className={cn(
                    "relative p-6 sm:p-8 rounded-2xl",
                    "bg-card/80 backdrop-blur-xl",
                    "border-2",
                    layer.borderColor,
                    "hover:shadow-xl transition-all duration-500",
                    "overflow-hidden group"
                  )}
                  whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300 } }}
                >
                  {/* Glow effect */}
                  <div className={cn(
                    "absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500",
                    layer.bgGlow
                  )} />
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
                    {/* Icon */}
                    <div className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg flex-shrink-0",
                      layer.gradient
                    )}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 text-center sm:text-start">
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
                        {t(`home.layer${layer.id.charAt(0).toUpperCase() + layer.id.slice(1)}Title`)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {t(`home.layer${layer.id.charAt(0).toUpperCase() + layer.id.slice(1)}Desc`)}
                      </p>
                    </div>
                    
                    {/* Special: Application Layer shows 7 pillar icons */}
                    {isApplicationLayer && layer.pillars && (
                      <div className="flex items-center gap-2 sm:gap-3">
                        {layer.pillars.map((pillar, i) => {
                          const PillarIcon = pillar.icon;
                          return (
                            <motion.div
                              key={i}
                              className={cn(
                                "w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center",
                                "hover:scale-110 transition-transform"
                              )}
                              whileHover={{ y: -3 }}
                              initial={{ opacity: 0, scale: 0 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.5 + i * 0.05 }}
                            >
                              <PillarIcon className={cn("h-4 w-4", pillar.color)} />
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Integration Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              {t('home.systemArchIntegration')}
            </span>
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
