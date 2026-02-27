/**
 * HowItWorksSection - Simple 3-step onboarding flow
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ClipboardCheck, Map, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: ClipboardCheck,
    titleHe: 'עבור את האבחון',
    titleEn: 'Take the Assessment',
    descHe: '5 דקות של שאלות ממוקדות שמגלות את נקודות החוזק, האתגרים וסדר העדיפויות שלך.',
    descEn: '5 minutes of focused questions that uncover your strengths, challenges, and priorities.',
    badge: '5 min',
  },
  {
    icon: Map,
    titleHe: 'קבל תוכנית 100 יום',
    titleEn: 'Get Your 100-Day Plan',
    descHe: 'Aurora בונה לך תוכנית מותאמת אישית עם 10 פאזות, אבני דרך ומשימות יומיות.',
    descEn: 'Aurora builds a personalized plan with 10 phases, milestones, and daily actions.',
    badge: 'AI-Powered',
  },
  {
    icon: Zap,
    titleHe: 'בצע יומי עם Aurora',
    titleEn: 'Execute Daily with Aurora',
    descHe: 'מאמן AI 24/7 שמלווה, מזכיר, מתאים ושומר אותך על המסלול.',
    descEn: '24/7 AI coach that guides, reminds, adapts, and keeps you on track.',
    badge: '24/7',
  },
];

export default function HowItWorksSection() {
  const { isRTL } = useTranslation();

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
            {isRTL ? 'איך זה עובד?' : 'How It Works'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isRTL ? 'שלושה צעדים. בלי סיבוכים.' : 'Three steps. No complexity.'}
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
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {i + 1}
                </div>

                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-7 w-7 text-primary" />
                </div>

                <h3 className="text-lg font-bold text-foreground">
                  {isRTL ? step.titleHe : step.titleEn}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRTL ? step.descHe : step.descEn}
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
