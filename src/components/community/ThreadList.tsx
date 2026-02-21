import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import ThreadCard from './ThreadCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ThreadListProps {
  pillarFilter: string;
  onProfileClick: (userId: string) => void;
}

export default function ThreadList({ pillarFilter, onProfileClick }: ThreadListProps) {
  const { t } = useTranslation();

  const { data: threads, isLoading } = useQuery({
    queryKey: ['community-threads', pillarFilter],
    queryFn: async () => {
      let query = supabase
        .from('community_posts')
        .select('id, user_id, title, content, category_id, created_at, likes_count, comments_count, is_pinned, pillar, status')
        .in('status', ['approved'])
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (pillarFilter !== 'all') {
        query = query.eq('pillar', pillarFilter);
      }

      const { data: posts, error } = await query;
      if (error) throw error;
      if (!posts || posts.length === 0) return [];

      // Fetch author data + category data
      const userIds = [...new Set(posts.map(p => p.user_id))];
      const categoryIds = [...new Set(posts.map(p => p.category_id).filter(Boolean))];

      const [{ data: profiles }, { data: categories }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, level, community_username').in('id', userIds),
        categoryIds.length > 0
          ? supabase.from('community_categories').select('id, name, name_en, color, icon').in('id', categoryIds)
          : Promise.resolve({ data: [] }),
      ]);

      const catMap = Object.fromEntries((categories || []).map(c => [c.id, c]));

      return posts.map(post => ({
        ...post,
        category: catMap[post.category_id || ''] || null,
        author: profiles?.find(p => p.id === post.user_id) || null,
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 p-4 space-y-2">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!threads || threads.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-4xl mb-3">🌐</p>
        <p className="text-muted-foreground font-medium">{t('combatCommunity.noThreads')}</p>
        <p className="text-sm text-muted-foreground/60 mt-1">{t('combatCommunity.beFirstThread')}</p>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-3 pb-4">
      {threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          onProfileClick={onProfileClick}
        />
      ))}
    </div>
  );
}
