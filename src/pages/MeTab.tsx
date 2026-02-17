import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { ProfileContent } from '@/components/dashboard/ProfileContent';
import { PageShell } from '@/components/aurora-ui/PageShell';

const MeTab = () => {
  const { t } = useTranslation();

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
    <PageShell>
      <ProfileContent />
    </PageShell>
  );
};

export default MeTab;
