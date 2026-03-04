/**
 * AuroraCoachSection - Aurora AI with HoloOrb + chat preview + feature bullets
 */
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Bot, Mic, Brain, Headphones } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { cn } from '@/lib/utils';

export default function AuroraCoachSection() {
  const { t, isRTL } = useTranslation();

  const auroraFeatures = [
    { icon: Bot, title: t('home.auroraCoach.coaching247Title'), desc: t('home.auroraCoach.coaching247Desc') },
    { icon: Mic, title: t('home.auroraCoach.voiceTitle'), desc: t('home.auroraCoach.voiceDesc') },
    { icon: Brain, title: t('home.auroraCoach.memoryTitle'), desc: t('home.auroraCoach.memoryDesc') },
    { icon: Headphones, title: t('home.auroraCoach.hypnosisTitle'), desc: t('home.auroraCoach.hypnosisDesc') },
  ];

  const conversationExamples = [
    t('home.auroraCoach.chatExample1'),
    t('home.auroraCoach.chatExample2'),
    t('home.auroraCoach.chatExample3'),
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/50 via-muted/20 to-transparent dark:from-gray-900/50 dark:via-gray-950/30 dark:to-transparent overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Aurora HoloOrb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center order-2 lg:order-1"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
                style={{ width: 300, height: 300, left: -30, top: -30 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <AuroraHoloOrb size={240} glow="full" />
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t('home.auroraCoach.badge')}
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                {t('home.auroraCoach.title')}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t('home.auroraCoach.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {auroraFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 * i }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50"
                  >
                    <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                {t('home.auroraCoach.chatPreviewTitle')}
              </h3>
              <div className="space-y-2">
                {conversationExamples.map((ex, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isRTL ? 15 : -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.15 }}
                    className="flex items-start gap-2.5"
                  >
                    <AuroraHoloOrb size={24} glow="subtle" animate={false} className="mt-1 shrink-0" />
                    <div className="flex-1 p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground/80 italic">
                      {ex}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
