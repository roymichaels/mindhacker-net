import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CommentItem from './CommentItem';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data: comments, isLoading } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      // First get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (commentsError) throw commentsError;
      if (!commentsData) return [];

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      
      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Fetch community members with levels
      const { data: members } = await supabase
        .from('community_members')
        .select(`
          user_id,
          avatar_url,
          current_level:community_levels(name, name_en, badge_color)
        `)
        .in('user_id', userIds);

      // Combine data
      return commentsData.map(comment => ({
        ...comment,
        author: profiles?.find(p => p.id === comment.user_id) || null,
        member: members?.find(m => m.user_id === comment.user_id) || null,
      }));
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [postId, queryClient]);

  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          parent_comment_id: parentId || null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success(t('community.commentAdded'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  // Organize comments into threads
  const rootComments = comments?.filter(c => !c.parent_comment_id) || [];
  const getReplies = (commentId: string) => 
    comments?.filter(c => c.parent_comment_id === commentId) || [];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">
        {t('community.comments')} ({comments?.length || 0})
      </h3>

      {/* Add Comment */}
      {user && (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder={t('community.writeComment')}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={cn("min-h-[60px] resize-none flex-1", isRTL && "text-right")}
            />
            <Button
              size="icon"
              onClick={() => addCommentMutation.mutate({ content: newComment })}
              disabled={!newComment.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : rootComments.length > 0 ? (
          rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              onReply={() => setReplyingTo(comment.id)}
              replyingTo={replyingTo}
              onSubmitReply={(content) => {
                addCommentMutation.mutate({ content, parentId: comment.id });
              }}
              onCancelReply={() => setReplyingTo(null)}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">
            {t('community.noComments')}
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
