import { motion } from 'framer-motion';
import { Zap, Calendar, ListChecks, Target, Sparkles, Clock, Bell, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const dailyItems = [
  { icon: ListChecks, key: 'wrapDailyItem1' },
  { icon: CheckCircle2, key: 'wrapDailyItem2' },
  { icon: TrendingUp, key: 'wrapDailyItem3' },
  { icon: Calendar, key: 'wrapDailyItem4' },
];

const longTermItems = [
  { icon: Target, key: 'wrapLongItem1' },
  { icon: Sparkles, key: 'wrapLongItem2' },
  { icon: Clock, key: 'wrapLongItem3' },
  { icon: Bell, key: 'wrapLongItem4' },
];

const checklistItems = [
  { label: 'משימות', labelEn: 'Tasks' },
  { label: 'זמנים', labelEn: 'Schedule' },
  { label: 'תזכורות', labelEn: 'Reminders' },
  { label: 'יעדים', labelEn: 'Goals' },
  { label: "צ'קליסטים", labelEn: 'Checklists' },
];

export default function LifeWrappingSection() {
  const { t, isRTL } = useTranslation();

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-6 shadow-lg shadow-emerald-500/10">
            <Zap className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">{t('home.wrapBadge')}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5">
            {t('home.wrapTitle')}
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('home.wrapSubtitle')}
          </p>
        </motion.div>

        {/* Two Columns - Daily + Long Term */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Daily Column */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 sm:p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-2xl">📅</span>
              {t('home.wrapDailyTitle')}
            </h3>
            
            <div className="space-y-4">
              {dailyItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{t(`home.${item.key}`)}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Long Term Column */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 sm:p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              {t('home.wrapLongTitle')}
            </h3>
            
            <div className="space-y-4">
              {longTermItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-violet-400" />
                    </div>
                    <span className="font-medium">{t(`home.${item.key}`)}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🎯</span>
              <p className="text-lg sm:text-xl font-bold">
                {t('home.wrapCta')}
              </p>
            </div>
            
            {/* Checklist Icons */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {checklistItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-sm font-medium"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{isRTL ? item.label : item.labelEn}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
