/**
 * AuroraCoachSection - Aurora AI with Cross-Pillar Intelligence
 * Shows orbiting ego states and conversation preview demonstrating holistic awareness
 */

import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Shield, Heart, Eye, Zap, Flame, Sun, Moon, Crown, Feather, Brain, Clock, Bot } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { CSSOrb } from '@/components/orb';
import { cn } from '@/lib/utils';

const auroraFeatures = [
  { icon: '💬', key: 'auroraFeature1' },
  { icon: '🎭', key: 'auroraFeature2' },
  { icon: '🧘', key: 'auroraFeature3' },
  { icon: '🔍', key: 'auroraFeature4' },
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

// Conversation examples showing cross-pillar awareness
const conversationExamples = [
  { key: 'auroraConvoExample1', delay: 0 },
  { key: 'auroraConvoExample2', delay: 0.2 },
  { key: 'auroraConvoExample3', delay: 0.4 },
];

export default function AuroraCoachSection() {
  const { t, isRTL } = useTranslation();

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/50 via-muted/20 to-transparent dark:from-gray-900/50 dark:via-gray-950/30 dark:to-transparent overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Large Aurora Orb with orbiting Ego States */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center order-2 lg:order-1"
          >
            <div className="relative">
              {/* Main Aurora Orb - Much larger */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto">
                <CSSOrb size={320} />
                
                {/* Breathing glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Orbiting Ego State Icons - Continuous rotation */}
              <motion.div 
                className="absolute inset-0"
                style={{
                  width: '420px',
                  height: '420px',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-210px',
                  marginTop: '-210px',
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 60,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {egoStateIcons.map((state, index) => {
                  const Icon = state.icon;
                  const angle = (index * 30) * (Math.PI / 180);
                  const radius = 180;
                  const x = Math.cos(angle) * radius + 210;
                  const y = Math.sin(angle) * radius + 210;
                  
                  return (
                    <motion.div
                      key={state.name}
                      className={cn(
                        "absolute w-10 h-10 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm",
                        "flex items-center justify-center shadow-lg",
                        "hover:scale-125 transition-transform cursor-pointer hover:border-primary/50"
                      )}
                      style={{ 
                        left: x - 20, 
                        top: y - 20,
                      }}
                      // Counter-rotate to keep icons upright
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 60,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      whileHover={{ scale: 1.3 }}
                      title={state.name}
                    >
                      <Icon className={cn("h-5 w-5", state.color)} />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Aurora Persona, Features & Conversation Preview */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8 order-1 lg:order-2"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">24/7</span>
            </div>

            {/* Aurora Greeting */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                {t('home.auroraGreeting')}
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground">
                {t('home.auroraSubtitle')}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {auroraFeatures.map((feature, index) => (
                <motion.div
                  key={feature.key}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all hover:bg-card"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <p className="font-medium">{t(`home.${feature.key}`)}</p>
                </motion.div>
              ))}
            </div>

            {/* NEW: Conversation Preview - Cross-Pillar Intelligence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-3"
            >
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                {t('home.auroraConversationTitle')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('home.auroraConversationSubtitle')}
              </p>
              
              {/* Example Conversations */}
              <div className="space-y-2">
                {conversationExamples.map((example, i) => (
                  <motion.div
                    key={example.key}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + example.delay }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground/80 italic">
                      {t(`home.${example.key}`)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Easy Message CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <p className="text-lg font-medium">
                  {t('home.auroraEasyMessage')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
