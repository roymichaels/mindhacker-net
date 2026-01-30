import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Target, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const launchpadSteps = [
  { icon: '👋', step: 1, key: 'step1Name' },
  { icon: '👤', step: 2, key: 'step2Name' },
  { icon: '🎭', step: 3, key: 'step3Name' },
  { icon: '🔍', step: 4, key: 'step4Name' },
  { icon: '💬', step: 5, key: 'step5Name' },
  { icon: '🧘', step: 6, key: 'step6Name' },
  { icon: '🎯', step: 7, key: 'step7Name' },
  { icon: '🎪', step: 8, key: 'step8Name' },
  { icon: '📅', step: 9, key: 'step9Name' },
  { icon: '🚀', step: 10, key: 'step10Name' },
];

const outcomes = [
  { icon: Target, key: 'lifePlanOutcome1' },
  { icon: CheckCircle, key: 'lifePlanOutcome2' },
  { icon: TrendingUp, key: 'lifePlanOutcome3' },
  { icon: Zap, key: 'lifePlanOutcome4' },
  { icon: Calendar, key: 'lifePlanOutcome5' },
];

export default function LifePlanPreviewSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Launchpad</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('home.lifePlanTitle')}
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.lifePlanSubtitle')}
          </p>
        </motion.div>

        {/* 10 Steps Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
            {launchpadSteps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className={cn(
                  "relative p-3 rounded-xl text-center",
                  "bg-card border border-border/50",
                  "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
                  "transition-all cursor-pointer group"
                )}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
                  {t(`home.${item.key}`)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Outcomes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-accent/5 border border-primary/20">
            <h3 className="text-xl font-bold mb-6 text-center">
              {t('home.outcomesTitle')}
            </h3>
            
            <div className="space-y-3">
              {outcomes.map((outcome, index) => {
                const Icon = outcome.icon;
                return (
                  <motion.div
                    key={outcome.key}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-medium">{t(`home.${outcome.key}`)}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
                className="group text-lg px-8 py-6 rounded-xl"
              >
                {t('home.launchpadCta')}
                <ArrowRight className={cn(
                  "h-5 w-5 transition-transform group-hover:translate-x-1",
                  isRTL ? "mr-2 rotate-180 group-hover:-translate-x-1" : "ml-2"
                )} />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
