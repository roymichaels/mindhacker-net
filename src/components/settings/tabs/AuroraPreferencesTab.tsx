import { Sun, Zap, MessageCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslation } from '@/hooks/useTranslation';

export interface AuroraPreferences {
  tone: 'warm' | 'direct' | 'playful';
  intensity: 'gentle' | 'balanced' | 'challenging';
  gender: 'male' | 'female' | 'neutral';
}

interface AuroraPreferencesTabProps {
  preferences: AuroraPreferences;
  setPreferences: (preferences: AuroraPreferences) => void;
}

const AuroraPreferencesTab = ({
  preferences,
  setPreferences,
}: AuroraPreferencesTabProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Tone */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('aurora.settings.tone')}</Label>
        <RadioGroup
          value={preferences.tone}
          onValueChange={(value) => setPreferences({ ...preferences, tone: value as AuroraPreferences['tone'] })}
          className="grid grid-cols-3 gap-2"
        >
          <div>
            <RadioGroupItem value="warm" id="tone-warm" className="peer sr-only" />
            <Label
              htmlFor="tone-warm"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-3 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <Sun className="h-5 w-5 mb-1 text-amber-500" />
              <span className="text-xs font-medium">{t('aurora.settings.toneWarm')}</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="direct" id="tone-direct" className="peer sr-only" />
            <Label
              htmlFor="tone-direct"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-3 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <Zap className="h-5 w-5 mb-1 text-blue-500" />
              <span className="text-xs font-medium">{t('aurora.settings.toneDirect')}</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="playful" id="tone-playful" className="peer sr-only" />
            <Label
              htmlFor="tone-playful"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-3 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <span className="text-lg mb-0">✨</span>
              <span className="text-xs font-medium">{t('aurora.settings.tonePlayful')}</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Intensity */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('aurora.settings.intensity')}</Label>
        <RadioGroup
          value={preferences.intensity}
          onValueChange={(value) => setPreferences({ ...preferences, intensity: value as AuroraPreferences['intensity'] })}
          className="grid grid-cols-3 gap-2"
        >
          <div>
            <RadioGroupItem value="gentle" id="intensity-gentle" className="peer sr-only" />
            <Label
              htmlFor="intensity-gentle"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-3 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <span className="text-xs font-medium">{t('aurora.settings.intensityGentle')}</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="balanced" id="intensity-balanced" className="peer sr-only" />
            <Label
              htmlFor="intensity-balanced"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-3 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <span className="text-xs font-medium">{t('aurora.settings.intensityBalanced')}</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="challenging" id="intensity-challenging" className="peer sr-only" />
            <Label
              htmlFor="intensity-challenging"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-3 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <span className="text-xs font-medium">{t('aurora.settings.intensityChallenging')}</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Gender */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('aurora.settings.gender')}</Label>
        <RadioGroup
          value={preferences.gender}
          onValueChange={(value) => setPreferences({ ...preferences, gender: value as AuroraPreferences['gender'] })}
          className="grid grid-cols-3 gap-2"
        >
          <div>
            <RadioGroupItem value="male" id="gender-male" className="peer sr-only" />
            <Label
              htmlFor="gender-male"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-3 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <span className="text-xs font-medium">{t('aurora.settings.genderMale')}</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="female" id="gender-female" className="peer sr-only" />
            <Label
              htmlFor="gender-female"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-3 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <span className="text-xs font-medium">{t('aurora.settings.genderFemale')}</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="neutral" id="gender-neutral" className="peer sr-only" />
            <Label
              htmlFor="gender-neutral"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background/50 p-3 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
            >
              <span className="text-xs font-medium">{t('aurora.settings.genderNeutral')}</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default AuroraPreferencesTab;
