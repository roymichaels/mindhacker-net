/**
 * FinalCTASection - Clean closer with AuroraHoloOrb + feature checklist
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Shield, Clock, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { cn } from '@/lib/utils';

const checklist = [
  { he: 'מאמן AI אישי 24/7', en: 'Personal AI Coach 24/7' },
  { he: 'תוכנית 100 יום מותאמת', en: 'Tailored 100-Day Plan' },
  { he: '14 תחומי חיים', en: '14 Life Domains' },
  { he: 'היפנוזה מותאמת אישית', en: 'Custom Hypnosis Sessions' },
  { he: 'גיימיפיקציה מלאה', en: 'Full Gamification' },
  { he: 'אווטאר Orb אישי', en: 'Personalized Orb Avatar' },
];

const guarantees = [
  { icon: Shield, he: 'מסע מותאם אישית', en: 'Personalized journey' },
  { icon: Clock, he: '5 דקות להתחיל', en: '5 minutes to start' },
  { icon: Star, he: 'ביטול בכל רגע', en: 'Cancel anytime' },
];

export default function FinalCTASection() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-muted via-muted/70 to-muted dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 sm:p-12 rounded-3xl bg-card border-2 border-primary/30 shadow-2xl shadow-primary/10"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 blur-xl" />

          <div className="relative z-10 text-center space-y-8">
            {/* Orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <AuroraHoloOrb size={140} glow="full" />
              </div>
            </motion.div>

            {/* Heading */}
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-3">
                {isRTL ? 'מוכן לשנות את הכל?' : 'Ready to Change Everything?'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {isRTL
                  ? 'הצטרף ותתחיל את המסע שלך היום'
                  : 'Join and start your journey today'}
              </p>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-start max-w-lg mx-auto">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{isRTL ? item.he : item.en}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="group text-xl px-12 py-8 rounded-2xl
                bg-gradient-to-r from-primary via-primary to-accent
                hover:from-primary/90 hover:to-accent/90
                text-primary-foreground font-black
                shadow-[0_0_40px_rgba(0,0,0,0.3),0_0_60px_hsl(var(--primary)/0.3)]
                border-0 transition-all duration-300 hover:scale-105"
            >
              <Rocket className={cn('h-6 w-6', isRTL ? 'ml-3' : 'mr-3')} />
              {isRTL ? '🚀 התחל את האבחון שלך' : '🚀 Start Your Assessment'}
            </Button>

            {/* Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {guarantees.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4 text-emerald-500" />
                  <span>{isRTL ? item.he : item.en}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
