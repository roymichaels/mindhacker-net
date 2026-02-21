import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import UsernameGate from '@/components/community/UsernameGate';
import CreateThreadModal from '@/components/community/CreateThreadModal';
import CommunityMiniProfile from '@/components/community/CommunityMiniProfile';
import ThreadList from '@/components/community/ThreadList';
import CommunityPlayerCard from '@/components/community/CommunityPlayerCard';
import AddToPlanModal from '@/components/community/AddToPlanModal';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useTranslation } from '@/hooks/useTranslation';
import { getDomainById } from '@/navigation/lifeDomains';
import { cn } from '@/lib/utils';
import { Flame, Clock } from 'lucide-react';
import type { ThreadData } from '@/components/community/ThreadCard';

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
  const [feedMode, setFeedMode] = useState<'latest' | 'trending'>('latest');
  const [planThread, setPlanThread] = useState<ThreadData | null>(null);
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
  const isAll = selectedPillar === 'all';

  return (
    <UsernameGate>
      <PageShell>
        <div className="flex flex-col gap-3">
          {/* Player Card - compact stats */}
          <CommunityPlayerCard userId={user.id} />

          {/* Pillar header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isAll ? (isHe ? 'כל הפילרים' : 'All Pillars') : pillarLabel}
              </h1>
              {domain && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isHe ? domain.descriptionHe : domain.description}
                </p>
              )}
            </div>
          </div>

          {/* Feed mode tabs */}
          <div className="flex gap-1 bg-muted/30 rounded-lg p-1 w-fit">
            <button
              onClick={() => setFeedMode('latest')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                feedMode === 'latest'
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {isHe ? 'אחרונים' : 'Latest'}
            </button>
            <button
              onClick={() => setFeedMode('trending')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                feedMode === 'trending'
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Flame className="h-3.5 w-3.5" />
              {isHe ? 'טרנדי' : 'Trending'}
            </button>
          </div>

          {/* Thread Feed */}
          <ThreadList
            pillarFilter={selectedPillar}
            mode={feedMode}
            onProfileClick={setProfileUserId}
          />
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
        <AddToPlanModal
          thread={planThread}
          open={!!planThread}
          onClose={() => setPlanThread(null)}
        />
      </PageShell>
    </UsernameGate>
  );
};

export default Community;
