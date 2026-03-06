/**
 * FinalCTASection — Epic gaming CTA merged with pricing rank cards
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Sparkles, Zap, Crown, Check, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Orb } from '@/components/orb/Orb';
import { DEFAULT_ORB_PROFILE } from '@/lib/orbProfileGenerator';
import { cn } from '@/lib/utils';

const tiers = [
  {
    id: 'free',
    icon: Sparkles,
    nameHe: 'התעוררות', nameEn: 'Awakening',
    priceHe: 'חינם', priceEn: 'Free',
    color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/5', glow: 'shadow-blue-500/10',
    featuresHe: ['2 פילרים מתוך 14 תחומים', '5 הודעות Aurora ליום', 'אבחון מלא', 'דאשבורד ומבנה יומי'],
    featuresEn: ['2 of 14 life pillars', '5 Aurora messages/day', 'Full assessment', 'Dashboard & daily structure'],
  },
  {
    id: 'plus',
    icon: Zap,
    nameHe: 'אופטימיזציה', nameEn: 'Optimization',
    priceHe: '$69/חודש', priceEn: '$69/mo',
    color: 'text-primary', border: 'border-primary/50', bg: 'bg-primary/5', glow: 'shadow-primary/20',
    featured: true,
    featuresHe: ['6 פילרים מתוך 14 תחומים', 'Aurora ללא הגבלה + זיכרון', 'תוכנית טרנספורמציה 100 יום', 'היפנוזה AI + מנוע ביצוע'],
    featuresEn: ['6 of 14 life pillars', 'Unlimited Aurora + memory', '100-Day Transformation Plan', 'AI Hypnosis + execution engine'],
  },
  {
    id: 'apex',
    icon: Crown,
    nameHe: 'שליטה', nameEn: 'Command',
    priceHe: '$199/חודש', priceEn: '$199/mo',
    color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/5', glow: 'shadow-amber-500/10',
    featuresHe: ['כל 14 הפילרים פתוחים', 'מנוע Jarvis פרואקטיבי', 'פרויקטים + עסקים מתקדם', 'Orb DNA מלא + כריית MOS'],
    featuresEn: ['All 14 pillars unlocked', 'Proactive Jarvis engine', 'Projects + Business Advanced', 'Full Orb DNA + MOS mining'],
  },
];

export default function FinalCTASection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  const guarantees = [
    { icon: Shield, text: t('home.finalCta.personalJourney') },
    { icon: Clock, text: t('home.finalCta.fiveMinutes') },
    { icon: Star, text: t('home.finalCta.cancelAnytime') },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">{t('home.finalCta.title')}</h2>
          <p className="text-lg text-muted-foreground">{t('home.finalCta.subtitle')}</p>
        </motion.div>

        {/* Rank cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.12 * i }}
                className={cn(
                  'relative p-6 rounded-2xl border-2 backdrop-blur transition-all shadow-lg',
                  tier.border, tier.bg, tier.glow,
                  tier.featured && 'ring-2 ring-primary/30 scale-[1.03]'
                )}
              >
                {/* Holographic shimmer for featured */}
                {tier.featured && (
                  <>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-black">
                      {t('home.pricing.mostPopular')}
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    />
                  </>
                )}
                <div className="relative z-10 text-center space-y-4 pt-2">
                  <div className={cn('w-14 h-14 mx-auto rounded-2xl flex items-center justify-center', tier.bg, 'border', tier.border)}>
                    <Icon className={cn('h-7 w-7', tier.color)} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">{isRTL ? tier.nameHe : tier.nameEn}</h3>
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
                  <Button
                    variant={tier.featured ? 'default' : 'outline'}
                    className="w-full mt-4 font-bold"
                    onClick={() => navigate('/onboarding')}
                  >
                    {t('home.pricing.getStarted')}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Epic CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-8 sm:p-12 rounded-3xl bg-card/80 backdrop-blur border-2 border-primary/30 shadow-2xl shadow-primary/10 text-center"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />

          <div className="relative z-10 space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <AuroraHoloOrb size={100} glow="full" />
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-foreground">
              {t('home.finalCta.epicTitle')}
            </h3>

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
              {t('home.finalCta.cta')}
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {guarantees.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4 text-emerald-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
