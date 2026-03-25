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
      
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          {isHe ? `${aionName} כותב...` : `${aionName} is typing...`}
        </p>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export const AuroraTypingIndicator = AIONTypingIndicator;
export default AIONTypingIndicator;
