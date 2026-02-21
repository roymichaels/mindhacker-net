import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDistanceToNow } from 'date-fns';
import { he as heLocale, enUS } from 'date-fns/locale';
import { Heart, MessageCircle, Bookmark, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getRankForPillar } from '@/lib/communityHelpers';
import { getDomainById } from '@/navigation/lifeDomains';
import PlayerAvatar from './PlayerAvatar';

export interface ThreadData {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  pillar: string | null;
  status: string;
  created_at: string | null;
  likes_count: number | null;
  comments_count: number | null;
  category?: { name: string; name_en: string | null; color: string | null; icon: string | null } | null;
  author?: { full_name: string | null; level: number | null; community_username: string | null } | null;
}

interface ThreadCardProps {
  thread: ThreadData;
  onProfileClick: (userId: string) => void;
}

const PILLAR_ICONS: Record<string, string> = {
  consciousness: '🔮', presence: '👁️', power: '💪', vitality: '☀️',
  focus: '🎯', combat: '⚔️', expansion: '🧠', wealth: '📈',
  influence: '👑', relationships: '🤝', business: '💼', projects: '📋', play: '🎮',
};

export default function ThreadCard({ thread, onProfileClick }: ThreadCardProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const level = thread.author?.level ?? 1;
  const pillar = thread.pillar || 'combat';
  const rank = getRankForPillar(pillar, level);
  const domain = getDomainById(pillar);
  const isMistakeAnalysis = thread.category?.name_en === 'Mistake Analysis';
  const isPending = thread.status === 'pending';
  const username = (thread.author as any)?.community_username;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 transition-colors hover:bg-card/80",
        isMistakeAnalysis && "border-s-2 border-s-destructive",
        isPending && "opacity-60"
      )}
    >
      {isPending && (
        <div className="flex items-center gap-1.5 text-xs text-primary mb-2">
          <Clock className="h-3 w-3" />
          <span>{isHe ? 'ממתין לאישור Aurora' : 'Awaiting Aurora approval'}</span>
        </div>
      )}

      {/* Top: Orb + Username + Rank + Time */}
      <div className="flex items-center gap-2.5 mb-2">
        <button onClick={() => onProfileClick(thread.user_id)} className="shrink-0">
          <PlayerAvatar userId={thread.user_id} size="sm" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <button
              onClick={() => onProfileClick(thread.user_id)}
              className="font-semibold hover:underline truncate"
            >
              {username || thread.author?.full_name || '—'}
            </button>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 shrink-0 border-primary/40 text-primary">
              {isHe ? rank.he : rank.en}
            </Badge>
            {isMistakeAnalysis && <span className="text-xs">⚠️</span>}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Lv.{level}</span>
            <span>·</span>
            <span>
              {thread.created_at && formatDistanceToNow(new Date(thread.created_at), {
                addSuffix: false,
                locale: isHe ? heLocale : enUS,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Pillar badge */}
      {domain && (
        <div className="mb-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary/80">
            {PILLAR_ICONS[pillar]} {isHe ? domain.labelHe : domain.labelEn}
          </Badge>
        </div>
      )}

      {/* Title */}
      <Link to={`/community/post/${thread.id}`}>
        <h3 className="font-semibold text-foreground mb-1 hover:text-primary transition-colors leading-tight">
          {thread.title || thread.content.slice(0, 60)}
        </h3>
      </Link>

      {/* Preview */}
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {thread.content}
      </p>

      {/* Sub-category Badge */}
      {thread.category && (
        <div className="mt-2">
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4"
            style={{ borderColor: thread.category.color || undefined, color: thread.category.color || undefined }}
          >
            {thread.category.icon} {isHe ? thread.category.name : thread.category.name_en || thread.category.name}
          </Badge>
        </div>
      )}

      {/* Bottom: Reply, Upvotes, Save */}
      <div className="flex items-center gap-4 mt-3 -ms-1.5">
        <Link to={`/community/post/${thread.id}`}>
          <button className="flex items-center gap-1 px-1.5 py-1 rounded-full text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{thread.comments_count || 0}</span>
          </button>
        </Link>
        <button className="flex items-center gap-1 px-1.5 py-1 rounded-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
          <Heart className="h-3.5 w-3.5" />
          <span>{thread.likes_count || 0}</span>
        </button>
        <button className="flex items-center gap-1 px-1.5 py-1 rounded-full text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
          <Bookmark className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
