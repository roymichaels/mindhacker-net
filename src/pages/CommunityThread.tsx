/**
 * CommunityThread — Full thread view with comments.
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowRight, ArrowLeft, Heart, MessageCircle, Send, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { he as heLocale, enUS } from 'date-fns/locale';
import { getRankForPillar } from '@/lib/communityHelpers';
import { getDomainById } from '@/navigation/lifeDomains';
import PlayerAvatar from '@/components/community/PlayerAvatar';
import { useSidebars } from '@/hooks/useSidebars';

export default function CommunityThread() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const { data: post, isLoading } = useQuery({
    queryKey: ['community-post', postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*, category:community_categories(name, name_en, color, icon)')
        .eq('id', postId!)
        .single();
      if (error) throw error;

      // Fetch author profile
      const { data: author } = await supabase
        .from('profiles')
        .select('full_name, level, community_username')
        .eq('id', data.user_id)
        .single();

      return { ...data, author };
    },
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['community-comments', postId],
    enabled: !!postId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId!)
        .order('created_at', { ascending: true });
      if (error) throw error;

      // Fetch authors for comments
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, level, community_username')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      return data.map(c => ({ ...c, author: profileMap.get(c.user_id) || null }));
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('community_comments')
        .insert({ post_id: postId!, user_id: user.id, content });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['community-post', postId] });
    },
  });

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <p className="text-muted-foreground">{isHe ? 'הפוסט לא נמצא' : 'Post not found'}</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/community')}>
          <BackIcon className="h-4 w-4 me-1" />
          {isHe ? 'חזרה לקהילה' : 'Back to Community'}
        </Button>
      </div>
    );
  }

  const pillar = post.pillar || 'consciousness';
  const domain = getDomainById(pillar);
  const level = post.author?.level ?? 1;
  const rank = getRankForPillar(pillar, level);
  const username = (post.author as any)?.community_username;
  const displayTitle = isHe ? (post.title_he || post.title) : (post.title || post.title_he);
  const displayContent = isHe ? (post.content_he || post.content) : (post.content || post.content_he || '');

  return (
    <div className="max-w-xl w-full mx-auto px-4 pt-4 pb-72 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Back button */}
      <button
        onClick={() => navigate('/community')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <BackIcon className="h-4 w-4" />
        {isHe ? 'חזרה' : 'Back'}
      </button>

      {/* Post */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 space-y-3">
        {/* Author */}
        <div className="flex items-center gap-2.5">
          <PlayerAvatar userId={post.user_id} size="sm" name={username || post.author?.full_name || '?'} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-semibold truncate">{username || post.author?.full_name || '—'}</span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 shrink-0 border-primary/40 text-primary">
                {isHe ? rank.he : rank.en}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Lv.{level}</span>
              <span>·</span>
              <span>
                {post.created_at && formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: isHe ? heLocale : enUS,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar badge */}
        {domain && post.pillar && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary/80">
            {isHe ? domain.labelHe : domain.labelEn}
          </Badge>
        )}

        {/* Title */}
        <h1 className="text-lg font-bold text-foreground leading-tight">{displayTitle}</h1>

        {/* Full content */}
        <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{displayContent}</p>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/20">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5" /> {post.likes_count ?? 0}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" /> {post.comments_count ?? 0}
          </span>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">
          {isHe ? 'תגובות' : 'Comments'} ({comments.length})
        </h2>

        {commentsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            {isHe ? 'אין תגובות עדיין' : 'No comments yet'}
          </p>
        ) : (
          comments.map((c: any) => (
            <div key={c.id} className="rounded-lg border border-border/30 bg-card/30 p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <PlayerAvatar userId={c.user_id} size="sm" name={c.author?.community_username || c.author?.full_name || '?'} className="h-6 w-6" />
                <span className="text-xs font-medium">{c.author?.community_username || c.author?.full_name || '—'}</span>
                <span className="text-[10px] text-muted-foreground ms-auto">
                  {c.created_at && formatDistanceToNow(new Date(c.created_at), {
                    addSuffix: false,
                    locale: isHe ? heLocale : enUS,
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground/80">{c.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Comment input */}
      {user && (
        <div className="flex gap-2 items-end">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isHe ? 'כתוב תגובה...' : 'Write a comment...'}
            className="min-h-[40px] max-h-[120px] text-sm resize-none bg-card/50"
            rows={1}
          />
          <Button
            size="icon"
            disabled={!comment.trim() || addComment.isPending}
            onClick={() => addComment.mutate(comment.trim())}
            className="shrink-0 h-10 w-10"
          >
            {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
