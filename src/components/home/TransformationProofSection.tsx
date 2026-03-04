/**
 * TransformationProofSection - Shows dramatic before/after transformation
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { TrendingUp, X, Check } from 'lucide-react';

export default function TransformationProofSection() {
  const { t, isRTL } = useTranslation();

  const beforeItems = [
    { icon: '😴', text: t('home.transformationProof.beforeItem1') },
    { icon: '🔄', text: t('home.transformationProof.beforeItem2') },
    { icon: '😤', text: t('home.transformationProof.beforeItem3') },
    { icon: '📉', text: t('home.transformationProof.beforeItem4') },
  ];

  const afterItems = [
    { icon: '🚀', text: t('home.transformationProof.afterItem1') },
    { icon: '⚡', text: t('home.transformationProof.afterItem2') },
    { icon: '🎯', text: t('home.transformationProof.afterItem3') },
    { icon: '📈', text: t('home.transformationProof.afterItem4') },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/50 via-muted/20 to-transparent dark:from-gray-950/50 dark:via-gray-900/30 dark:to-transparent relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-destructive/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-destructive/20 to-emerald-500/20 border border-primary/30 mb-6">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold text-foreground">{t('home.transformationProof.badge')}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.transformationProof.title')}
            <br />
            <span className="text-destructive">{t('home.transformationProof.stayingStuck')}</span>
            {' '}
            <span className="text-muted-foreground">{t('home.transformationProof.vs')}</span>
            {' '}
            <span className="text-emerald-500">{t('home.transformationProof.breakingThrough')}</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/30"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-destructive text-destructive-foreground text-sm font-bold">
              {t('home.transformationProof.before')}
            </div>
            <div className="mt-4 space-y-4">
              {beforeItems.map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 * index }} className="flex items-center gap-4 p-3 rounded-xl bg-destructive/10">
                  <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center"><X className="h-5 w-5 text-destructive" /></div>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-foreground/80">{item.text}</span>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="mt-6 p-4 rounded-xl bg-destructive/20 border border-destructive/30 text-center">
              <p className="text-destructive font-bold">{t('home.transformationProof.beforeMessage')}</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-900/5 border-2 border-emerald-500/30"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-sm font-bold">
              {t('home.transformationProof.after')}
            </div>
            <div className="mt-4 space-y-4">
              {afterItems.map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 * index + 0.2 }} className="flex items-center gap-4 p-3 rounded-xl bg-emerald-500/10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Check className="h-5 w-5 text-emerald-500" /></div>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }} className="mt-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-center">
              <p className="text-emerald-500 font-bold">{t('home.transformationProof.afterMessage')}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
