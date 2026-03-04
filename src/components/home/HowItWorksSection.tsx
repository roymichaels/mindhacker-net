/**
 * HowItWorksSection - Simple 3-step onboarding flow
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ClipboardCheck, Map, Zap } from 'lucide-react';

export default function HowItWorksSection() {
  const { t, isRTL } = useTranslation();

  const steps = [
    { icon: ClipboardCheck, titleKey: 'home.howItWorks.step1Title', descKey: 'home.howItWorks.step1Desc', badge: '5 min' },
    { icon: Map, titleKey: 'home.howItWorks.step2Title', descKey: 'home.howItWorks.step2Desc', badge: 'AI-Powered' },
    { icon: Zap, titleKey: 'home.howItWorks.step3Title', descKey: 'home.howItWorks.step3Desc', badge: '24/7' },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.howItWorks.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('home.howItWorks.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className="relative p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-center space-y-4"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {i + 1}
                </div>

                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-7 w-7 text-primary" />
                </div>

                <h3 className="text-lg font-bold text-foreground">
                  {t(step.titleKey)}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(step.descKey)}
                </p>

                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {step.badge}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
