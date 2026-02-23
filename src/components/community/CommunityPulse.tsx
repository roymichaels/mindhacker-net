/**
 * CommunityPulse - Homepage section showing latest threads, trending, and active count.
 * Integrates into the dashboard as a "pulse" of the MindOS community.
 */
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useCommunityFeed, useActiveToday, useWeeklyHighlight } from '@/hooks/useCommunityFeed';
import { Flame, Clock, Users, ArrowRight, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ThreadCard from '@/components/community/ThreadCard';
import { cn } from '@/lib/utils';

const PILLAR_ICONS: Record<string, string> = {
  consciousness: '🔮', presence: '👁️', power: '💪', vitality: '☀️',
  focus: '🎯', combat: '⚔️', expansion: '🧠', wealth: '📈',
  influence: '👑', relationships: '🤝', business: '💼', projects: '📋', play: '🎮',
};

export function CommunityPulse() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  const { data: latestThreads } = useCommunityFeed({ mode: 'latest', limit: 3 });
  const { data: trendingThreads } = useCommunityFeed({ mode: 'trending', limit: 5 });
  const { data: activeCount } = useActiveToday();
  const { data: highlight } = useWeeklyHighlight();

  const handleProfileClick = (userId: string) => {
    navigate('/community');
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🫂</span>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              {isHe ? 'דופק הקהילה' : 'Community Pulse'}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {isHe ? '14 עמודים. ציוויליזציה אחת.' : '14 pillars. One civilization.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeCount !== undefined && activeCount > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-400">
                {activeCount} {isHe ? 'פעילים' : 'online'}
              </span>
            </div>
          )}
          <button
            onClick={() => navigate('/community')}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {isHe ? 'פתח קהילה' : 'Open Community'}
            <ArrowRight className="h-3 w-3 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Weekly Highlight */}
      {highlight && (
        <div className="mx-4 mb-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 p-3 flex items-start gap-2">
          <Award className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 border-amber-500/30 text-amber-500">
                🏆 {isHe ? 'שרשור השבוע' : 'TOTW'}
              </Badge>
              {highlight.pillar && <span className="text-[10px]">{PILLAR_ICONS[highlight.pillar]}</span>}
            </div>
            <p className="text-xs font-medium line-clamp-1">{highlight.title || highlight.content?.slice(0, 50)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
        {/* Latest */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isHe ? 'אחרונים' : 'Latest'}
            </span>
          </div>
          <div className="space-y-2">
            {latestThreads?.slice(0, 3).map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onProfileClick={handleProfileClick}
                compact
              />
            ))}
            {(!latestThreads || latestThreads.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">
                {isHe ? 'אין שרשורים עדיין' : 'No threads yet'}
              </p>
            )}
          </div>
        </div>

        {/* Trending */}
        <div className="px-4 pb-3 lg:border-s border-border/30">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isHe ? 'טרנדי' : 'Trending'}
            </span>
          </div>
          <div className="space-y-2">
            {trendingThreads?.slice(0, 5).map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onProfileClick={handleProfileClick}
                compact
              />
            ))}
            {(!trendingThreads || trendingThreads.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">
                {isHe ? 'אין שרשורים טרנדיים' : 'No trending threads'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
