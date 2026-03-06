/**
 * CoachOSSection — "Build Your Empire" — Coach marketplace/business district
 */
import { motion } from 'framer-motion';
import { Briefcase, Users, BarChart3, Globe, ShoppingBag, FileText } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const features = [
  { icon: Users, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: Globe, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { icon: ShoppingBag, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: FileText, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Briefcase, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

export default function CoachOSSection() {
  const { t, isRTL } = useTranslation();

  const featureData = [
    { title: t('home.coachOS.crmTitle'), desc: t('home.coachOS.crmDesc') },
    { title: t('home.coachOS.landingTitle'), desc: t('home.coachOS.landingDesc') },
    { title: t('home.coachOS.productsTitle'), desc: t('home.coachOS.productsDesc') },
    { title: t('home.coachOS.analyticsTitle'), desc: t('home.coachOS.analyticsDesc') },
    { title: t('home.coachOS.aiPlansTitle'), desc: t('home.coachOS.aiPlansDesc') },
    { title: t('home.coachOS.subscriptionsTitle'), desc: t('home.coachOS.subscriptionsDesc') },
  ];

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 mb-6">
            <Briefcase className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-bold text-rose-400">{t('home.coachOS.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            {t('home.coachOS.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.coachOS.subtitle')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureData.map((f, i) => {
            const { icon: Icon, color, bg } = features[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i }}
                className="p-5 rounded-2xl bg-card/60 backdrop-blur border border-border/50 hover:border-rose-500/30 transition-colors"
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
