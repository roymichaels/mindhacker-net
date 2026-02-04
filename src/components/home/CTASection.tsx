/**
 * CTASection - Final call to action
 */

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Rocket, Shield, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';

const guarantees = [
  { icon: Shield, keyHe: 'חינם להתחלה', keyEn: 'Free to start' },
  { icon: CreditCard, keyHe: 'ללא כרטיס אשראי', keyEn: 'No credit card' },
  { icon: Clock, keyHe: '5 דקות להתחיל', keyEn: '5 min to start' },
];

export default function CTASection() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background dark:from-gray-950/50 dark:to-gray-950">
      <div className="container mx-auto max-w-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 sm:p-12 rounded-3xl bg-card border-2 border-primary/30 shadow-xl shadow-primary/10 text-center"
        >
          {/* Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <PersonalizedOrb size={100} state="speaking" disablePersonalization />
            </div>
          </motion.div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 text-foreground">
            {isRTL ? 'מוכן להתחיל את המסע?' : 'Ready to Start Your Journey?'}
          </h2>

          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {isRTL 
              ? 'הצטרף עכשיו וגלה את הפוטנציאל המלא שלך'
              : 'Join now and discover your full potential'
            }
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="group text-lg px-10 py-7 rounded-2xl 
              bg-gradient-to-r from-primary via-primary to-[hsl(var(--primary-glow))]
              hover:opacity-90
              text-primary-foreground font-bold
              shadow-lg shadow-primary/25
              transition-all duration-300 hover:scale-105 mb-6"
          >
            <Rocket className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'התחל עכשיו - חינם' : 'Start Now - Free'}
          </Button>

          {/* Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {guarantees.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="h-4 w-4 text-emerald-500" />
                <span>{isRTL ? item.keyHe : item.keyEn}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
