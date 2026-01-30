import { motion } from 'framer-motion';
import { Sparkles, Brain, Clock, Heart, Eye, Zap, Shield, Flame, Sun, Moon, Crown, Feather } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { CSSOrb } from '@/components/orb';
import { cn } from '@/lib/utils';

const coachingFeatures = [
  { icon: '💬', key: 'coachingFeature1' },
  { icon: '🎭', key: 'coachingFeature2' },
  { icon: '🧘', key: 'coachingFeature3' },
  { icon: '🔍', key: 'coachingFeature4' },
  { icon: '⏰', key: 'coachingFeature5' },
];

// Ego state icons representing the 12 states
const egoStateIcons = [
  { icon: Shield, color: 'text-blue-400', name: 'Guardian' },
  { icon: Heart, color: 'text-pink-400', name: 'Healer' },
  { icon: Eye, color: 'text-purple-400', name: 'Mystic' },
  { icon: Sparkles, color: 'text-cyan-400', name: 'Visionary' },
  { icon: Zap, color: 'text-yellow-400', name: 'Warrior' },
  { icon: Flame, color: 'text-red-400', name: 'Rebel' },
  { icon: Sun, color: 'text-orange-400', name: 'Creator' },
  { icon: Moon, color: 'text-indigo-400', name: 'Sage' },
  { icon: Crown, color: 'text-amber-400', name: 'King' },
  { icon: Feather, color: 'text-teal-400', name: 'Lover' },
  { icon: Brain, color: 'text-emerald-400', name: 'Explorer' },
  { icon: Clock, color: 'text-violet-400', name: 'Magician' },
];

export default function ConsciousnessCoachingSection() {
  const { t, isRTL } = useTranslation();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">24/7</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.coachingTitle')}
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.coachingSubtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Orb with Ego States */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="relative">
              {/* Aurora Orb */}
              <div className="relative w-48 h-48 mx-auto">
                <CSSOrb size={192} />
              </div>

              {/* Orbiting Ego State Icons */}
              <div className="absolute inset-0 w-80 h-80 -top-16 -left-16">
                {egoStateIcons.map((state, index) => {
                  const Icon = state.icon;
                  const angle = (index * 30 - 90) * (Math.PI / 180);
                  const radius = 140;
                  const x = Math.cos(angle) * radius + 160;
                  const y = Math.sin(angle) * radius + 160;
                  
                  return (
                    <motion.div
                      key={state.name}
                      className={cn(
                        "absolute w-8 h-8 rounded-full bg-card border border-border/50 flex items-center justify-center",
                        "hover:scale-125 transition-transform cursor-pointer"
                      )}
                      style={{ left: x - 16, top: y - 16 }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      title={state.name}
                    >
                      <Icon className={cn("h-4 w-4", state.color)} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right - Features List */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {coachingFeatures.map((feature, index) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <span className="text-2xl">{feature.icon}</span>
                <p className="font-medium">{t(`home.${feature.key}`)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
