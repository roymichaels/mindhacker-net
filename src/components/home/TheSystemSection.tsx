/**
 * TheSystemSection - 3-phase vertical timeline: Assess → Strategize → Execute
 */
import { motion } from 'framer-motion';
import { ScanSearch, Map, Zap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const phases = [
  { icon: ScanSearch, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/30' },
  { icon: Map, colorClass: 'text-primary', bgClass: 'bg-primary/10', borderClass: 'border-primary/30' },
  { icon: Zap, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/30' },
];

export default function TheSystemSection() {
  const { t, isRTL } = useTranslation();

  const phaseData = [
    { title: t('home.theSystem.phase1Title'), desc: t('home.theSystem.phase1Desc') },
    { title: t('home.theSystem.phase2Title'), desc: t('home.theSystem.phase2Desc') },
    { title: t('home.theSystem.phase3Title'), desc: t('home.theSystem.phase3Desc') },
  ];

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.theSystem.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('home.theSystem.subtitle')}
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className={cn(
            'absolute top-0 bottom-0 w-px bg-border',
            isRTL ? 'right-6 sm:right-8' : 'left-6 sm:left-8'
          )} />

          <div className="space-y-12">
            {phaseData.map((phase, i) => {
              const { icon: Icon, colorClass, bgClass, borderClass } = phases[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 * i }}
                  className={cn('relative flex gap-6', isRTL ? 'pr-0' : 'pl-0')}
                >
                  {/* Node */}
                  <div className={cn(
                    'relative z-10 shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2',
                    bgClass, borderClass
                  )}>
                    <Icon className={cn('h-6 w-6 sm:h-7 sm:w-7', colorClass)} />
                  </div>

                  {/* Content */}
                  <div className="pt-1 sm:pt-2">
                    <span className={cn('text-xs font-bold uppercase tracking-widest', colorClass)}>
                      {t('home.theSystem.phaseLabel')} {i + 1}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                      {phase.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 leading-relaxed">
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
