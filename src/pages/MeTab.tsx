import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { ProfileContent } from '@/components/dashboard/ProfileContent';
import { SettingsModal } from '@/components/settings';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const MeTab = () => {
  const { t, isRTL } = useTranslation();
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
    <div className="relative pt-0 sm:pt-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Settings gear icon - positioned above the profile card */}
      <div className="flex justify-end px-2 sm:px-0 mb-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <ProfileContent />

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default MeTab;
