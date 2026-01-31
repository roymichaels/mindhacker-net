import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PostCard from './PostCard';
import PostEditor from './PostEditor';
import CategoryFilter from './CategoryFilter';
import CommunityNavTabs from './CommunityNavTabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface CommunityFeedProps {
  categoryId?: string;
}

const CommunityFeed = ({ categoryId }: CommunityFeedProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedCategory, setSelectedCategory] = useState(categoryId || 'all');
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<any>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-posts', selectedCategory],
    queryFn: async () => {
      // First get posts
      let query = supabase
        .from('community_posts')
        .select('*, category:community_categories(*)')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data: postsData, error } = await query.limit(50);
      if (error) throw error;
      if (!postsData) return [];

      // Get unique user IDs
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      
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
      return postsData.map(post => ({
        ...post,
        author: profiles?.find(p => p.id === post.user_id) || null,
        member: members?.find(m => m.user_id === post.user_id) || null,
      }));

    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('community-posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['community-posts'] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  const handleDelete = async () => {
    if (!deletePostId) return;
    
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', deletePostId);
      
      if (error) throw error;
      
      toast.success(t('community.postDeleted'));
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setDeletePostId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Post Editor */}
      {user && !editingPost && (
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
          <PostEditor />
        </div>
      )}
      
      {/* Editing Post */}
      {editingPost && (
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
          <PostEditor 
            editPost={editingPost}
            onSuccess={() => setEditingPost(null)}
            onCancel={() => setEditingPost(null)}
          />
        </div>
      )}

      {/* Posts with Filter */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
        {/* Navigation Tabs inside posts container */}
        <CommunityNavTabs />
        
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="divide-y divide-border/50">
            {posts.map((post) => (
              <PostCard 
                key={post.id}
                post={post}
                onEdit={() => setEditingPost(post)}
                onDelete={() => setDeletePostId(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('community.noPosts')}</p>
            <p className="text-sm mt-2 text-muted-foreground/70">{t('community.beFirstToPost')}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('community.deletePost')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('community.deletePostConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommunityFeed;
