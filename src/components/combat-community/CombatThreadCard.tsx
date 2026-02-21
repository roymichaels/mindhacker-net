import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDistanceToNow } from 'date-fns';
import { he as heLocale, enUS } from 'date-fns/locale';
import { Heart, MessageCircle, Bookmark, Dumbbell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function getCombatRank(level: number): { en: string; he: string } {
  if (level >= 80) return { en: 'Elite', he: 'עילית' };
  if (level >= 51) return { en: 'Advanced', he: 'מתקדם' };
  if (level >= 26) return { en: 'Fighter', he: 'לוחם' };
  if (level >= 11) return { en: 'Operator', he: 'מפעיל' };
  return { en: 'Initiate', he: 'חניך' };
}

interface CombatThreadCardProps {
  thread: {
    id: string;
    user_id: string;
    title: string | null;
    content: string;
    created_at: string | null;
    likes_count: number | null;
    comments_count: number | null;
    category?: { name: string; name_en: string | null; color: string | null; icon: string | null } | null;
    author?: { full_name: string | null; level: number | null } | null;
    member?: { user_id: string; avatar_url: string | null } | null;
  };
  onProfileClick: (userId: string) => void;
}

export default function CombatThreadCard({ thread, onProfileClick }: CombatThreadCardProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const level = thread.author?.level ?? 1;
  const rank = getCombatRank(level);
  const isMistakeAnalysis = thread.category?.name_en === 'Mistake Analysis';

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 transition-colors hover:bg-card/80",
        isMistakeAnalysis && "border-s-2 border-s-destructive"
      )}
    >
      {/* Top: Orb + Username + Rank + Time */}
      <div className="flex items-center gap-2.5 mb-2">
        <button onClick={() => onProfileClick(thread.user_id)} className="shrink-0">
          <Avatar className="h-9 w-9 ring-1 ring-border/50">
            <AvatarFallback className="text-xs bg-amber-500/10 text-amber-500 font-bold">
              {(thread.author?.full_name || '?').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <button
              onClick={() => onProfileClick(thread.user_id)}
              className="font-semibold hover:underline truncate"
            >
              {thread.author?.full_name || '—'}
            </button>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 shrink-0 border-amber-500/40 text-amber-500">
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

      {/* Category Badge */}
      {thread.category && (
        <div className="mt-2">
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4"
            style={{ borderColor: thread.category.color || '#f59e0b', color: thread.category.color || '#f59e0b' }}
          >
            {thread.category.icon} {isHe ? thread.category.name : thread.category.name_en || thread.category.name}
          </Badge>
        </div>
      )}

      {/* Bottom: Reply, Upvotes, Save, Drill */}
      <div className="flex items-center gap-4 mt-3 -ms-1.5">
        <Link to={`/community/post/${thread.id}`}>
          <button className="flex items-center gap-1 px-1.5 py-1 rounded-full text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>{thread.comments_count || 0}</span>
          </button>
        </Link>
        <button className="flex items-center gap-1 px-1.5 py-1 rounded-full text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
          <Heart className="h-3.5 w-3.5" />
          <span>{thread.likes_count || 0}</span>
        </button>
        <button className="flex items-center gap-1 px-1.5 py-1 rounded-full text-xs text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors">
          <Bookmark className="h-3.5 w-3.5" />
        </button>
        <button className="flex items-center gap-1 px-1.5 py-1 rounded-full text-xs text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-colors">
          <Dumbbell className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
