/**
 * OnboardingPillarSelection — Full-screen pillar picker during onboarding.
 * Shows all 14 pillars, user picks up to their tier limit.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TIER_PILLAR_LIMITS, type SubscriptionTier } from '@/lib/subscriptionTiers';
import { CORE_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { CheckCircle2, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const domainColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
};

const cardBgMap: Record<string, string> = {
  blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/40',
  fuchsia: 'from-fuchsia-500/10 to-fuchsia-600/5 border-fuchsia-500/40',
  red: 'from-red-500/10 to-red-600/5 border-red-500/40',
  amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/40',
  cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/40',
  slate: 'from-slate-500/10 to-slate-600/5 border-slate-500/40',
  indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/40',
  emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/40',
  purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/40',
  sky: 'from-sky-500/10 to-sky-600/5 border-sky-500/40',
  rose: 'from-rose-500/10 to-rose-600/5 border-rose-500/40',
  violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/40',
  teal: 'from-teal-500/10 to-teal-600/5 border-teal-500/40',
};

interface OnboardingPillarSelectionProps {
  tier: SubscriptionTier;
  onComplete: (selectedPillars: string[]) => void;
}

export function OnboardingPillarSelection({ tier, onComplete }: OnboardingPillarSelectionProps) {
  const { t, language, isRTL } = useTranslation();
  const { user } = useAuth();
  const isHe = language === 'he';

  const limits = TIER_PILLAR_LIMITS[tier];
  const totalLimit = limits.core + limits.arena;
  const isApex = tier === 'apex';

  const [selected, setSelected] = useState<string[]>(
    isApex ? CORE_DOMAINS.map(d => d.id) : []
  );
  const [saving, setSaving] = useState(false);

  const handleToggle = (domain: LifeDomain) => {
    if (isApex) return;
    if (selected.includes(domain.id)) {
      setSelected(selected.filter(id => id !== domain.id));
    } else if (selected.length < totalLimit) {
      setSelected([...selected, domain.id]);
    }
  };

  const handleConfirm = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ selected_pillars: { core: selected, arena: [] } })
        .eq('id', user.id);
      if (error) throw error;
      onComplete(selected);
    } catch (err) {
      console.error('Save pillars error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 sm:p-6 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full space-y-6 py-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {t('onboarding.pillars.chooseYourPillars')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isApex
              ? t('onboarding.pillars.allUnlocked')
              : `${t('onboarding.pillars.selectUpTo')} ${totalLimit} ${t('onboarding.pillars.pillarsForAssessment')}`
            }
          </p>
          {!isApex && (
            <div className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
              selected.length >= totalLimit ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {selected.length}/{totalLimit}
            </div>
          )}
        </div>

        {/* Pillar Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {CORE_DOMAINS.map((domain, i) => {
            const isSelected = selected.includes(domain.id);
            const atLimit = !isApex && selected.length >= totalLimit;
            const Icon = domain.icon;

            return (
              <motion.button
                key={domain.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleToggle(domain)}
                disabled={isApex || (!isSelected && atLimit)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border bg-gradient-to-br p-3.5 text-center transition-all relative',
                  isApex ? 'cursor-default' : 'cursor-pointer',
                  isSelected
                    ? cardBgMap[domain.color]
                    : 'bg-card/20 border-border/20',
                  !isSelected && atLimit && !isApex && 'opacity-30 cursor-not-allowed',
                  isSelected && 'ring-1 ring-primary/50'
                )}
              >
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute top-1.5 end-1.5" />
                )}
                {!isSelected && atLimit && !isApex && (
                  <Lock className="w-3 h-3 text-muted-foreground/40 absolute top-1.5 end-1.5" />
                )}
                <Icon className={cn('w-6 h-6', isSelected ? domainColorMap[domain.color] : 'text-muted-foreground/50')} />
                <span className={cn(
                  'text-[10px] font-semibold leading-tight',
                  isSelected ? domainColorMap[domain.color] : 'text-foreground/50'
                )}>
                  {isHe ? domain.labelHe : domain.labelEn}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Confirm Button */}
        {(selected.length > 0 || isApex) && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleConfirm}
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {t('onboarding.pillars.startAssessments')}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}