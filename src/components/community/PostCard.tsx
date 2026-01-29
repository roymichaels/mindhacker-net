import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Pin,
  Pencil,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    title: string | null;
    content: string;
    media_urls: string[] | null;
    is_pinned: boolean | null;
    likes_count: number | null;
    comments_count: number | null;
    created_at: string | null;
    category?: {
      id: string;
      name: string;
      name_en: string | null;
      color: string | null;
      icon: string | null;
    } | null;
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
  onEdit?: () => void;
  onDelete?: () => void;
}

const PostCard = ({ post, onEdit, onDelete }: PostCardProps) => {
  const { t, isRTL } = useTranslation();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Check if user liked this post
  const { data: isLiked } = useQuery({
    queryKey: ['post-like', post.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', post.id)
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
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_likes')
          .insert({ post_id: post.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-like', post.id] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  const canModify = user?.id === post.user_id || isAdmin;
  const dateLocale = isRTL ? he : enUS;

  return (
    <div className={cn(
      "px-4 py-3 border-b hover:bg-muted/30 transition-colors",
      post.is_pinned && "bg-primary/5"
    )}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Link to={`/community/profile/${post.user_id}`} className="shrink-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={post.member?.avatar_url || ''} />
            <AvatarFallback className="text-sm">
              {post.author?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <Link 
                to={`/community/profile/${post.user_id}`}
                className="font-semibold hover:underline truncate"
              >
                {post.author?.full_name || t('community.member')}
              </Link>
              
              {post.member?.current_level && (
                <Badge 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                  style={{ 
                    backgroundColor: (post.member.current_level.badge_color || '#6366f1') + '20', 
                    color: post.member.current_level.badge_color || '#6366f1' 
                  }}
                >
                  {isRTL ? post.member.current_level.name : post.member.current_level.name_en || post.member.current_level.name}
                </Badge>
              )}
              
              <span className="text-muted-foreground shrink-0">·</span>
              
              <span className="text-muted-foreground text-xs shrink-0">
                {post.created_at && formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: false, 
                  locale: dateLocale 
                })}
              </span>
              
              {post.is_pinned && (
                <Pin className="h-3 w-3 text-primary shrink-0" />
              )}
            </div>
            
            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="h-4 w-4 me-2" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 me-2" />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Category Badge */}
          {post.category && (
            <Badge 
              variant="outline" 
              className="text-[10px] px-1.5 py-0 h-4 mt-1"
              style={{ borderColor: post.category.color || '#6366f1', color: post.category.color || '#6366f1' }}
            >
              {isRTL ? post.category.name : post.category.name_en || post.category.name}
            </Badge>
          )}

          {/* Title */}
          {post.title && (
            <Link to={`/community/post/${post.id}`}>
              <h3 className="font-semibold mt-1 hover:text-primary transition-colors">
                {post.title}
              </h3>
            </Link>
          )}

          {/* Content */}
          <p className="text-foreground mt-1 whitespace-pre-wrap text-sm leading-relaxed">
            {post.content}
          </p>
          
          {/* Media */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className={cn(
              "grid gap-1.5 mt-2 rounded-xl overflow-hidden",
              post.media_urls.length === 1 && "grid-cols-1",
              post.media_urls.length === 2 && "grid-cols-2",
              post.media_urls.length >= 3 && "grid-cols-2"
            )}>
              {post.media_urls.slice(0, 4).map((url, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "relative aspect-video overflow-hidden",
                    post.media_urls?.length === 3 && index === 0 && "row-span-2 aspect-square"
                  )}
                >
                  <img 
                    src={url} 
                    alt="" 
                    className="object-cover w-full h-full"
                  />
                  {index === 3 && post.media_urls && post.media_urls.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                      +{post.media_urls.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 -ms-2">
            <button 
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-sm transition-colors",
                "hover:bg-red-500/10 hover:text-red-500",
                isLiked ? "text-red-500" : "text-muted-foreground"
              )}
              onClick={() => likeMutation.mutate()}
              disabled={!user || likeMutation.isPending}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span className="text-xs">{post.likes_count || 0}</span>
            </button>
            
            <Link to={`/community/post/${post.id}`}>
              <button className="flex items-center gap-1.5 px-2 py-1 rounded-full text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{post.comments_count || 0}</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
