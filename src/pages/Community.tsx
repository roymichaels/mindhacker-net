import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { MessageSquarePlus } from 'lucide-react';
import UsernameGate from '@/components/community/UsernameGate';
import CreateThreadModal from '@/components/community/CreateThreadModal';
import CommunityMiniProfile from '@/components/community/CommunityMiniProfile';
import SuggestTopicModal from '@/components/community/SuggestTopicModal';
import ThreadList from '@/components/community/ThreadList';
import PillarTopicBoards from '@/components/community/PillarTopicBoards';
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

const Community = ({ selectedPillar = 'all', onPillarSelect, createOpen = false, onCreateOpenChange }: CommunityProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { setActivePillar } = useAuroraChatContext();
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [feedMode, setFeedMode] = useState<'latest' | 'trending'>('latest');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [planThread, setPlanThread] = useState<ThreadData | null>(null);
  const { language } = useTranslation();
  const isHe = language === 'he';

  useSEO({
    title: 'MindOS Community',
    description: '14 pillars. One civilization.',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/community');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setActivePillar(selectedPillar);
    setSelectedTopic(null);
    return () => {
      setActivePillar(null);
    };
  }, [selectedPillar, setActivePillar]);

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
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
          {/* Player Card */}
          <CommunityPlayerCard userId={user.id} />

          {/* Pillar header + controls row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">
                {isAll ? (isHe ? 'פיד כללי' : 'Global Feed') : pillarLabel}
              </h1>
              {domain && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {isHe ? domain.descriptionHe : domain.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Feed mode toggle */}
              <div className="flex bg-muted/40 rounded-lg p-0.5">
                <button
                  onClick={() => setFeedMode('latest')}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                    feedMode === 'latest'
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Clock className="h-3 w-3" />
                  {isHe ? 'חדש' : 'New'}
                </button>
                <button
                  onClick={() => setFeedMode('trending')}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                    feedMode === 'trending'
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Flame className="h-3 w-3" />
                  {isHe ? 'חם' : 'Hot'}
                </button>
              </div>

              {/* Suggest topic */}
              <button
                onClick={() => setSuggestOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
              >
                <MessageSquarePlus className="h-3 w-3" />
                <span className="hidden sm:inline">{isHe ? 'בקש נושא' : 'Suggest'}</span>
              </button>
            </div>
          </div>

          {/* Topic Boards — only for specific pillar, not "all" */}
          {!isAll && (
            <PillarTopicBoards
              pillar={selectedPillar}
              selectedTopic={selectedTopic}
              onSelectTopic={setSelectedTopic}
            />
          )}

          {/* Thread Feed — always show for "all", or when a topic is selected */}
          {(isAll || selectedTopic) && (
            <ThreadList
              pillarFilter={selectedPillar}
              topicFilter={selectedTopic}
              mode={feedMode}
              onProfileClick={setProfileUserId}
            />
          )}
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
        <SuggestTopicModal
          open={suggestOpen}
          onOpenChange={setSuggestOpen}
          pillar={selectedPillar}
        />
      </PageShell>
    </UsernameGate>
  );
};

export default Community;
