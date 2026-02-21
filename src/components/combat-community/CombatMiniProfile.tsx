import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

function getCombatRank(level: number): { en: string; he: string } {
  if (level >= 80) return { en: 'Elite', he: 'עילית' };
  if (level >= 51) return { en: 'Advanced', he: 'מתקדם' };
  if (level >= 26) return { en: 'Fighter', he: 'לוחם' };
  if (level >= 11) return { en: 'Operator', he: 'מפעיל' };
  return { en: 'Initiate', he: 'חניך' };
}

interface CombatMiniProfileProps {
  userId: string | null;
  open: boolean;
  onClose: () => void;
}

export default function CombatMiniProfile({ userId, open, onClose }: CombatMiniProfileProps) {
  const { t, language } = useTranslation();
  const isHe = language === 'he';

  const { data, isLoading } = useQuery({
    queryKey: ['combat-mini-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const [{ data: profile }, { data: member }, { count: threadCount }, { count: replyCount }] = await Promise.all([
        supabase.from('profiles').select('full_name, level').eq('id', userId).single(),
        supabase.from('community_members').select('avatar_url, total_points').eq('user_id', userId).single(),
        supabase.from('community_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('community_comments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ]);

      // Top 3 threads
      const { data: topThreads } = await supabase
        .from('community_posts')
        .select('id, title, likes_count')
        .eq('user_id', userId)
        .order('likes_count', { ascending: false })
        .limit(3);

      return {
        name: profile?.full_name || '—',
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

  const rank = data ? getCombatRank(data.level) : getCombatRank(1);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side={isHe ? 'right' : 'left'} className="w-80">
        <SheetHeader>
          <SheetTitle>{t('combatCommunity.playerProfile')}</SheetTitle>
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
            {/* Avatar + Name */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-20 w-20 ring-2 ring-amber-500/30">
                <AvatarFallback className="text-2xl bg-amber-500/10 text-amber-500 font-bold">
                  {data.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg">{data.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-xs">
                  {isHe ? rank.he : rank.en}
                </Badge>
                <span className="text-sm text-muted-foreground">Lv.{data.level}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/50 p-3 text-center">
                <p className="text-lg font-bold">{data.threads}</p>
                <p className="text-xs text-muted-foreground">{t('combatCommunity.threads')}</p>
              </div>
              <div className="rounded-lg border border-border/50 p-3 text-center">
                <p className="text-lg font-bold">{data.replies}</p>
                <p className="text-xs text-muted-foreground">{t('combatCommunity.replies')}</p>
              </div>
            </div>

            {/* Top Threads */}
            {data.topThreads.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  {t('combatCommunity.topThreads')}
                </h4>
                <div className="space-y-1.5">
                  {data.topThreads.map((thread) => (
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
