/**
 * HypnosisSection — "Reprogram Your Mind" — AI hypnosis feature showcase
 */
import { motion } from 'framer-motion';
import { Headphones, Mic, BookOpen, Activity } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const features = [
  { icon: Headphones, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Mic, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export default function HypnosisSection() {
  const { t, isRTL } = useTranslation();

  const featureData = [
    { title: t('home.hypnosis.realtimeTitle'), desc: t('home.hypnosis.realtimeDesc') },
    { title: t('home.hypnosis.karaokeTitle'), desc: t('home.hypnosis.karaokeDesc') },
    { title: t('home.hypnosis.breathingTitle'), desc: t('home.hypnosis.breathingDesc') },
    { title: t('home.hypnosis.statsTitle'), desc: t('home.hypnosis.statsDesc') },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Wave background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-violet-500/5 to-transparent" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/8 blur-[100px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-6">
            <Headphones className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-bold text-violet-400">{t('home.hypnosis.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {t('home.hypnosis.title')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.hypnosis.subtitle')}
          </p>
        </motion.div>

        {/* Visualizer mock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-6 rounded-3xl bg-card/80 backdrop-blur border border-violet-500/30 shadow-2xl shadow-violet-500/10 mb-12"
        >
          <div className="flex items-center justify-center gap-1 h-20">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-violet-500 to-cyan-400"
                animate={{ height: [8, Math.random() * 60 + 10, 8] }}
                transition={{ duration: 1.2 + Math.random() * 0.8, repeat: Infinity, delay: i * 0.05 }}
              />
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-violet-400 font-bold uppercase tracking-widest">
              {t('home.hypnosis.nowPlaying')}
            </p>
            <p className="text-sm text-foreground font-semibold mt-1">
              {t('home.hypnosis.sampleSession')}
            </p>
          </div>
        </motion.div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureData.map((f, i) => {
            const { icon: Icon, color, bg } = features[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i }}
                className="p-4 rounded-2xl bg-card/60 backdrop-blur border border-border/50"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
