import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDistanceToNow } from 'date-fns';
import { he as heLocale, enUS } from 'date-fns/locale';
import { Heart, MessageCircle, Bookmark, Clock, TrendingUp, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getRankForPillar } from '@/lib/communityHelpers';
import { getDomainById } from '@/navigation/lifeDomains';
import PlayerAvatar from './PlayerAvatar';

export interface ThreadData {
  id: string;
  user_id: string;
  title: string | null;
  title_he: string | null;
  content: string;
  content_he: string | null;
  pillar: string | null;
  status: string;
  created_at: string | null;
  likes_count: number;
  comments_count: number;
  is_pinned?: boolean;
  is_system?: boolean;
  trendingScore?: number;
  category?: { name: string; name_en: string | null; color: string | null; icon: string | null } | null;
  author?: { full_name: string | null; level: number | null; community_username: string | null } | null;
}

interface ThreadCardProps {
  thread: ThreadData;
  onProfileClick: (userId: string) => void;
  compact?: boolean;
  showTrendingBadge?: boolean;
  onAddToPlan?: (thread: ThreadData) => void;
}

const PILLAR_ICONS: Record<string, string> = {
  consciousness: '🔮', presence: '👁️', power: '💪', vitality: '☀️',
  focus: '🎯', combat: '⚔️', expansion: '🧠', wealth: '📈',
  influence: '👑', relationships: '🤝', business: '💼', projects: '📋', play: '🎮',
};

export default function ThreadCard({ thread, onProfileClick, compact, showTrendingBadge, onAddToPlan }: ThreadCardProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const level = thread.author?.level ?? 1;
  const pillar = thread.pillar || 'consciousness';
  const rank = getRankForPillar(pillar, level);
  const domain = getDomainById(pillar);
  const isMistakeAnalysis = thread.category?.name_en === 'Mistake Analysis';
  const isPending = thread.status === 'pending';
  const username = (thread.author as any)?.community_username;

  // Auto-translate: show localized content based on user language
  const displayTitle = isHe
    ? (thread.title_he || thread.title)
    : (thread.title || thread.title_he);
  const displayContent = isHe
    ? (thread.content_he || thread.content)
    : (thread.content || thread.content_he || '');

  if (compact) {
    return (
      <Link to={`/community/post/${thread.id}`}>
        <div className="rounded-lg border border-border/30 bg-card/30 p-2.5 hover:bg-card/60 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <PlayerAvatar userId={thread.user_id} size="sm" name={username || thread.author?.full_name || '?'} className="h-6 w-6 ring-1" />
            <span className="text-[11px] font-medium truncate">{username || thread.author?.full_name || '—'}</span>
            {domain && <span className="text-[10px]">{PILLAR_ICONS[pillar]}</span>}
          </div>
          <p className="text-xs font-medium leading-tight line-clamp-1">{displayTitle || displayContent.slice(0, 50)}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" />{thread.likes_count}</span>
            <span className="flex items-center gap-0.5"><MessageCircle className="h-2.5 w-2.5" />{thread.comments_count}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/community/post/${thread.id}`}>
      <div
        className={cn(
          "rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-3 py-2 transition-colors hover:bg-card/80",
          isMistakeAnalysis && "border-s-2 border-s-destructive",
          isPending && "opacity-60",
          thread.is_pinned && "border-primary/30 bg-primary/5"
        )}
      >
        {/* Single row: pin/system badge + avatar + name + rank + lv + time + pillar */}
        <div className="flex items-center gap-2">
          {thread.is_system && <span className="text-[10px]">📌</span>}
          {isPending && <Clock className="h-3 w-3 text-primary shrink-0" />}
          {showTrendingBadge && thread.trendingScore && thread.trendingScore > 5 && (
            <TrendingUp className="h-3 w-3 text-amber-500 shrink-0" />
          )}
          <button onClick={(e) => { e.preventDefault(); onProfileClick(thread.user_id); }} className="shrink-0">
            <PlayerAvatar userId={thread.user_id} size="sm" name={username || thread.author?.full_name || '?'} className="h-5 w-5 ring-1" />
          </button>
          <span className="text-xs font-semibold truncate max-w-[100px]">{username || thread.author?.full_name || '—'}</span>
          <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 shrink-0 border-primary/40 text-primary">
            {isHe ? rank.he : rank.en}
          </Badge>
          <span className="text-[10px] text-muted-foreground shrink-0">Lv.{level}</span>
          <span className="text-[10px] text-muted-foreground ms-auto shrink-0">
            {thread.created_at && formatDistanceToNow(new Date(thread.created_at), {
              addSuffix: false,
              locale: isHe ? heLocale : enUS,
            })}
          </span>
        </div>

        {/* Title row with inline pillar + category badges */}
        <div className="flex items-center gap-1.5 mt-1">
          {domain && thread.pillar && (
            <span className="text-[10px] shrink-0">{PILLAR_ICONS[pillar]}</span>
          )}
          <h3 className="text-xs font-semibold text-foreground truncate flex-1">
            {displayTitle || displayContent.slice(0, 60)}
          </h3>
          {thread.category && (
            <Badge
              variant="outline"
              className="text-[8px] px-1 py-0 h-3 shrink-0"
              style={{ borderColor: thread.category.color || undefined, color: thread.category.color || undefined }}
            >
              {thread.category.icon} {isHe ? thread.category.name : thread.category.name_en || thread.category.name}
            </Badge>
          )}
        </div>

        {/* Bottom actions row */}
        <div className="flex items-center gap-2.5 mt-1">
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <MessageCircle className="h-3 w-3" /> {thread.comments_count}
          </span>
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Heart className="h-3 w-3" /> {thread.likes_count}
          </span>
          <Bookmark className="h-3 w-3 text-muted-foreground" />
          {onAddToPlan && (
            <button
              onClick={(e) => { e.preventDefault(); onAddToPlan(thread); }}
              className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-emerald-500 transition-colors ms-auto"
            >
              <Lightbulb className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
