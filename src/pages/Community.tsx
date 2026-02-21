import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import UsernameGate from '@/components/community/UsernameGate';
import CreateThreadModal from '@/components/community/CreateThreadModal';
import CommunityMiniProfile from '@/components/community/CommunityMiniProfile';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useTranslation } from '@/hooks/useTranslation';
import { getDomainById } from '@/navigation/lifeDomains';

interface CommunityProps {
  selectedPillar?: string;
  onPillarSelect?: (pillar: string) => void;
  createOpen?: boolean;
  onCreateOpenChange?: (open: boolean) => void;
}

const Community = ({ selectedPillar = 'consciousness', onPillarSelect, createOpen = false, onCreateOpenChange }: CommunityProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { setActivePillar, setIsChatExpanded } = useAuroraChatContext();
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const { language } = useTranslation();
  const isHe = language === 'he';

  useSEO({
    title: 'MindOS Community',
    description: '13 pillars. One civilization.',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/community');
    }
  }, [user, loading, navigate]);

  // Set pillar context for the dock and auto-expand
  useEffect(() => {
    setActivePillar(selectedPillar);
    setIsChatExpanded(true);
    return () => {
      setActivePillar(null);
      setIsChatExpanded(false);
    };
  }, [selectedPillar, setActivePillar, setIsChatExpanded]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  const domain = getDomainById(selectedPillar);
  const pillarLabel = domain ? (isHe ? domain.labelHe : domain.labelEn) : selectedPillar;

  return (
    <UsernameGate>
      <PageShell>
        <div className="flex flex-col gap-4">
          {/* Pillar header */}
          <div className="pt-2">
            <h1 className="text-xl font-bold text-foreground">
              {pillarLabel}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {domain ? (isHe ? domain.descriptionHe : domain.description) : ''}
            </p>
          </div>

          {/* Placeholder content — threads/feed will go here */}
          <div className="flex-1 flex items-center justify-center min-h-[40vh] rounded-xl border border-border/30 bg-muted/10">
            <p className="text-sm text-muted-foreground">
              {isHe ? `שיחת קהילה ב${pillarLabel} — הדוק של אורורה פתוח למטה` : `${pillarLabel} community — Aurora dock is open below`}
            </p>
          </div>
        </div>

        <CreateThreadModal
          open={createOpen}
          onOpenChange={onCreateOpenChange || (() => {})}
          defaultPillar={selectedPillar}
        />
        <CommunityMiniProfile
          userId={profileUserId}
          open={!!profileUserId}
          onClose={() => setProfileUserId(null)}
        />
      </PageShell>
    </UsernameGate>
  );
};

export default Community;
