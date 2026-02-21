import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import CombatThreadCard from './CombatThreadCard';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_MAP: Record<string, string> = {
  'striking': 'Striking',
  'grappling': 'Grappling',
  'tactical': 'Tactical',
  'weapons': 'Weapons',
  'conditioning': 'Conditioning',
  'solo-training': 'Solo Training',
  'mistake-analysis': 'Mistake Analysis',
  'sparring-iq': 'Sparring IQ',
  'biomechanics': 'Biomechanics',
};

const ALL_COMBAT_CATEGORIES = Object.values(CATEGORY_MAP);

interface CombatThreadListProps {
  categoryFilter: string;
  onProfileClick: (userId: string) => void;
}

export default function CombatThreadList({ categoryFilter, onProfileClick }: CombatThreadListProps) {
  const { t, language } = useTranslation();
  const isHe = language === 'he';

  const { data: threads, isLoading } = useQuery({
    queryKey: ['combat-threads', categoryFilter],
    queryFn: async () => {
      // Get combat category IDs
      const filterName = categoryFilter !== 'all' ? CATEGORY_MAP[categoryFilter] : null;
      
      const { data: categories } = await supabase
        .from('community_categories')
        .select('id, name, name_en, color, icon')
        .in('name_en', filterName ? [filterName] : ALL_COMBAT_CATEGORIES);
      
      if (!categories || categories.length === 0) return [];
      const categoryIds = categories.map(c => c.id);
      const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));

      let query = supabase
        .from('community_posts')
        .select('id, user_id, title, content, category_id, created_at, likes_count, comments_count, is_pinned')
        .in('category_id', categoryIds)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: posts, error } = await query;
      if (error) throw error;
      if (!posts || posts.length === 0) return [];

      // Fetch author data
      const userIds = [...new Set(posts.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, level')
        .in('id', userIds);

      const { data: members } = await supabase
        .from('community_members')
        .select('user_id, avatar_url')
        .in('user_id', userIds);

      return posts.map(post => ({
        ...post,
        category: categoryMap[post.category_id || ''] || null,
        author: profiles?.find(p => p.id === post.user_id) || null,
        member: members?.find(m => m.user_id === post.user_id) || null,
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
        <p className="text-4xl mb-3">⚔️</p>
        <p className="text-muted-foreground font-medium">{t('combatCommunity.noThreads')}</p>
        <p className="text-sm text-muted-foreground/60 mt-1">{t('combatCommunity.beFirstThread')}</p>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-3 pb-4">
      {threads.map((thread) => (
        <CombatThreadCard
          key={thread.id}
          thread={thread}
          onProfileClick={onProfileClick}
        />
      ))}
    </div>
  );
}
