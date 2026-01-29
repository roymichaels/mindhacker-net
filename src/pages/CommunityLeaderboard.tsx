import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CommunityLayout from '@/components/community/CommunityLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

const CommunityLeaderboard = () => {
  const { t, isRTL } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: t('community.leaderboardPageTitle'),
    description: t('community.leaderboardPageDescription'),
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/community/leaderboard');
    }
  }, [user, loading, navigate]);

  const { data: members, isLoading } = useQuery({
    queryKey: ['community-leaderboard'],
    queryFn: async () => {
      const { data: membersData, error } = await supabase
        .from('community_members')
        .select(`
          *,
          current_level:community_levels(*)
        `)
        .order('total_points', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      if (!membersData) return [];

      const userIds = membersData.map(m => m.user_id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      return membersData.map(member => ({
        ...member,
        profile: profiles?.find(p => p.id === member.user_id) || null,
      }));
    },
    enabled: !!user,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50';
      default: return '';
    }
  };

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
      <main className="pt-0">
        <CommunityLayout>
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <h1 className="text-2xl font-bold">{t('community.leaderboard')}</h1>
              </div>
              <p className="text-muted-foreground">{t('community.leaderboardSubtitle')}</p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : members && members.length > 0 ? (
              <div className="space-y-3">
                {members.map((member, index) => {
                  const rank = index + 1;
                  const isCurrentUser = member.user_id === user?.id;
                  const IconComponent = member.current_level?.badge_icon 
                    ? (LucideIcons as any)[member.current_level.badge_icon] || LucideIcons.Star
                    : LucideIcons.Star;

                  return (
                    <Link key={member.id} to={`/community/profile/${member.user_id}`}>
                      <Card className={cn(
                        "transition-all hover:shadow-md",
                        getRankBg(rank),
                        isCurrentUser && "ring-2 ring-primary"
                      )}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className="w-12 flex justify-center">
                              {getRankIcon(rank)}
                            </div>

                            {/* Avatar */}
                            <Avatar className={cn(
                              "h-12 w-12",
                              rank <= 3 && "ring-2",
                              rank === 1 && "ring-yellow-500",
                              rank === 2 && "ring-gray-400",
                              rank === 3 && "ring-amber-600"
                            )}>
                              <AvatarImage src={member.avatar_url || ''} />
                              <AvatarFallback>
                                {member.profile?.full_name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">
                                  {member.profile?.full_name || t('community.member')}
                                  {isCurrentUser && (
                                    <Badge variant="secondary" className="ms-2 text-xs">
                                      {t('common.you')}
                                    </Badge>
                                  )}
                                </h3>
                              </div>
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
                            </div>

                            {/* Points */}
                            <div className="text-end">
                              <p className="text-xl font-bold">{member.total_points}</p>
                              <p className="text-xs text-muted-foreground">{t('community.points')}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('community.noLeaderboardData')}</p>
              </div>
            )}
          </div>
        </CommunityLayout>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityLeaderboard;
