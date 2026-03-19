import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import PlayerAvatar from './PlayerAvatar';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  posts_count: number;
  likes_received: number;
  username: string;
  level: number;
  rank: number;
}

interface CommunityLeaderboardProps {
  onProfileClick: (userId: string) => void;
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function CommunityLeaderboard({ onProfileClick }: CommunityLeaderboardProps) {
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';

  const { data, isLoading } = useQuery({
    queryKey: ['community-leaderboard'],
    queryFn: async () => {
      // Fetch top 10
      const { data: top, error } = await supabase
        .from('community_members')
        .select('user_id, total_points, posts_count, likes_received')
        .order('total_points', { ascending: false })
        .limit(10);

      if (error || !top) return { entries: [], currentUserRank: null };

      // Fetch profiles for these users
      const userIds = top.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, community_username, level')
        .in('id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      const entries: LeaderboardEntry[] = top.map((m, i) => {
        const p = profileMap.get(m.user_id);
        return {
          user_id: m.user_id,
          total_points: m.total_points ?? 0,
          posts_count: m.posts_count ?? 0,
          likes_received: m.likes_received ?? 0,
          username: (p as any)?.community_username || p?.full_name || '—',
          level: p?.level ?? 1,
          rank: i + 1,
        };
      });

      // Check if current user is in top 10
      let currentUserRank: LeaderboardEntry | null = null;
      if (user && !entries.some(e => e.user_id === user.id)) {
        const { data: myMember } = await supabase
          .from('community_members')
          .select('user_id, total_points, posts_count, likes_received')
          .eq('user_id', user.id)
          .single();

        if (myMember) {
          const { count } = await supabase
            .from('community_members')
            .select('user_id', { count: 'exact', head: true })
            .gt('total_points', myMember.total_points ?? 0);

          const { data: myProfile } = await supabase
            .from('profiles')
            .select('id, full_name, community_username, level')
            .eq('id', user.id)
            .single();

          currentUserRank = {
            user_id: user.id,
            total_points: myMember.total_points ?? 0,
            posts_count: myMember.posts_count ?? 0,
            likes_received: myMember.likes_received ?? 0,
            username: (myProfile as any)?.community_username || myProfile?.full_name || '—',
            level: myProfile?.level ?? 1,
            rank: (count ?? 0) + 1,
          };
        }
      }

      return { entries, currentUserRank };
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Trophy className="h-4 w-4 text-amber-500" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 w-16 rounded-xl flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.entries.length === 0) return null;

  const { entries, currentUserRank } = data;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
        <Trophy className="h-3.5 w-3.5 text-amber-500" />
        {isHe ? 'לוח מובילים' : 'Leaderboard'}
      </h3>

      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {entries.map((entry) => {
            const isTop3 = entry.rank <= 3;
            const isCurrentUser = user?.id === entry.user_id;

            return (
              <button
                key={entry.user_id}
                onClick={() => onProfileClick(entry.user_id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-all flex-shrink-0 min-w-[72px]",
                  "border backdrop-blur-sm",
                  isCurrentUser
                    ? "border-primary/40 bg-primary/10"
                    : isTop3
                      ? "border-amber-500/20 bg-amber-500/[0.06]"
                      : "border-border/40 bg-muted/30",
                  "hover:scale-[1.03] active:scale-[0.97]"
                )}
              >
                {/* Rank */}
                <span className={cn("text-sm font-bold leading-none", isTop3 ? "" : "text-muted-foreground")}>
                  {isTop3 ? RANK_MEDALS[entry.rank - 1] : `#${entry.rank}`}
                </span>

                {/* Avatar */}
                <div className={cn(isTop3 && entry.rank === 1 && "ring-2 ring-amber-500/40 rounded-full")}>
                  <PlayerAvatar userId={entry.user_id} size="sm" name={entry.username} />
                </div>

                {/* Name */}
                <span className="text-[10px] font-medium text-foreground truncate max-w-[64px] leading-tight">
                  {entry.username}
                </span>

                {/* Points */}
                <span className="text-[9px] text-muted-foreground font-medium">
                  {entry.total_points.toLocaleString()} pts
                </span>
              </button>
            );
          })}

          {/* Current user if not in top 10 */}
          {currentUserRank && (
            <>
              <div className="flex items-center px-1 flex-shrink-0">
                <div className="w-px h-10 bg-border/60" />
              </div>
              <button
                onClick={() => onProfileClick(currentUserRank.user_id)}
                className="flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-all flex-shrink-0 min-w-[72px] border border-primary/40 bg-primary/10 hover:scale-[1.03] active:scale-[0.97]"
              >
                <span className="text-sm font-bold text-primary leading-none">#{currentUserRank.rank}</span>
                <PlayerAvatar userId={currentUserRank.user_id} size="sm" name={currentUserRank.username} />
                <span className="text-[10px] font-medium text-foreground truncate max-w-[64px] leading-tight">
                  {isHe ? 'אתה' : 'You'}
                </span>
                <span className="text-[9px] text-muted-foreground font-medium">
                  {currentUserRank.total_points.toLocaleString()} pts
                </span>
              </button>
            </>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
