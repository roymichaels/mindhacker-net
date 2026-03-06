/**
 * AuroraCoachSection — "Your Personal AI" — Gaming-styled coach showcase
 */
import { motion } from 'framer-motion';
import { Bot, Mic, Brain, Headphones, Layers } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Orb } from '@/components/orb/Orb';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import { cn } from '@/lib/utils';

export default function AuroraCoachSection() {
  const { t, isRTL } = useTranslation();

  const auroraFeatures = [
    { icon: Bot, title: t('home.auroraCoach.coaching247Title'), desc: t('home.auroraCoach.coaching247Desc'), color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Mic, title: t('home.auroraCoach.voiceTitle'), desc: t('home.auroraCoach.voiceDesc'), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Brain, title: t('home.auroraCoach.memoryTitle'), desc: t('home.auroraCoach.memoryDesc'), color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { icon: Headphones, title: t('home.auroraCoach.hypnosisTitle'), desc: t('home.auroraCoach.hypnosisDesc'), color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
    { icon: Layers, title: t('home.auroraCoach.oneBrainTitle'), desc: t('home.auroraCoach.oneBrainDesc'), color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <section className="py-24 px-4 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Orb centered above content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-10"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
              style={{ width: 260, height: 260, left: -20, top: -20 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Orb profile={DEFAULT_ORB_PROFILE} size={200} state="breathing" renderer="css" showGlow />
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">{t('home.auroraCoach.badge')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black">{t('home.auroraCoach.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('home.auroraCoach.subtitle')}</p>

            <div className="space-y-3">
              {auroraFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.08 * i }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50"
                  >
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', f.bg)}>
                      <Icon className={cn('h-4 w-4', f.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
