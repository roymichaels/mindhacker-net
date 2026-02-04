/**
 * HowItWorksSection - Simple 3-step process
 */

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ClipboardCheck, Sparkles, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: ClipboardCheck,
    stepHe: '1',
    stepEn: '1',
    titleHe: 'ענה על שאלון קצר',
    titleEn: 'Take a Quick Assessment',
    descHe: 'ספר לנו על עצמך כדי שנבין את הצרכים שלך',
    descEn: 'Tell us about yourself so we understand your needs',
  },
  {
    icon: Sparkles,
    stepHe: '2',
    stepEn: '2',
    titleHe: 'קבל תוכנית אישית',
    titleEn: 'Get Your Personal Plan',
    descHe: 'AI יוצר לך תוכנית 90 יום מותאמת אישית',
    descEn: 'AI creates a personalized 90-day plan just for you',
  },
  {
    icon: TrendingUp,
    stepHe: '3',
    stepEn: '3',
    titleHe: 'התחל לצמוח',
    titleEn: 'Start Growing',
    descHe: 'עקוב אחרי המשימות, צבור XP, והתפתח כל יום',
    descEn: 'Follow your missions, earn XP, and grow every day',
  },
];

export default function HowItWorksSection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-20 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-5xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground">
            {isRTL ? 'איך זה עובד?' : 'How It Works'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isRTL ? '3 צעדים פשוטים לשינוי אמיתי' : '3 simple steps to real change'}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className={`hidden md:block absolute top-12 ${isRTL ? 'left-0' : 'right-0'} w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -z-10`} 
                  style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
              )}
              
              {/* Step number */}
              <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 
                flex items-center justify-center mb-6 border-2 border-primary/30">
                <step.icon className="h-10 w-10 text-primary" />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center
                  text-primary-foreground font-bold text-sm">
                  {isRTL ? step.stepHe : step.stepEn}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-foreground">
                {isRTL ? step.titleHe : step.titleEn}
              </h3>
              <p className="text-muted-foreground">
                {isRTL ? step.descHe : step.descEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
