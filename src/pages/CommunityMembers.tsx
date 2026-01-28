import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommunityLayout from '@/components/community/CommunityLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

const CommunityMembers = () => {
  const { t, isRTL } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useSEO({
    title: t('community.membersPageTitle'),
    description: t('community.membersPageDescription'),
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/community/members');
    }
  }, [user, loading, navigate]);

  const { data: members, isLoading } = useQuery({
    queryKey: ['community-members', searchQuery],
    queryFn: async () => {
      // Get members with levels
      const { data: membersData, error } = await supabase
        .from('community_members')
        .select(`
          *,
          current_level:community_levels(*)
        `)
        .order('total_points', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      if (!membersData) return [];

      // Get user IDs
      const userIds = membersData.map(m => m.user_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Combine and filter by search
      return membersData
        .map(member => ({
          ...member,
          profile: profiles?.find(p => p.id === member.user_id) || null,
        }))
        .filter(member => {
          if (!searchQuery) return true;
          const name = member.profile?.full_name?.toLowerCase() || '';
          return name.includes(searchQuery.toLowerCase());
        });
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <main className="pt-20">
        <CommunityLayout>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{t('community.members')}</h1>
                <p className="text-muted-foreground">{t('community.membersSubtitle')}</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('community.searchMembers')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : members && members.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member) => {
                  const IconComponent = member.current_level?.badge_icon 
                    ? (LucideIcons as any)[member.current_level.badge_icon] || LucideIcons.Star
                    : LucideIcons.Star;

                  return (
                    <Link key={member.id} to={`/community/profile/${member.user_id}`}>
                      <Card className="hover:shadow-md transition-shadow h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14">
                              <AvatarImage src={member.avatar_url || ''} />
                              <AvatarFallback>
                                {member.profile?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">
                                {member.profile?.full_name || t('community.member')}
                              </h3>
                              {member.current_level && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs gap-1 mt-1"
                                  style={{ 
                                    backgroundColor: (member.current_level.badge_color || '#6366f1') + '20', 
                                    color: member.current_level.badge_color || '#6366f1' 
                                  }}
                                >
                                  <IconComponent className="h-3 w-3" />
                                  {isRTL ? member.current_level.name : member.current_level.name_en || member.current_level.name}
                                </Badge>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {member.total_points} {t('community.points')}
                              </p>
                            </div>
                          </div>
                          
                          {member.bio && (
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                              {member.bio}
                            </p>
                          )}
                          
                          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                            <span>{member.posts_count} {t('community.posts')}</span>
                            <span>{member.comments_count} {t('community.comments')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? t('community.noMembersFound') : t('community.noMembers')}
                </p>
              </div>
            )}
          </div>
        </CommunityLayout>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityMembers;
