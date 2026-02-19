import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Skeleton } from '@/components/ui/skeleton';
import { Grid3X3, FileText, Heart, MessageCircle } from 'lucide-react';
import PostDetailModal from './PostDetailModal';

interface CommunityPost {
  id: string;
  content: string;
  title: string | null;
  media_urls: string[] | null;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string | null;
  user_id: string;
}

interface PostsGridProps {
  userId: string;
}

const PostsGrid = ({ userId }: PostsGridProps) => {
  const { language } = useTranslation();
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['practitioner-posts', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_posts')
        .select('id, content, title, media_urls, likes_count, comments_count, created_at, user_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CommunityPost[];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-none" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Grid3X3 className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">{language === 'he' ? 'אין פוסטים עדיין' : 'No posts yet'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-0.5">
        {posts.map((post) => {
          const hasImage = post.media_urls && post.media_urls.length > 0;

          return (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="aspect-square relative group overflow-hidden bg-muted"
            >
              {hasImage ? (
                <img
                  src={post.media_urls![0]}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-3 bg-gradient-to-br from-primary/10 to-primary/5">
                  <p className="text-xs line-clamp-4 text-center text-foreground/70">
                    {post.content.slice(0, 120)}
                  </p>
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                <span className="flex items-center gap-1 text-sm font-semibold">
                  <Heart className="h-4 w-4 fill-white" /> {post.likes_count || 0}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold">
                  <MessageCircle className="h-4 w-4 fill-white" /> {post.comments_count || 0}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <PostDetailModal
        post={selectedPost}
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      />
    </>
  );
};

export default PostsGrid;
