import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDistanceToNow } from 'date-fns';
import { he as heLocale, enUS } from 'date-fns/locale';
import { Heart, MessageCircle, Bookmark, Send, MoreHorizontal, Clock, TrendingUp, Lightbulb } from 'lucide-react';
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
  media_urls?: string[] | null;
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
  const isPending = thread.status === 'pending';
  const username = (thread.author as any)?.community_username;
  const hasMedia = thread.media_urls && thread.media_urls.length > 0;

  const displayTitle = isHe
    ? (thread.title_he || thread.title)
    : (thread.title || thread.title_he);
  const displayContent = isHe
    ? (thread.content_he || thread.content)
    : (thread.content || thread.content_he || '');

  const timeAgo = thread.created_at
    ? formatDistanceToNow(new Date(thread.created_at), { addSuffix: false, locale: isHe ? heLocale : enUS })
    : '';

  // ── Compact variant (unchanged) ──
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

  // ── Instagram-style card ──
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm overflow-hidden transition-colors",
        isPending && "opacity-60",
        thread.is_pinned && "border-primary/30 bg-primary/5"
      )}
    >
      {/* ── Header: Avatar + Name + Pillar + Time + Menu ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => onProfileClick(thread.user_id)} className="shrink-0">
          <PlayerAvatar userId={thread.user_id} size="sm" name={username || thread.author?.full_name || '?'} className="h-10 w-10 ring-2 ring-primary/20" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground truncate">
              {username || thread.author?.full_name || '—'}
            </span>
            {thread.is_system && <span className="text-xs">📌</span>}
            {showTrendingBadge && thread.trendingScore && thread.trendingScore > 5 && (
              <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            )}
            {isPending && <Clock className="h-3.5 w-3.5 text-primary shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {domain && thread.pillar && (
              <span>{PILLAR_ICONS[pillar]}</span>
            )}
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary font-medium">
              {isHe ? rank.he : rank.en}
            </Badge>
            <span>·</span>
            <span className="text-xs">Lv.{level}</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
      </div>

      {/* ── Category badge strip ── */}
      {thread.category && (
        <div className="px-4 pb-2">
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0.5 h-5 font-medium rounded-full"
            style={{ borderColor: thread.category.color || undefined, color: thread.category.color || undefined }}
          >
            {thread.category.icon} {isHe ? thread.category.name : thread.category.name_en || thread.category.name}
          </Badge>
        </div>
      )}

      {/* ── Media (image) ── */}
      {hasMedia && (
        <Link to={`/community/post/${thread.id}`} className="block">
          <div className="relative w-full bg-muted/30">
            <img
              src={thread.media_urls![0]}
              alt=""
              className="w-full max-h-[420px] object-cover"
              loading="lazy"
            />
            {thread.media_urls!.length > 1 && (
              <div className="absolute top-3 end-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                +{thread.media_urls!.length - 1}
              </div>
            )}
          </div>
        </Link>
      )}

      {/* ── Action bar ── */}
      <div className="flex items-center gap-4 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
          <Heart className="h-5 w-5" />
        </span>
        <Link to={`/community/post/${thread.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <MessageCircle className="h-5 w-5" />
        </Link>
        <span className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <Send className="h-5 w-5" />
        </span>
        <div className="ms-auto flex items-center gap-3">
          {onAddToPlan && (
            <button
              onClick={() => onAddToPlan(thread)}
              className="text-muted-foreground hover:text-emerald-500 transition-colors"
            >
              <Lightbulb className="h-5 w-5" />
            </button>
          )}
          <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Bookmark className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* ── Likes count ── */}
      {thread.likes_count > 0 && (
        <div className="px-4 pb-1">
          <span className="text-sm font-bold text-foreground">
            {thread.likes_count} {isHe ? 'לייקים' : 'likes'}
          </span>
        </div>
      )}

      {/* ── Content body ── */}
      <Link to={`/community/post/${thread.id}`} className="block px-4 pb-3">
        {displayTitle && (
          <h3 className="text-sm font-bold text-foreground mb-0.5">{displayTitle}</h3>
        )}
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
          <span className="font-semibold text-foreground me-1.5">
            {username || thread.author?.full_name || '—'}
          </span>
          {displayContent}
        </p>
      </Link>

      {/* ── Comments preview ── */}
      {thread.comments_count > 0 && (
        <Link to={`/community/post/${thread.id}`} className="block px-4 pb-3">
          <span className="text-sm text-muted-foreground">
            {isHe ? `הצג את כל ${thread.comments_count} התגובות` : `View all ${thread.comments_count} comments`}
          </span>
        </Link>
      )}
    </div>
  );
}
