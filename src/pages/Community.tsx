import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { MessageSquarePlus, ChevronLeft, Clock, Flame, CalendarDays, MapPin, Sparkles, Users, ArrowRight, Wand2, Loader2 } from 'lucide-react';
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useQueryClient as useQC } from '@tanstack/react-query';
import UsernameGate from '@/components/community/UsernameGate';
import CommunityLeaderboard from '@/components/community/CommunityLeaderboard';
import CreateThreadModal from '@/components/community/CreateThreadModal';
import CreateStoryModal from '@/components/community/CreateStoryModal';
import StoriesStrip from '@/components/community/StoriesStrip';
import CommunityMiniProfile from '@/components/community/CommunityMiniProfile';
import SuggestTopicModal from '@/components/community/SuggestTopicModal';
import ThreadList from '@/components/community/ThreadList';
import AddToPlanModal from '@/components/community/AddToPlanModal';
import EventsModal from '@/components/community/EventsModal';
import AIMatchModal from '@/components/community/AIMatchModal';
import { IPhoneWidget } from '@/components/ui/IPhoneWidget';
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

const GRADIENT_MAP: Record<string, string> = {
  violet: 'from-violet-500 to-violet-700',
  fuchsia: 'from-fuchsia-500 to-pink-600',
  red: 'from-red-500 to-red-700',
  amber: 'from-amber-500 to-orange-600',
  cyan: 'from-cyan-500 to-cyan-700',
  slate: 'from-slate-500 to-slate-700',
  indigo: 'from-indigo-500 to-indigo-700',
  emerald: 'from-emerald-500 to-emerald-700',
  purple: 'from-purple-500 to-purple-700',
  sky: 'from-sky-500 to-sky-700',
  orange: 'from-orange-500 to-orange-700',
  blue: 'from-blue-500 to-blue-700',
  lime: 'from-lime-500 to-lime-700',
  teal: 'from-teal-500 to-teal-700',
  rose: 'from-rose-500 to-rose-700',
  pink: 'from-pink-500 to-pink-700',
};

const TOPIC_GRADIENTS = [
  'from-sky-500 to-sky-700',
  'from-violet-500 to-violet-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-orange-600',
  'from-fuchsia-500 to-pink-600',
  'from-indigo-500 to-indigo-700',
  'from-cyan-500 to-cyan-700',
  'from-blue-500 to-blue-700',
];

const Community = ({ selectedPillar = 'all', onPillarSelect, selectedTopic = null, onSelectTopic, createOpen = false, onCreateOpenChange }: CommunityProps) => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { setActivePillar } = useAuroraChatContext();
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [feedMode, setFeedMode] = useState<'latest' | 'trending'>('latest');
  const [planThread, setPlanThread] = useState<ThreadData | null>(null);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [generatingStories, setGeneratingStories] = useState(false);
  const { language } = useTranslation();
  const isHe = language === 'he';
  const qc = useQC();

  const handleGenerateStories = async () => {
    setGeneratingStories(true);
    try {
      const { data, error } = await supabaseClient.functions.invoke('generate-ai-stories');
      if (error) throw error;
      toast.success(isHe ? `נוצרו ${data?.stories?.length || 0} סטוריז חדשים! ✨` : `Generated ${data?.stories?.length || 0} new stories! ✨`);
      qc.invalidateQueries({ queryKey: ['community-stories'] });
    } catch (err: any) {
      console.error('Story generation failed:', err);
      toast.error(isHe ? 'שגיאה ביצירת סטוריז' : 'Failed to generate stories');
    } finally {
      setGeneratingStories(false);
    }
  };

  useSEO({ title: 'MindOS — Feed', description: '14 pillars. One civilization.' });

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
          {/* ── Stories Strip ── */}
          <StoriesStrip pillarFilter={selectedPillar} topicFilter={selectedTopic} onCreateStory={() => setStoryOpen(true)} />

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
                    ? (isHe ? 'פיד' : 'Feed')
                    : selectedTopic
                      ? (() => { const sub = subcategories.find(s => s.id === selectedTopic); return sub ? `${sub.icon} ${isHe ? sub.he : sub.en}` : pillarLabel; })()
                      : `${PILLAR_ICONS[selectedPillar] || '⚡'} ${pillarLabel}`
                  }
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 h-8 text-xs"
                  onClick={handleGenerateStories}
                  disabled={generatingStories}
                >
                  {generatingStories ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  {isHe ? 'צור סטוריז' : 'Generate Stories'}
                </Button>
              )}
            </div>
          </div>

          {/* ── ALL VIEW: Events + AI Match + Pillar Cards ── */}
          {isAll && (
            <>
              {/* ── Leaderboard ── */}
              <CommunityLeaderboard onProfileClick={setProfileUserId} />
              {/* ── Top Banners: Events & AI Match ── */}
              <div className="grid grid-cols-2 gap-3">
                {/* Events Card */}
                <button
                  onClick={() => setEventsOpen(true)}
                  className="group relative overflow-hidden rounded-2xl border border-sky-500/20 bg-sky-500/[0.06] px-3 py-2.5 text-start transition-all hover:border-sky-500/40 active:scale-[0.99] flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center flex-shrink-0">
                    <CalendarDays className="w-4 h-4 text-sky-500" />
                  </div>
                  <h3 className="text-xs font-bold text-foreground flex-1 min-w-0">
                    {isHe ? 'אירועים קרובים' : 'Upcoming Events'}
                  </h3>
                  <ArrowRight className={cn("w-3.5 h-3.5 text-sky-500/50 flex-shrink-0", isHe && "rotate-180")} />
                </button>

                {/* AI Match Card */}
                <button
                  onClick={() => setMatchOpen(true)}
                  className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5 text-start transition-all hover:border-amber-500/40 active:scale-[0.99] flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-foreground">AI Match</h3>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                      {isHe ? 'חדש' : 'New'}
                    </span>
                  </div>
                  <ArrowRight className={cn("w-3.5 h-3.5 text-amber-500/50 flex-shrink-0", isHe && "rotate-180")} />
                </button>
              </div>

              {/* ── Pillar Widgets Grid (iPhone style) ── */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {isHe ? '📋 קטגוריות נושאים' : '📋 Topic Categories'}
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-y-4 gap-x-2 py-1 justify-items-center">
                  {LIFE_DOMAINS.map((d) => (
                    <IPhoneWidget
                      key={d.id}
                      icon={d.icon}
                      label={isHe ? d.labelHe : d.labelEn}
                      gradient={GRADIENT_MAP[d.color] || 'from-primary to-primary/80'}
                      onClick={() => onPillarSelect?.(d.id)}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── PILLAR VIEW: Topic Widgets (iPhone style) ── */}
          {!isAll && !selectedTopic && subcategories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {isHe ? '📋 נושאים' : '📋 Topics'}
                </h3>
                <button
                  onClick={() => setSuggestOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                >
                  <MessageSquarePlus className="h-3 w-3" />
                  {isHe ? 'בקש נושא' : 'Suggest'}
                </button>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-y-4 gap-x-2 py-1 justify-items-center">
                <IPhoneWidget
                  emoji="🌐"
                  label={isHe ? 'כל השרשורים' : 'All Threads'}
                  gradient="from-primary to-primary/80"
                  onClick={() => onSelectTopic?.(null)}
                  size="sm"
                />
                {subcategories.map((sub, index) => (
                  <IPhoneWidget
                    key={sub.id}
                    emoji={sub.icon}
                    label={isHe ? sub.he : sub.en}
                    gradient={TOPIC_GRADIENTS[index % TOPIC_GRADIENTS.length]}
                    onClick={() => onSelectTopic?.(sub.id)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── TOPIC SELECTED: back chip + feed ── */}
          {!isAll && selectedTopic && (
            <button
              onClick={() => onSelectTopic?.(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors w-fit"
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
        <EventsModal open={eventsOpen} onOpenChange={setEventsOpen} />
        <AIMatchModal open={matchOpen} onOpenChange={setMatchOpen} />
        <CreateStoryModal open={storyOpen} onOpenChange={setStoryOpen} />
      </PageShell>
    </UsernameGate>
  );
};

export default Community;
