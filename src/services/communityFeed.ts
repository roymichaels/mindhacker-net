/**
 * Community feed service — Phase 2 Batch 3 (read-only).
 */
import { supabase } from '@/integrations/supabase/client';

export async function getFeed(query?: string, limit = 5): Promise<{
  text: string;
  posts: any[];
  total: number;
}> {
  let q = supabase
    .from('community_posts')
    .select('id, title, content, pillar, likes_count, comments_count, created_at', { count: 'exact' })
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (query?.trim()) {
    const term = `%${query.trim().slice(0, 60)}%`;
    q = q.or(`title.ilike.${term},content.ilike.${term}`);
  }
  const { data, count } = await q;
  const posts = data ?? [];
  const text = posts.length
    ? `${count ?? posts.length} פוסטים בקהילה${posts[0]?.title ? ` · "${posts[0].title}"` : ''}`
    : 'אין פוסטים מתאימים בקהילה.';
  return { text, posts, total: count ?? posts.length };
}

export async function getThread(postId: string): Promise<{ text: string; post: any | null; comments: any[] }> {
  if (!postId) return { text: 'מזהה חסר.', post: null, comments: [] };
  const { data: post } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .maybeSingle();
  const { data: comments } = await supabase
    .from('community_comments')
    .select('id, content, user_id, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(10);
  return {
    text: post ? `שיחה: ${post.title ?? post.content?.slice(0, 60) ?? ''} · ${comments?.length ?? 0} תגובות` : 'שיחה לא נמצאה.',
    post: post ?? null,
    comments: comments ?? [],
  };
}