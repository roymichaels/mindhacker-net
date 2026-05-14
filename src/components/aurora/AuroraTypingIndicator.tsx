import { useOrbProfile } from '@/hooks/useOrbProfile';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { useXpProgress } from '@/hooks/useGameState';
import { useAIONDisplayName } from '@/hooks/useAIONDisplayName';
import { useTranslation } from '@/hooks/useTranslation';

const AIONTypingIndicator = () => {
  const { profile } = useOrbProfile();
  const { level } = useXpProgress();
  const { displayName: aionName } = useAIONDisplayName();
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="flex gap-2 animate-fade-in">
      <StandaloneMorphOrb size={32} profile={profile} geometryFamily={profile.geometryFamily || 'sphere'} level={level} />
      
      <div className="atmo-surface-soft px-4 py-3 dark:aion-glow-cyan animate-aion-emerge">
        <p className="mb-2 text-xs font-medium text-foreground/55">
          {isHe ? `${aionName} כותב...` : `${aionName} is typing...`}
        </p>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full animate-aion-breath dark:bg-aion-cyan/70 bg-foreground/40 dark:aion-glow-cyan" />
          <span className="w-2 h-2 rounded-full animate-aion-breath dark:bg-aion-blue/70 bg-foreground/40" style={{ animationDelay: '300ms' }} />
          <span className="w-2 h-2 rounded-full animate-aion-breath dark:bg-aion-violet/70 bg-foreground/40 dark:aion-glow-violet" style={{ animationDelay: '600ms' }} />
        </div>
      </div>
    </div>
  );
};

export const AuroraTypingIndicator = AIONTypingIndicator;
export default AIONTypingIndicator;
