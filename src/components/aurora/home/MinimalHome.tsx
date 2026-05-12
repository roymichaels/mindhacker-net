/**
 * MinimalHome — calm default surface for `/aurora`.
 *
 * Hard rules (see .lovable/plan.md → "Minimal Home — Hard Reset"):
 *   - Composes at most 6 elements: presence row, orb, state line, focus card,
 *     active-worlds strip (optional), micro-indicators line.
 *   - No grids, no metric cards, no tabs, no service feed, no capability
 *     launcher. Capabilities are summoned via chat or the composer "+".
 *   - The bottom composer dock is rendered by AuroraPage, not here.
 */
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useAmbientContext } from '@/hooks/aurora/useAmbientContext';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import PresenceTopRow from './PresenceTopRow';
import FocusCard from './FocusCard';
import ActiveWorldsStrip from './ActiveWorldsStrip';
import PresenceIndicators from './PresenceIndicators';

export default function MinimalHome() {
  const { isRTL } = useTranslation();
  const { understanding } = useAmbientContext();
  const { sendMessageRef } = useAuroraChatContext();

  const handlePrompt = (prompt: string) => {
    sendMessageRef.current?.(prompt);
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center px-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <PresenceTopRow />

      <div className="flex-1 w-full flex flex-col items-center justify-center gap-6 max-w-md mx-auto">
        <PersonalizedOrb size={240} state="idle" />

        {understanding && (
          <p className="text-center text-[12.5px] leading-snug text-muted-foreground/75 max-w-[28ch] px-2">
            {understanding.text}
          </p>
        )}

        <FocusCard onSendPrompt={handlePrompt} />

        <ActiveWorldsStrip />

        <PresenceIndicators />
      </div>
    </div>
  );
}
