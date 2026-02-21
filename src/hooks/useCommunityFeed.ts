import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateTrendingScore } from '@/lib/communityHelpers';

export interface CommunityThread {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  pillar: string | null;
  status: string;
  created_at: string | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  category?: { name: string; name_en: string | null; color: string | null; icon: string | null } | null;
  author?: { full_name: string | null; level: number | null; community_username: string | null } | null;
  trendingScore?: number;
}

interface UseCommunityFeedOptions {
  pillarFilter?: string;
  mode?: 'latest' | 'trending';
  limit?: number;
}

export function useCommunityFeed({ pillarFilter = 'all', mode = 'latest', limit = 50 }: UseCommunityFeedOptions = {}) {
  return useQuery({
    queryKey: ['community-threads', pillarFilter, mode, limit],
    queryFn: async (): Promise<CommunityThread[]> => {
      let query = supabase
        .from('community_posts')
        .select('id, user_id, title, content, category_id, created_at, likes_count, comments_count, is_pinned, pillar, status')
        .eq('status', 'approved')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

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

      let threads: CommunityThread[] = posts.map(post => {
        const hoursAgo = post.created_at
          ? (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60)
          : 999;

        return {
          ...post,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          is_pinned: post.is_pinned || false,
          category: catMap[post.category_id || ''] || null,
          author: profiles?.find(p => p.id === post.user_id) || null,
          trendingScore: calculateTrendingScore(post.likes_count || 0, post.comments_count || 0, hoursAgo),
        };
      });

      if (mode === 'trending') {
        threads.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
      }

      return threads;
    },
    staleTime: 30_000,
  });
}

/** Active members today — count of unique users who posted/commented today */
export function useActiveToday() {
  return useQuery({
    queryKey: ['community-active-today'],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('community_members')
        .select('id', { count: 'exact', head: true })
        .gte('last_active_at', todayStart.toISOString());

      return count || 0;
    },
    staleTime: 60_000,
  });
}

/** User reputation data */
export function useUserReputation(userId: string | undefined) {
  return useQuery({
    queryKey: ['community-reputation', userId],
    queryFn: async () => {
      if (!userId) return null;

      const [{ data: member }, { count: approvedThreads }, { count: replies }] = await Promise.all([
        supabase.from('community_members').select('total_points, likes_received, posts_count, comments_count').eq('user_id', userId).single(),
        supabase.from('community_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'approved'),
        supabase.from('community_comments').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_aurora', false),
      ]);

      return {
        totalPoints: member?.total_points || 0,
        likesReceived: member?.likes_received || 0,
        postsCount: member?.posts_count || 0,
        commentsCount: member?.comments_count || 0,
        approvedThreads: approvedThreads || 0,
        replies: replies || 0,
      };
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

/** Weekly highlight - thread with highest trending score this week */
export function useWeeklyHighlight() {
  return useQuery({
    queryKey: ['community-weekly-highlight'],
    queryFn: async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data } = await supabase
        .from('community_posts')
        .select('id, title, content, pillar, likes_count, comments_count, created_at, user_id')
        .eq('status', 'approved')
        .gte('created_at', weekAgo.toISOString())
        .order('likes_count', { ascending: false })
        .limit(10);

      if (!data || data.length === 0) return null;

      // Calculate trending scores and pick best
      let best = data[0];
      let bestScore = 0;
      for (const post of data) {
        const hoursAgo = (Date.now() - new Date(post.created_at!).getTime()) / (1000 * 60 * 60);
        const score = calculateTrendingScore(post.likes_count || 0, post.comments_count || 0, hoursAgo);
        if (score > bestScore) {
          bestScore = score;
          best = post;
        }
      }

      // Get author
      const { data: author } = await supabase
        .from('profiles')
        .select('full_name, community_username, level')
        .eq('id', best.user_id)
        .single();

      return { ...best, author, trendingScore: bestScore };
    },
    staleTime: 5 * 60_000,
  });
}

/** Top contributors this week */
export function useTopContributors(limit = 5) {
  return useQuery({
    queryKey: ['community-top-contributors', limit],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_members')
        .select('user_id, total_points, likes_received, posts_count, comments_count')
        .order('total_points', { ascending: false })
        .limit(limit);

      if (!data || data.length === 0) return [];

      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, community_username, level')
        .in('id', userIds);

      return data.map(m => ({
        ...m,
        profile: profiles?.find(p => p.id === m.user_id) || null,
      }));
    },
    staleTime: 5 * 60_000,
  });
}
