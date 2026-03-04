/**
 * PricingPreviewSection — 3-tier pricing overview
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Sparkles, Zap, Crown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tiers = [
  {
    id: 'free',
    icon: Sparkles,
    nameHe: 'התעוררות', nameEn: 'Awakening',
    priceHe: 'חינם', priceEn: 'Free',
    color: 'text-blue-500', border: 'border-blue-500/30', bg: 'bg-blue-500/5',
    featuresHe: ['2 פילרים מתוך 14 תחומים', '5 הודעות Aurora ליום', 'אבחון מלא', 'דאשבורד ומבנה יומי'],
    featuresEn: ['2 of 14 life pillars', '5 Aurora messages/day', 'Full assessment', 'Dashboard & daily structure'],
  },
  {
    id: 'plus',
    icon: Zap,
    nameHe: 'אופטימיזציה', nameEn: 'Optimization',
    priceHe: '$69/חודש', priceEn: '$69/mo',
    color: 'text-primary', border: 'border-primary/40', bg: 'bg-primary/5',
    featured: true,
    featuresHe: ['6 פילרים מתוך 14 תחומים', 'Aurora ללא הגבלה + זיכרון', 'תוכנית טרנספורמציה 100 יום', 'היפנוזה AI + מנוע ביצוע'],
    featuresEn: ['6 of 14 life pillars', 'Unlimited Aurora + memory', '100-Day Transformation Plan', 'AI Hypnosis + execution engine'],
  },
  {
    id: 'apex',
    icon: Crown,
    nameHe: 'שליטה', nameEn: 'Command',
    priceHe: '$199/חודש', priceEn: '$199/mo',
    color: 'text-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/5',
    featuresHe: ['כל 14 הפילרים פתוחים', 'מנוע Jarvis פרואקטיבי', 'פרויקטים + עסקים מתקדם', 'Orb DNA מלא'],
    featuresEn: ['All 14 pillars unlocked', 'Proactive Jarvis engine', 'Projects + Business Advanced', 'Full Orb DNA profile'],
  },
];

export default function PricingPreviewSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{t('home.pricing.title')}</h2>
          <p className="text-lg text-muted-foreground">{t('home.pricing.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.12 * i }}
                className={cn('relative p-6 rounded-2xl border-2 transition-all', tier.border, tier.bg, tier.featured && 'ring-2 ring-primary/30 scale-[1.03]')}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {t('home.pricing.mostPopular')}
                  </div>
                )}
                <div className="text-center space-y-4 pt-2">
                  <div className={cn('w-14 h-14 mx-auto rounded-2xl flex items-center justify-center', tier.bg)}>
                    <Icon className={cn('h-7 w-7', tier.color)} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{isRTL ? tier.nameHe : tier.nameEn}</h3>
                    <p className={cn('text-2xl font-black mt-1', tier.color)}>{isRTL ? tier.priceHe : tier.priceEn}</p>
                  </div>
                  <div className="space-y-2 text-start">
                    {(isRTL ? tier.featuresHe : tier.featuresEn).map((feat, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Check className={cn('h-4 w-4 shrink-0', tier.color)} />
                        <span className="text-sm text-foreground/80">{feat}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant={tier.featured ? 'default' : 'outline'} className="w-full mt-4" onClick={() => navigate('/onboarding')}>
                    {t('home.pricing.getStarted')}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
