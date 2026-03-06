/**
 * AppPreviewSection - Horizontal card carousel showing key app screens
 */
import { motion } from 'framer-motion';
import { CalendarDays, Target, LayoutDashboard, Orbit } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const screens = [
  { icon: LayoutDashboard, colorClass: 'text-primary', bgClass: 'bg-primary/10', borderClass: 'border-primary/30' },
  { icon: Target, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/30' },
  { icon: CalendarDays, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/30' },
  { icon: Orbit, colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/30' },
];

export default function AppPreviewSection() {
  const { t, isRTL } = useTranslation();

  const screenData = [
    { title: t('home.appPreview.nowTitle'), desc: t('home.appPreview.nowDesc') },
    { title: t('home.appPreview.strategyTitle'), desc: t('home.appPreview.strategyDesc') },
    { title: t('home.appPreview.tacticsTitle'), desc: t('home.appPreview.tacticsDesc') },
    { title: t('home.appPreview.orbTitle'), desc: t('home.appPreview.orbDesc') },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/30 to-transparent dark:from-gray-900/30 dark:to-transparent">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.appPreview.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('home.appPreview.subtitle')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {screenData.map((screen, i) => {
            const { icon: Icon, colorClass, bgClass, borderClass } = screens[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className={cn(
                  'relative p-6 rounded-2xl border-2 bg-card/50 backdrop-blur-sm transition-all hover:scale-[1.02]',
                  borderClass
                )}
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', bgClass)}>
                  <Icon className={cn('h-6 w-6', colorClass)} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{screen.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{screen.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
