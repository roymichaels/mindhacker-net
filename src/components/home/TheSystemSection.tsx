/**
 * TheSystemSection — "100-Day Transformation OS" — Quest progression path
 */
import { motion } from 'framer-motion';
import { ScanSearch, Map, Zap, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const phases = [
  { icon: ScanSearch, colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/40', glowClass: 'shadow-blue-500/10' },
  { icon: Map, colorClass: 'text-primary', bgClass: 'bg-primary/10', borderClass: 'border-primary/40', glowClass: 'shadow-primary/10' },
  { icon: Zap, colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/40', glowClass: 'shadow-amber-500/10' },
];

export default function TheSystemSection() {
  const { t, isRTL } = useTranslation();

  const phaseData = [
    { title: t('home.theSystem.phase1Title'), desc: t('home.theSystem.phase1Desc') },
    { title: t('home.theSystem.phase2Title'), desc: t('home.theSystem.phase2Desc') },
    { title: t('home.theSystem.phase3Title'), desc: t('home.theSystem.phase3Desc') },
  ];

  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Map className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">{t('home.theSystem.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            {t('home.theSystem.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('home.theSystem.subtitle')}
          </p>
        </motion.div>

        <div className="relative">
          {/* Quest path line */}
          <div className={cn(
            'absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-primary/50 to-amber-500/50',
            isRTL ? 'right-7 sm:right-9' : 'left-7 sm:left-9'
          )} />

          <div className="space-y-10">
            {phaseData.map((phase, i) => {
              const { icon: Icon, colorClass, bgClass, borderClass, glowClass } = phases[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 * i }}
                  className={cn('relative flex gap-6', isRTL ? 'pr-0' : 'pl-0')}
                >
                  {/* Quest marker */}
                  <div className={cn(
                    'relative z-10 shrink-0 w-14 h-14 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center border-2 shadow-lg',
                    bgClass, borderClass, glowClass
                  )}>
                    <Icon className={cn('h-6 w-6 sm:h-7 sm:w-7', colorClass)} />
                  </div>

                  {/* Content card */}
                  <div className="flex-1 p-5 rounded-2xl bg-card/60 backdrop-blur border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('text-xs font-black uppercase tracking-widest', colorClass)}>
                        {t('home.theSystem.phaseLabel')} {i + 1}
                      </span>
                      <ChevronRight className={cn('h-3 w-3', colorClass)} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2">
                      {phase.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {phase.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
