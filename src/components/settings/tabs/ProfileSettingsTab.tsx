import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';

interface ProfileSettingsTabProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  email: string;
}

const ProfileSettingsTab = ({
  displayName,
  setDisplayName,
  bio,
  setBio,
  email,
}: ProfileSettingsTabProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-sm font-medium">
          {t('aurora.settings.displayName')}
        </Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t('aurora.settings.displayNamePlaceholder')}
          className="bg-background/50"
        />
      </div>

      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          {t('common.email')}
        </Label>
        <Input
          id="email"
          value={email}
          disabled
          className="bg-muted/50 cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          {t('settings.emailReadOnly')}
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">
          {t('aurora.settings.bio')}
        </Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t('aurora.settings.bioPlaceholder')}
          rows={3}
          className="bg-background/50 resize-none"
        />
      </div>
    </div>
  );
};

export default ProfileSettingsTab;
