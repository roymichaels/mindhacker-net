import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import { getBreadcrumbSchema } from '@/lib/seo';
import { ProfileContent } from '@/components/dashboard/ProfileContent';

const MeTab = () => {
  const { t, isRTL } = useTranslation();

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
      <ProfileContent />
    </div>
  );
};

export default MeTab;