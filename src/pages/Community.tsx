import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CommunityLayout from '@/components/community/CommunityLayout';
import CommunityFeed from '@/components/community/CommunityFeed';
import { useSEO } from '@/hooks/useSEO';

const Community = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: t('community.pageTitle'),
    description: t('community.pageDescription'),
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/community');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <CommunityLayout>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{t('community.feed')}</h1>
            <p className="text-muted-foreground">{t('community.feedSubtitle')}</p>
          </div>
          <CommunityFeed />
        </div>
      </CommunityLayout>
    </DashboardLayout>
  );
};

export default Community;
