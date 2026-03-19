import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { MessageSquarePlus, ChevronLeft, Clock, Flame, CalendarDays, MapPin, Sparkles, Users, ArrowRight } from 'lucide-react';
import UsernameGate from '@/components/community/UsernameGate';
import CreateThreadModal from '@/components/community/CreateThreadModal';
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { setActivePillar } = useAuroraChatContext();
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [feedMode, setFeedMode] = useState<'latest' | 'trending'>('latest');
  const [planThread, setPlanThread] = useState<ThreadData | null>(null);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
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

          {/* ── ALL VIEW: Events + AI Match + Pillar Cards ── */}
          {isAll && (
            <>
              {/* ── Top Banners: Events & AI Match ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Events Card */}
                <button
                  onClick={() => setEventsOpen(true)}
                  className="group relative overflow-hidden rounded-2xl border border-sky-500/20 bg-sky-500/[0.06] p-4 text-start transition-all hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/10 active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground">
                        {isHe ? 'אירועים קרובים' : 'Upcoming Events'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {isHe ? 'מפגשים חיים, סדנאות ואתגרים קהילתיים' : 'Live meetups, workshops & community challenges'}
                      </p>
                    </div>
                    <ArrowRight className={cn("w-4 h-4 text-sky-500/60 group-hover:text-sky-500 transition-colors mt-1 flex-shrink-0", isHe && "rotate-180")} />
                  </div>
                  {/* Event preview pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/15">
                      {isHe ? '🎯 אתגר שבועי' : '🎯 Weekly Challenge'}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/15">
                      {isHe ? '🎙️ שיחה פתוחה' : '🎙️ Open Talk'}
                    </span>
                  </div>
                </button>

                {/* AI Match Card */}
                <button
                  onClick={() => setMatchOpen(true)}
                  className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-start transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 active:scale-[0.99]"
                >
                  {/* Glow accent */}
                  <div className="absolute top-0 end-0 w-24 h-24 rounded-full bg-amber-400/5 blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-foreground">
                          {isHe ? 'AI Match' : 'AI Match'}
                        </h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                          {isHe ? 'חדש' : 'New'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {isHe
                          ? 'Aurora תחבר אותך לשחקנים קרובים אליך שישחיזו אותך — אימונים, פגישות ושיתופי פעולה בחיים האמיתיים'
                          : 'Aurora connects you with nearby players who sharpen you — train together, meet up & build real-life bonds'}
                      </p>
                    </div>
                  </div>
                  {/* Feature highlights */}
                  <div className="relative flex flex-wrap gap-1.5 mt-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {isHe ? 'לפי מיקום' : 'Location-based'}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15 flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" />
                      {isHe ? 'שיתופי פעולה' : 'Collaborations'}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/15 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {isHe ? 'התאמה חכמה' : 'Smart matching'}
                    </span>
                  </div>
                </button>
              </div>

              {/* ── Pillar Cards Grid ── */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2">
                {LIFE_DOMAINS.map((d) => {
                  const Icon = d.icon;
                  const count = pillarCounts?.[d.id] || 0;
                  const hsl = PILLAR_HSL[d.id] || '217 91% 60%';
                  return (
                    <button
                      key={d.id}
                      onClick={() => onPillarSelect?.(d.id)}
                      className={cn(
                        "group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border",
                        "active:scale-[0.97] transition-all duration-200"
                      )}
                      style={{
                        backgroundColor: `hsl(${hsl} / 0.06)`,
                        borderColor: `hsl(${hsl} / 0.2)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `hsl(${hsl} / 0.15)`;
                        e.currentTarget.style.borderColor = `hsl(${hsl} / 0.4)`;
                        e.currentTarget.style.boxShadow = `0 4px 15px -3px hsl(${hsl} / 0.15)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `hsl(${hsl} / 0.06)`;
                        e.currentTarget.style.borderColor = `hsl(${hsl} / 0.2)`;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                        style={{ backgroundColor: `hsl(${hsl} / 0.15)` }}
                      >
                        <Icon className="h-4.5 w-4.5" style={{ color: `hsl(${hsl})` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-center leading-tight truncate w-full" style={{ color: `hsl(${hsl})` }}>
                        {isHe ? d.labelHe : d.labelEn}
                      </span>
                      {count > 0 && (
                        <div className="flex items-center gap-0.5 text-[10px]" style={{ color: `hsl(${hsl} / 0.7)` }}>
                          <MessageSquare className="h-2.5 w-2.5" />
                          <span>{count}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── PILLAR VIEW: Topic Cards (no topic selected yet) ── */}
          {!isAll && !selectedTopic && subcategories.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2">
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
      </PageShell>
    </UsernameGate>
  );
};

export default Community;
