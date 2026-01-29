import { useState, useEffect } from 'react';
import { User, Sun, Zap, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuroraPreferences {
  tone: 'warm' | 'direct' | 'playful';
  intensity: 'gentle' | 'balanced' | 'challenging';
}

const AuroraProfileSettings = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [preferences, setPreferences] = useState<AuroraPreferences>({
    tone: 'warm',
    intensity: 'balanced',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load profile data
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, bio, aurora_preferences')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Failed to fetch profile:', error);
        return;
      }

      setDisplayName(data?.full_name || '');
      setBio(data?.bio || '');
      if (data?.aurora_preferences && typeof data.aurora_preferences === 'object') {
        const prefs = data.aurora_preferences as Record<string, unknown>;
        setPreferences({
          tone: (prefs.tone as AuroraPreferences['tone']) || 'warm',
          intensity: (prefs.intensity as AuroraPreferences['intensity']) || 'balanced',
        });
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: displayName,
          bio,
          aurora_preferences: { tone: preferences.tone, intensity: preferences.intensity },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(t('aurora.settings.saved'));
    } catch (err) {
      console.error('Failed to save profile:', err);
      toast.error(t('aurora.settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            {t('aurora.settings.profile')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">{t('aurora.settings.displayName')}</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('aurora.settings.displayNamePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">{t('aurora.settings.bio')}</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('aurora.settings.bioPlaceholder')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            {t('aurora.settings.communication')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tone */}
          <div className="space-y-3">
            <Label>{t('aurora.settings.tone')}</Label>
            <RadioGroup
              value={preferences.tone}
              onValueChange={(value) => setPreferences((p) => ({ ...p, tone: value as AuroraPreferences['tone'] }))}
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="warm" id="tone-warm" className="peer sr-only" />
                <Label
                  htmlFor="tone-warm"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="h-5 w-5 mb-1" />
                  <span className="text-xs">{t('aurora.settings.toneWarm')}</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="direct" id="tone-direct" className="peer sr-only" />
                <Label
                  htmlFor="tone-direct"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Zap className="h-5 w-5 mb-1" />
                  <span className="text-xs">{t('aurora.settings.toneDirect')}</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="playful" id="tone-playful" className="peer sr-only" />
                <Label
                  htmlFor="tone-playful"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-lg mb-0">✨</span>
                  <span className="text-xs">{t('aurora.settings.tonePlayful')}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Intensity */}
          <div className="space-y-3">
            <Label>{t('aurora.settings.intensity')}</Label>
            <RadioGroup
              value={preferences.intensity}
              onValueChange={(value) => setPreferences((p) => ({ ...p, intensity: value as AuroraPreferences['intensity'] }))}
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="gentle" id="intensity-gentle" className="peer sr-only" />
                <Label
                  htmlFor="intensity-gentle"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-xs font-medium">{t('aurora.settings.intensityGentle')}</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="balanced" id="intensity-balanced" className="peer sr-only" />
                <Label
                  htmlFor="intensity-balanced"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-xs font-medium">{t('aurora.settings.intensityBalanced')}</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="challenging" id="intensity-challenging" className="peer sr-only" />
                <Label
                  htmlFor="intensity-challenging"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <span className="text-xs font-medium">{t('aurora.settings.intensityChallenging')}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? t('aurora.settings.saving') : t('aurora.settings.save')}
      </Button>
    </div>
  );
};

export default AuroraProfileSettings;
