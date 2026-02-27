import { useState, useEffect } from 'react';
import { Settings, User, Sparkles, Palette, Bell, UserCog, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import ProfileSettingsTab from './tabs/ProfileSettingsTab';
import AuroraPreferencesTab, { type AuroraPreferences } from './tabs/AuroraPreferencesTab';
import AppearanceSettingsTab from './tabs/AppearanceSettingsTab';
import AccountSettingsTab from './tabs/AccountSettingsTab';
import EnergyHistory from '@/components/energy/EnergyHistory';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { user } = useAuth();
  const { t, isRTL, language } = useTranslation();

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');

  // Aurora preferences state
  const [preferences, setPreferences] = useState<AuroraPreferences>({
    tone: 'warm',
    intensity: 'balanced',
    gender: 'neutral',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track initial values for change detection
  const [initialValues, setInitialValues] = useState({
    displayName: '',
    bio: '',
    preferences: { tone: 'warm', intensity: 'balanced', gender: 'neutral' } as AuroraPreferences,
  });

  // Load profile data
  useEffect(() => {
    if (!user?.id || !open) return;

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

      const name = data?.full_name || '';
      const userBio = data?.bio || '';
      let prefs: AuroraPreferences = { tone: 'warm', intensity: 'balanced', gender: 'neutral' };

      if (data?.aurora_preferences && typeof data.aurora_preferences === 'object') {
        const prefData = data.aurora_preferences as Record<string, unknown>;
        prefs = {
          tone: (prefData.tone as AuroraPreferences['tone']) || 'warm',
          intensity: (prefData.intensity as AuroraPreferences['intensity']) || 'balanced',
          gender: (prefData.gender as AuroraPreferences['gender']) || 'neutral',
        };
      }

      setDisplayName(name);
      setBio(userBio);
      setPreferences(prefs);
      setEmail(user.email || '');

      setInitialValues({ displayName: name, bio: userBio, preferences: prefs });
    };

    fetchProfile();
  }, [user?.id, open]);

  // Detect changes
  useEffect(() => {
    const changed =
      displayName !== initialValues.displayName ||
      bio !== initialValues.bio ||
      preferences.tone !== initialValues.preferences.tone ||
      preferences.intensity !== initialValues.preferences.intensity ||
      preferences.gender !== initialValues.preferences.gender;

    setHasChanges(changed);
  }, [displayName, bio, preferences, initialValues]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: displayName,
          bio,
          aurora_preferences: {
            tone: preferences.tone,
            intensity: preferences.intensity,
            gender: preferences.gender,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setInitialValues({ displayName, bio, preferences });
      setHasChanges(false);
      toast.success(t('aurora.settings.saved'));
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error(t('aurora.settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && hasChanges) {
      // Optionally confirm before closing with unsaved changes
      // For now, just close
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader 
          className="px-6 pt-6 pb-2"
          title={t('common.settings')}
          icon={<Settings className="h-5 w-5" />}
          showBackArrow={false}
        />

        <Tabs defaultValue="profile" className="flex flex-col flex-1 min-h-0" dir={isRTL ? 'rtl' : 'ltr'}>
          <TabsList className="mx-6 mb-2 grid grid-cols-5 h-auto p-1">
            <TabsTrigger value="profile" className="flex flex-col items-center gap-1 py-2 px-1 text-xs">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.tabs.profile')}</span>
            </TabsTrigger>
            <TabsTrigger value="aurora" className="flex flex-col items-center gap-1 py-2 px-1 text-xs">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.tabs.aurora')}</span>
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex flex-col items-center gap-1 py-2 px-1 text-xs">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'he' ? 'אנרגיה' : 'Energy'}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex flex-col items-center gap-1 py-2 px-1 text-xs">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.tabs.appearance')}</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex flex-col items-center gap-1 py-2 px-1 text-xs">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">{t('settings.tabs.account')}</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6">
            <TabsContent value="profile" className="mt-0 pb-4">
              <ProfileSettingsTab
                displayName={displayName}
                setDisplayName={setDisplayName}
                bio={bio}
                setBio={setBio}
                email={email}
              />
            </TabsContent>

            <TabsContent value="aurora" className="mt-0 pb-4">
              <AuroraPreferencesTab
                preferences={preferences}
                setPreferences={setPreferences}
              />
            </TabsContent>

            <TabsContent value="energy" className="mt-0 pb-4">
              <EnergyHistory />
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 pb-4">
              <AppearanceSettingsTab />
            </TabsContent>

            <TabsContent value="account" className="mt-0 pb-4">
              <AccountSettingsTab onClose={() => onOpenChange(false)} />
            </TabsContent>
          </ScrollArea>

          {/* Save Button - only show for profile/aurora tabs */}
          <div className="px-6 py-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="w-full"
            >
              {isSaving ? t('aurora.settings.saving') : t('aurora.settings.save')}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
