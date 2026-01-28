import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import { useTranslation } from "@/hooks/useTranslation";
import Header from "@/components/Header";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CommunityFeed from "@/components/community/CommunityFeed";
import QuickActions from "@/components/dashboard/QuickActions";
import { Skeleton } from "@/components/ui/skeleton";

const UserDashboard = () => {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);
  
  // SEO Configuration
  useSEO({
    title: t('seo.dashboardTitle'),
    description: t('seo.dashboardDescription'),
    url: `${window.location.origin}/dashboard`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: t('seo.breadcrumbHome'), url: window.location.origin },
        { name: t('seo.breadcrumbDashboard'), url: `${window.location.origin}/dashboard` },
      ]),
    ],
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Ensure community member exists
      const { data: existingMember } = await supabase
        .from('community_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingMember) {
        // Create community member if doesn't exist
        await supabase
          .from('community_members')
          .insert({ user_id: user.id });
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      // Trigger a refetch of the feed
      window.location.reload();
    },
  });

  const scrollToNewPost = () => {
    feedRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <PullToRefreshIndicator {...pullToRefresh} />
      <Header />
      
      <DashboardLayout>
        {/* Quick Actions Bar */}
        <QuickActions onNewPost={scrollToNewPost} />
        
        {/* Community Feed */}
        <div ref={feedRef}>
          <CommunityFeed />
        </div>
      </DashboardLayout>
    </div>
  );
};

export default UserDashboard;
