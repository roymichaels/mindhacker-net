import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { StatsGrid } from '@/components/dashboard/v2';
import { ProfileDrawer } from '@/components/dashboard/ProfileDrawer';
import { SettingsModal } from '@/components/settings';
import { Button } from '@/components/ui/button';
import { Settings, UserCircle } from 'lucide-react';

const MeTab = () => {
  const { t, isRTL, language } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useSEO({
    title: t('seo.dashboardTitle'),
    description: t('seo.dashboardDescription'),
    url: `${window.location.origin}/me`,
    type: 'website',
    structuredData: [
      getBreadcrumbSchema([
        { name: t('seo.breadcrumbHome'), url: window.location.origin },
        { name: 'Me', url: `${window.location.origin}/me` },
      ]),
    ],
  });

  return (
    <div className="space-y-5 pt-0 sm:pt-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <StatsGrid />

      <div className="grid gap-3 grid-cols-2">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setProfileOpen(true)}
        >
          <UserCircle className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium">
            {language === 'he' ? 'פרופיל' : 'Profile'}
          </span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm font-medium">
            {language === 'he' ? 'הגדרות' : 'Settings'}
          </span>
        </Button>
      </div>

      <ProfileDrawer open={profileOpen} onOpenChange={setProfileOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default MeTab;
