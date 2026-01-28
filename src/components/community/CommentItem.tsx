import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Reply, MoreHorizontal, Pencil, Trash2, Send, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: {
    id: string;
    user_id: string;
    content: string;
    likes_count: number | null;
    created_at: string | null;
    is_edited: boolean | null;
    author?: {
      full_name: string | null;
    } | null;
    member?: {
      avatar_url: string | null;
      current_level?: {
        name: string;
        name_en: string | null;
        badge_color: string | null;
      } | null;
    } | null;
  };
  replies?: CommentItemProps['comment'][];
  onReply: () => void;
  replyingTo: string | null;
  onSubmitReply: (content: string) => void;
  onCancelReply: () => void;
  isReply?: boolean;
}

const CommentItem = ({ 
  comment, 
  replies = [], 
  onReply, 
  replyingTo, 
  onSubmitReply,
  onCancelReply,
  isReply = false 
}: CommentItemProps) => {
  const { t, isRTL } = useTranslation();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const dateLocale = isRTL ? he : enUS;

  const { data: isLiked } = useQuery({
    queryKey: ['comment-like', comment.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('community_likes')
        .select('id')
        .eq('comment_id', comment.id)
        .eq('user_id', user.id)
        .single();
      return !!data;
    },
    enabled: !!user?.id,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      if (isLiked) {
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_likes')
          .insert({ comment_id: comment.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-like', comment.id] });
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
    },
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('community_comments')
        .update({ 
          content: editContent.trim(), 
          is_edited: true, 
          edited_at: new Date().toISOString() 
        })
        .eq('id', comment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
      toast.success(t('community.commentUpdated'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', comment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-comments'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      toast.success(t('community.commentDeleted'));
    },
  });

  const canModify = user?.id === comment.user_id || isAdmin;

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onSubmitReply(replyContent);
      setReplyContent('');
    }
  };

  return (
    <div className={cn("space-y-2", isReply && "ms-8 ps-4 border-s-2")}>
      <div className="flex gap-3">
        <Link to={`/community/profile/${comment.user_id}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.member?.avatar_url || ''} />
            <AvatarFallback className="text-xs">
              {comment.author?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link 
                  to={`/community/profile/${comment.user_id}`}
                  className="font-semibold text-sm hover:underline"
                >
                  {comment.author?.full_name || t('community.member')}
                </Link>
                {comment.member?.current_level && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-1.5 py-0"
                    style={{ 
                      backgroundColor: (comment.member.current_level.badge_color || '#6366f1') + '20', 
                      color: comment.member.current_level.badge_color || '#6366f1' 
                    }}
                  >
                    {isRTL ? comment.member.current_level.name : comment.member.current_level.name_en || comment.member.current_level.name}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { 
                    addSuffix: true, 
                    locale: dateLocale 
                  })}
                  {comment.is_edited && ` (${t('community.edited')})`}
                </span>
              </div>
              
              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-3 w-3 me-2" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteMutation.mutate()} className="text-destructive">
                      <Trash2 className="h-3 w-3 me-2" />
                      {t('common.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={cn("min-h-[60px]", isRTL && "text-right")}
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button size="sm" onClick={() => editMutation.mutate()}>
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3 mt-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-6 px-2 gap-1 text-xs", isLiked && "text-red-500")}
              onClick={() => likeMutation.mutate()}
              disabled={!user}
            >
              <Heart className={cn("h-3 w-3", isLiked && "fill-current")} />
              <span>{comment.likes_count || 0}</span>
            </Button>
            
            {!isReply && user && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 gap-1 text-xs"
                onClick={onReply}
              >
                <Reply className="h-3 w-3" />
                {t('community.reply')}
              </Button>
            )}
          </div>
          
          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="flex gap-2 mt-2">
              <Textarea
                placeholder={t('community.writeReply')}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className={cn("min-h-[50px] resize-none text-sm", isRTL && "text-right")}
              />
              <div className="flex flex-col gap-1">
                <Button size="icon" className="h-6 w-6" onClick={handleSubmitReply}>
                  <Send className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCancelReply}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={() => {}}
              replyingTo={null}
              onSubmitReply={() => {}}
              onCancelReply={() => {}}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
