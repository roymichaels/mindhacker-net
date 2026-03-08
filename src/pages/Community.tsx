import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { MessageSquarePlus, ChevronLeft, Clock, Flame, MessageSquare } from 'lucide-react';
import UsernameGate from '@/components/community/UsernameGate';
import CreateThreadModal from '@/components/community/CreateThreadModal';
import CommunityMiniProfile from '@/components/community/CommunityMiniProfile';
import SuggestTopicModal from '@/components/community/SuggestTopicModal';
import ThreadList from '@/components/community/ThreadList';
import AddToPlanModal from '@/components/community/AddToPlanModal';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useTranslation } from '@/hooks/useTranslation';
import { LIFE_DOMAINS, getDomainById } from '@/navigation/lifeDomains';
import { PILLAR_SUBCATEGORIES } from '@/lib/communityHelpers';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ThreadData } from '@/components/community/ThreadCard';

interface CommunityProps {
  selectedPillar?: string;
  onPillarSelect?: (pillar: string) => void;
  selectedTopic?: string | null;
  onSelectTopic?: (topic: string | null) => void;
  createOpen?: boolean;
  onCreateOpenChange?: (open: boolean) => void;
}

const PILLAR_ICONS: Record<string, string> = {
  consciousness: '🔮', presence: '👁️', power: '💪', vitality: '☀️',
  focus: '🎯', combat: '⚔️', expansion: '🧠', wealth: '📈',
  influence: '👑', relationships: '🤝', business: '💼', projects: '📋', play: '🎮',
};

const Community = ({ selectedPillar = 'all', onPillarSelect, selectedTopic = null, onSelectTopic, createOpen = false, onCreateOpenChange }: CommunityProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { setActivePillar } = useAuroraChatContext();
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [feedMode, setFeedMode] = useState<'latest' | 'trending'>('latest');
  const [planThread, setPlanThread] = useState<ThreadData | null>(null);
  const { language } = useTranslation();
  const isHe = language === 'he';

  useSEO({ title: 'MindOS Community', description: '14 pillars. One civilization.' });

  useEffect(() => { if (!loading && !user) navigate('/login?redirect=/community'); }, [user, loading, navigate]);
  useEffect(() => { setActivePillar(selectedPillar); return () => { setActivePillar(null); }; }, [selectedPillar, setActivePillar]);

  // Fetch pillar thread counts for the "all" view
  const { data: pillarCounts } = useQuery({
    queryKey: ['community-pillar-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_posts')
        .select('pillar')
        .eq('status', 'approved');
      if (!data) return {};
      const counts: Record<string, number> = {};
      for (const p of data) {
        if (p.pillar) counts[p.pillar] = (counts[p.pillar] || 0) + 1;
      }
      return counts;
    },
    staleTime: 60_000,
  });

  // Fetch topic thread counts when inside a pillar
  const subcategories = PILLAR_SUBCATEGORIES[selectedPillar] || [];
  const { data: topicCounts } = useQuery({
    queryKey: ['topic-thread-counts', selectedPillar],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_posts')
        .select('category_id')
        .eq('pillar', selectedPillar)
        .eq('status', 'approved');
      if (!data) return {};
      const counts: Record<string, number> = {};
      for (const post of data) {
        if (post.category_id) counts[post.category_id] = (counts[post.category_id] || 0) + 1;
      }
      return counts;
    },
    enabled: selectedPillar !== 'all' && subcategories.length > 0,
    staleTime: 60_000,
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }
  if (!user) return null;

  const isAll = selectedPillar === 'all';
  const domain = getDomainById(selectedPillar);
  const pillarLabel = domain ? (isHe ? domain.labelHe : domain.labelEn) : selectedPillar;

  return (
    <UsernameGate>
      <PageShell>
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full pb-24">

          {/* ── Header with breadcrumb ── */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {!isAll && (
                <button
                  onClick={() => { onPillarSelect?.('all'); onSelectTopic?.(null); }}
                  className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <ChevronLeft className={cn("h-5 w-5", isHe && "rotate-180")} />
                </button>
              )}
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-foreground truncate">
                  {isAll
                    ? (isHe ? 'קהילה' : 'Community')
                    : selectedTopic
                      ? (() => { const sub = subcategories.find(s => s.id === selectedTopic); return sub ? `${sub.icon} ${isHe ? sub.he : sub.en}` : pillarLabel; })()
                      : `${PILLAR_ICONS[selectedPillar] || '⚡'} ${pillarLabel}`
                  }
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setSuggestOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
              >
                <MessageSquarePlus className="h-3 w-3" />
                <span className="hidden sm:inline">{isHe ? 'בקש נושא' : 'Suggest'}</span>
              </button>
            </div>
          </div>

          {/* ── ALL VIEW: Pillar Cards Grid (mobile only, sidebar handles desktop) ── */}
          {isAll && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:hidden">
              {LIFE_DOMAINS.map((d) => {
                const Icon = d.icon;
                const count = pillarCounts?.[d.id] || 0;
                return (
                  <button
                    key={d.id}
                    onClick={() => onPillarSelect?.(d.id)}
                    className={cn(
                      "group flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/40",
                      "bg-card/60 hover:bg-accent/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                      "active:scale-[0.98] transition-all duration-200"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground text-center leading-tight">
                      {isHe ? d.labelHe : d.labelEn}
                    </span>
                    {count > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>{count}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Desktop: show feed directly when 'all' is selected ── */}
          {isAll && (
            <div className="hidden lg:block">
              <ThreadList
                pillarFilter="all"
                topicFilter={null}
                mode={feedMode}
                onProfileClick={setProfileUserId}
              />
            </div>
          )}

          {/* ── PILLAR VIEW: Topic Cards (mobile only, sidebar handles desktop) ── */}
          {!isAll && !selectedTopic && subcategories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 lg:hidden">
              {/* "All threads" card */}
              <button
                onClick={() => onSelectTopic?.(null)}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-xl border border-primary/20 bg-primary/5",
                  "hover:bg-primary/10 active:scale-[0.98] transition-all text-start col-span-full"
                )}
              >
                <span className="text-lg">🌐</span>
                <span className="text-sm font-semibold text-primary">{isHe ? 'כל השרשורים' : 'All Threads'}</span>
              </button>
              {subcategories.map((sub) => {
                const count = topicCounts?.[sub.id] || 0;
                return (
                  <button
                    key={sub.id}
                    onClick={() => onSelectTopic?.(sub.id)}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/40",
                      "bg-card/60 hover:bg-accent/30 hover:border-primary/30",
                      "active:scale-[0.98] transition-all duration-200"
                    )}
                  >
                    <span className="text-2xl">{sub.icon}</span>
                    <span className="text-xs font-medium text-foreground text-center leading-tight">
                      {isHe ? sub.he : sub.en}
                    </span>
                    {count > 0 && (
                      <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <MessageSquare className="h-2.5 w-2.5" />
                        <span>{count}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Desktop: always show feed when pillar selected (sidebar handles topics) ── */}
          {!isAll && (
            <div className="hidden lg:block">
              <ThreadList
                pillarFilter={selectedPillar}
                topicFilter={selectedTopic}
                mode={feedMode}
                onProfileClick={setProfileUserId}
              />
            </div>
          )}

          {/* ── TOPIC SELECTED: back chip + feed (mobile only) ── */}
          {!isAll && selectedTopic && (
            <button
              onClick={() => onSelectTopic?.(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors w-fit lg:hidden"
            >
              <ChevronLeft className={cn("h-3.5 w-3.5", isHe && "rotate-180")} />
              {isHe ? 'חזרה לנושאים' : 'Back to topics'}
            </button>
          )}

          {/* ── Feed mode toggle ── */}
          {(!isAll && (selectedTopic || subcategories.length === 0)) && (
            <div className="flex bg-muted/40 rounded-lg p-0.5 w-fit">
              <button
                onClick={() => setFeedMode('latest')}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  feedMode === 'latest' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="h-3 w-3" />
                {isHe ? 'חדש' : 'New'}
              </button>
              <button
                onClick={() => setFeedMode('trending')}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  feedMode === 'trending' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Flame className="h-3 w-3" />
                {isHe ? 'חם' : 'Hot'}
              </button>
            </div>
          )}

          {/* ── Thread Feed (shown when inside a pillar, topic selected or no subcategories) ── */}
          {!isAll && (selectedTopic || subcategories.length === 0) && (
            <ThreadList
              pillarFilter={selectedPillar}
              topicFilter={selectedTopic}
              mode={feedMode}
              onProfileClick={setProfileUserId}
            />
          )}

          {/* Also show feed in "all threads" for a pillar (no specific topic) when subcategories exist but user wants the full pillar feed */}
        </div>

        <CreateThreadModal open={createOpen} onOpenChange={onCreateOpenChange || (() => {})} defaultPillar={selectedPillar} />
        <CommunityMiniProfile userId={profileUserId} open={!!profileUserId} onClose={() => setProfileUserId(null)} />
        <AddToPlanModal thread={planThread} open={!!planThread} onClose={() => setPlanThread(null)} />
        <SuggestTopicModal open={suggestOpen} onOpenChange={setSuggestOpen} pillar={selectedPillar} />
      </PageShell>
    </UsernameGate>
  );
};

export default Community;
