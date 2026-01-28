import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommunityLayout from '@/components/community/CommunityLayout';
import CommentSection from '@/components/community/CommentSection';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ArrowLeft, Heart, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CommunityPost = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dateLocale = isRTL ? he : enUS;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const { data: post, isLoading } = useQuery({
    queryKey: ['community-post', id],
    queryFn: async () => {
      if (!id) throw new Error('Post ID is required');
      
      const { data: postData, error } = await supabase
        .from('community_posts')
        .select('*, category:community_categories(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;

      // Fetch author profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', postData.user_id)
        .single();

      // Fetch member data
      const { data: member } = await supabase
        .from('community_members')
        .select(`
          avatar_url,
          current_level:community_levels(name, name_en, badge_color)
        `)
        .eq('user_id', postData.user_id)
        .single();

      return {
        ...postData,
        author: profile,
        member,
      };
    },
    enabled: !!id,
  });

  const { data: isLiked } = useQuery({
    queryKey: ['post-like', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id) return false;
      const { data } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .single();
      return !!data;
    },
    enabled: !!user?.id && !!id,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !id) throw new Error('Not authenticated');
      
      if (isLiked) {
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_likes')
          .insert({ post_id: id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-like', id] });
      queryClient.invalidateQueries({ queryKey: ['community-post', id] });
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        <main className="pt-20">
          <CommunityLayout>
            <Skeleton className="h-96 w-full" />
          </CommunityLayout>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
        <Header />
        <main className="pt-20">
          <CommunityLayout>
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('community.postNotFound')}</p>
              <Button onClick={() => navigate('/community')} className="mt-4">
                {t('community.backToFeed')}
              </Button>
            </div>
          </CommunityLayout>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <main className="pt-20">
        <CommunityLayout>
          <div className="space-y-4">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate('/community')} className="gap-2">
              <BackIcon className="h-4 w-4" />
              {t('community.backToFeed')}
            </Button>

            {/* Post */}
            <Card className={cn(post.is_pinned && "border-primary/50 bg-primary/5")}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/community/profile/${post.user_id}`}>
                      <Avatar className="h-12 w-12">
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
                  
                  {post.is_pinned && (
                    <Pin className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {post.title && (
                  <h1 className="text-2xl font-bold">{post.title}</h1>
                )}
                <p className="text-foreground whitespace-pre-wrap text-lg">{post.content}</p>

                {/* Media */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                    {post.media_urls.map((url: string, index: number) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                        <img 
                          src={url} 
                          alt="" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Like Button */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className={cn("gap-2", isLiked && "text-red-500")}
                    onClick={() => likeMutation.mutate()}
                    disabled={!user || likeMutation.isPending}
                  >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                    <span>{post.likes_count || 0} {t('community.likes')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardContent className="pt-6">
                <CommentSection postId={post.id} />
              </CardContent>
            </Card>
          </div>
        </CommunityLayout>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityPost;
