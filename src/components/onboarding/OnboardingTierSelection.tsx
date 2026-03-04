/**
 * OnboardingTierSelection — Shows 3 subscription tiers after diagnostics reveal.
 * User picks Free / Plus / Apex, then proceeds to pillar selection.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { supabase } from '@/integrations/supabase/client';
import { TIER_CONFIGS, TIER_FEATURES, type SubscriptionTier } from '@/lib/subscriptionTiers';
import { Zap, Crown, ArrowRight, Check } from 'lucide-react';
import { requireAuthOrOpenModal, requireCheckoutUrlOrToast } from '@/lib/guards';
import { cn } from '@/lib/utils';

interface OnboardingTierSelectionProps {
  onTierSelected: (tier: SubscriptionTier) => void;
}

export function OnboardingTierSelection({ onTierSelected }: OnboardingTierSelectionProps) {
  const { language } = useTranslation();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const isHe = language === 'he';
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (tier: SubscriptionTier) => {
    if (!requireAuthOrOpenModal(user, openAuthModal, {
      reason: tier === 'free' ? 'start_free' : `upgrade_${tier}`,
      nextActionName: `onboarding_${tier}`,
    })) return;

    setSelectedTier(tier);

    if (tier === 'free') {
      onTierSelected(tier);
      return;
    }

    // For paid tiers, open checkout
    setIsLoading(true);
    try {
      const result = await supabase.functions.invoke('create-checkout-session', {
        body: { tier },
      });
      const url = requireCheckoutUrlOrToast(result, isHe);
      if (url) {
        // Store chosen tier so we can continue after payment
        sessionStorage.setItem('onboarding_chosen_tier', tier);
        window.location.href = url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tiers: { tier: SubscriptionTier; icon: typeof Zap; accent: string; borderAccent: string; bgAccent: string }[] = [
    { tier: 'free', icon: ArrowRight, accent: 'text-foreground', borderAccent: 'border-border hover:border-primary/50', bgAccent: 'bg-card' },
    { tier: 'plus', icon: Zap, accent: 'text-amber-500', borderAccent: 'border-amber-500/40 hover:border-amber-500/70', bgAccent: 'bg-gradient-to-br from-amber-500/5 to-amber-600/5' },
    { tier: 'apex', icon: Crown, accent: 'text-purple-500', borderAccent: 'border-purple-500/40 hover:border-purple-500/70', bgAccent: 'bg-gradient-to-br from-purple-500/5 to-purple-600/5' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 sm:p-6 overflow-y-auto" dir={isHe ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full space-y-6 py-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {isHe ? 'בחר את המסלול שלך' : 'Choose Your Path'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isHe ? 'כל מסלול כולל אבחון פילרים מותאם אישית' : 'Every path includes personalized pillar assessments'}
          </p>
        </div>

        {/* Tier Cards */}
        <div className="space-y-4">
          {tiers.map(({ tier, icon: Icon, accent, borderAccent, bgAccent }, i) => {
            const config = TIER_CONFIGS[tier];
            const features = isHe ? TIER_FEATURES[tier].he : TIER_FEATURES[tier].en;
            const isSelected = selectedTier === tier;
            const isPopular = tier === 'plus';

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={cn(
                  'rounded-2xl border-2 p-5 space-y-4 transition-all cursor-pointer relative',
                  bgAccent,
                  isSelected ? 'ring-2 ring-primary' : borderAccent,
                )}
                onClick={() => !isLoading && setSelectedTier(tier)}
              >
                {isPopular && (
                  <div className="absolute -top-3 start-4 px-3 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                    {isHe ? 'הכי פופולרי' : 'Most Popular'}
                  </div>
                )}

                {/* Title + Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('w-5 h-5', accent)} />
                    <div>
                      <h3 className="text-lg font-bold">{config.label[isHe ? 'he' : 'en']}</h3>
                      <p className="text-xs text-muted-foreground">{config.subtitle[isHe ? 'he' : 'en']}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    {config.priceUSD === 0 ? (
                      <span className="text-xl font-black text-foreground">{isHe ? 'חינם' : 'Free'}</span>
                    ) : (
                      <div>
                        <span className={cn('text-xl font-black', accent)}>
                          {isHe ? `₪${config.priceILS}` : `$${config.priceUSD}`}
                        </span>
                        <span className="text-xs text-muted-foreground">/{isHe ? 'חודש' : 'mo'}</span>
                      </div>
                    )}
                    {config.trial && (
                      <p className={cn('text-[10px] font-medium', accent)}>
                        {isHe ? `${config.trial} ימי ניסיון חינם` : `${config.trial}-day free trial`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5">
                  {features.slice(0, 5).map((feature, fi) => (
                    <div key={fi} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className={cn('w-3.5 h-3.5 shrink-0', accent)} />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {features.length > 5 && (
                    <p className="text-[10px] text-muted-foreground/60 ps-5">
                      {isHe ? `+${features.length - 5} עוד...` : `+${features.length - 5} more...`}
                    </p>
                  )}
                </div>

                {/* Pillar count badge */}
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full bg-muted', accent)}>
                    {tier === 'free' ? '2' : tier === 'plus' ? '6' : '14'} {isHe ? 'פילרים' : 'pillars'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        {selectedTier && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleSelect(selectedTier)}
            disabled={isLoading}
            className={cn(
              'w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all',
              selectedTier === 'apex'
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : selectedTier === 'plus'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-card border-2 border-border hover:border-primary/50 text-foreground',
              isLoading && 'opacity-50'
            )}
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : selectedTier === 'free' ? (
              <>
                {isHe ? 'המשך לבחירת פילרים' : 'Continue to Pillar Selection'}
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                {isHe ? `שדרג ל-${TIER_CONFIGS[selectedTier].label.en}` : `Upgrade to ${TIER_CONFIGS[selectedTier].label.en}`}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
