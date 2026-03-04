/**
 * CoachMarketplaceSection — Showcase the coaches marketplace & Coach OS hub
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Briefcase, Users, BarChart3, Globe, FileText, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CoachMarketplaceSection() {
  const { t, isRTL } = useTranslation();

  const coachFeatures = [
    { icon: Users, text: t('home.coachMarketplace.clientCrm') },
    { icon: BarChart3, text: t('home.coachMarketplace.analytics') },
    { icon: Globe, text: t('home.coachMarketplace.landingPages') },
    { icon: FileText, text: t('home.coachMarketplace.aiPlans') },
    { icon: Star, text: t('home.coachMarketplace.digitalProducts') },
    { icon: Briefcase, text: t('home.coachMarketplace.businessMgmt') },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 via-transparent to-muted/30 dark:from-gray-900/30 dark:via-transparent dark:to-gray-900/30">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Briefcase className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-500">
              {t('home.coachMarketplace.badge')}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.coachMarketplace.title')}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {t('home.coachMarketplace.titleHighlight')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.coachMarketplace.subtitle')}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coachFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 * i }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-card/60 border border-border/50 hover:border-amber-500/30 hover:bg-card transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-amber-500" />
                </div>
                <p className="font-semibold text-foreground">{f.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
