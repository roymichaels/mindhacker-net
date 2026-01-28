import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
    <Card className={cn("transition-shadow hover:shadow-md", post.is_pinned && "border-primary/50 bg-primary/5")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/community/profile/${post.user_id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.member?.avatar_url || ''} />
                <AvatarFallback>
                  {post.author?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link 
                  to={`/community/profile/${post.user_id}`}
                  className="font-semibold hover:underline"
                >
                  {post.author?.full_name || t('community.member')}
                </Link>
                {post.member?.current_level && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: (post.member.current_level.badge_color || '#6366f1') + '20', 
                      color: post.member.current_level.badge_color || '#6366f1' 
                    }}
                  >
                    {isRTL ? post.member.current_level.name : post.member.current_level.name_en || post.member.current_level.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {post.created_at && formatDistanceToNow(new Date(post.created_at), { 
                    addSuffix: true, 
                    locale: dateLocale 
                  })}
                </span>
                {post.category && (
                  <>
                    <span>•</span>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: post.category.color || '#6366f1', color: post.category.color || '#6366f1' }}
                    >
                      {isRTL ? post.category.name : post.category.name_en || post.category.name}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {post.is_pinned && (
              <Pin className="h-4 w-4 text-primary" />
            )}
            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {post.title && (
          <Link to={`/community/post/${post.id}`}>
            <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
              {post.title}
            </h3>
          </Link>
        )}
        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
        
        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className={cn(
            "grid gap-2 mt-3",
            post.media_urls.length === 1 && "grid-cols-1",
            post.media_urls.length === 2 && "grid-cols-2",
            post.media_urls.length >= 3 && "grid-cols-3"
          )}>
            {post.media_urls.slice(0, 4).map((url, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt="" 
                  className="object-cover w-full h-full"
                />
                {index === 3 && post.media_urls && post.media_urls.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-bold">
                    +{post.media_urls.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 border-t">
        <div className="flex items-center gap-4 w-full pt-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("gap-2", isLiked && "text-red-500")}
            onClick={() => likeMutation.mutate()}
            disabled={!user || likeMutation.isPending}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span>{post.likes_count || 0}</span>
          </Button>
          
          <Link to={`/community/post/${post.id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count || 0}</span>
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
