/**
 * AuroraWelcome — calm, focused empty state for `/aurora`.
 *
 * Layout (top → bottom):
 *   · large breathing orb (presence)
 *   · soft greeting line
 *   · single AmbientContextCard (understanding · focus · next step)
 *
 * Replaces the previous 2×2 colored suggestion grid. The grid was creating
 * dashboard-like cognitive load; smart-suggestions now feed the ambient
 * card instead. All other capabilities are summoned through chat or the
 * composer "+" launcher.
 */
import { useGenderedTranslation } from '@/hooks/useGenderedTranslation';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { useAIONDisplayName } from '@/hooks/useAIONDisplayName';
import AmbientContextCard from './AmbientContextCard';

interface AuroraWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

function timeOfDayGreeting(isHe: boolean): string {
  const h = new Date().getHours();
  if (isHe) {
    if (h < 5) return 'לילה טוב';
    if (h < 12) return 'בוקר טוב';
    if (h < 17) return 'צהריים טובים';
    if (h < 21) return 'ערב טוב';
    return 'לילה טוב';
  }
  if (h < 5) return 'good night';
  if (h < 12) return 'good morning';
  if (h < 17) return 'good afternoon';
  if (h < 21) return 'good evening';
  return 'good night';
}

const AuroraWelcome = ({ onSuggestionClick }: AuroraWelcomeProps) => {
  const { isRTL } = useGenderedTranslation();
  const { displayName: aionName } = useAIONDisplayName();
  const isHe = isRTL;
  const greeting = timeOfDayGreeting(isHe);

  return (
    <div
      className="flex flex-col items-center justify-center py-10 px-4 space-y-6"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative">
        <PersonalizedOrb size={120} state="idle" />
      </div>

      <div className="text-center space-y-1.5">
        <h2 className="text-[15px] font-medium text-foreground/85 tracking-tight">
          {greeting}
        </h2>
        <p className="text-xs text-muted-foreground/80">
          {isHe ? `${aionName} כאן.` : `${aionName} is here.`}
        </p>
      </div>

      <AmbientContextCard onSendPrompt={onSuggestionClick} />
    </div>
  );
};

export default AuroraWelcome;
