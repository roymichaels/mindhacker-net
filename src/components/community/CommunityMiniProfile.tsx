import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { getRankForPillar } from '@/lib/communityHelpers';
import PlayerAvatar from './PlayerAvatar';

interface CommunityMiniProfileProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function CommunityMiniProfile({ userId, open, onClose }: CommunityMiniProfileProps) {
  const { t, language } = useTranslation();
  const isHe = language === 'he';

  const { data, isLoading } = useQuery({
    queryKey: ['community-mini-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const [{ data: profile }, { data: member }, { count: threadCount }, { count: replyCount }] = await Promise.all([
        supabase.from('profiles').select('full_name, level, community_username').eq('id', userId).single(),
        supabase.from('community_members').select('avatar_url, total_points').eq('user_id', userId).single(),
        supabase.from('community_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('community_comments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ]);

      const { data: topThreads } = await supabase
        .from('community_posts')
        .select('id, title, likes_count, pillar')
        .eq('user_id', userId)
        .order('likes_count', { ascending: false })
        .limit(3);

      return {
        name: (profile as any)?.community_username || profile?.full_name || '—',
        fullName: profile?.full_name || '—',
        username: (profile as any)?.community_username,
        level: profile?.level ?? 1,
        avatarUrl: member?.avatar_url,
        totalPoints: member?.total_points ?? 0,
        threads: threadCount ?? 0,
        replies: replyCount ?? 0,
        topThreads: topThreads || [],
      };
    },
    enabled: !!userId && open,
  });

  const rank = data ? getRankForPillar('combat', data.level) : getRankForPillar('combat', 1);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side={isHe ? 'right' : 'left'} className="w-80">
        <SheetHeader>
          <SheetTitle>{isHe ? 'פרופיל שחקן' : 'Player Profile'}</SheetTitle>
        </SheetHeader>

        {isLoading || !data ? (
          <div className="space-y-4 mt-6">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col items-center gap-2">
              <PlayerAvatar userId={userId!} size="lg" name={data.name} />
              <h3 className="font-bold text-lg">{data.name}</h3>
              {data.username && (
                <p className="text-xs text-muted-foreground">@{data.username}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                  {isHe ? rank.he : rank.en}
                </Badge>
                <span className="text-sm text-muted-foreground">Lv.{data.level}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/50 p-3 text-center">
                <p className="text-lg font-bold">{data.threads}</p>
                <p className="text-xs text-muted-foreground">{isHe ? 'שרשורים' : 'Threads'}</p>
              </div>
              <div className="rounded-lg border border-border/50 p-3 text-center">
                <p className="text-lg font-bold">{data.replies}</p>
                <p className="text-xs text-muted-foreground">{isHe ? 'תגובות' : 'Replies'}</p>
              </div>
            </div>

            {data.topThreads.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  {isHe ? 'שרשורים מובילים' : 'Top Threads'}
                </h4>
                <div className="space-y-1.5">
                  {data.topThreads.map((thread: any) => (
                    <div key={thread.id} className="text-sm px-2 py-1.5 rounded-lg bg-muted/30 truncate">
                      {thread.title || '—'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
