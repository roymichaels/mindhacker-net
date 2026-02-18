/**
 * StartSessionButton - Reusable "Start Session" CTA button.
 * Used in both the main dashboard content area and HudSidebar.
 */
import { Play, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import UpgradePromptModal from '@/components/subscription/UpgradePromptModal';

export function StartSessionButton() {
  const { t } = useTranslation();
  const { impact } = useHaptics();
  const { openHypnosis } = useAuroraActions();
  const { canAccessHypnosis, showUpgradePrompt, upgradeFeature, dismissUpgrade } = useSubscriptionGate();

  const handleClick = () => {
    if (!canAccessHypnosis) {
      showUpgradePrompt('hypnosis');
      return;
    }
    impact('medium');
    openHypnosis();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 hover:brightness-110 active:brightness-90 transition-all touch-manipulation shadow-sm"
      >
        <span className="flex items-center gap-1 text-xs text-primary-foreground/80">
          <Clock className="w-3.5 h-3.5" />15 {t('dashboard.minutesShort')}
        </span>
        <span className="flex items-center gap-2 text-sm font-bold text-primary-foreground">
          <Play className="w-4 h-4 fill-primary-foreground" />
          {t('dashboard.startSession')}
        </span>
      </button>
      {upgradeFeature && (
        <UpgradePromptModal feature={upgradeFeature} onDismiss={dismissUpgrade} />
      )}
    </>
  );
}
