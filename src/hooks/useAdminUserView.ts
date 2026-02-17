import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from './useUserRoles';

export interface AdminUserData {
  id: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  preferred_language: string | null;
  // Roles
  roles: string[];
  // Community data
  community: {
    total_points: number;
    posts_count: number;
    comments_count: number;
    likes_received: number;
    level_name: string | null;
    level_color: string | null;
  } | null;
  // Purchases
  purchases: {
    id: string;
    package_type: string;
    sessions_total: number;
    sessions_remaining: number;
    price: number;
    payment_status: string;
    purchase_date: string;
  }[];
  // Activity stats
  stats: {
    sessions_count: number;
    courses_enrolled: number;
    checklists_count: number;
    total_purchases: number;
    active_sessions: number;
  };
  // Aurora data
  aurora: {
    checklists: {
      id: string;
      title: string;
      status: string;
      created_at: string;
    }[];
    focus_plans: {
      id: string;
      title: string;
      status: string;
      duration_days: number;
    }[];
    launchpad_summary: any | null;
  };
  // Sessions history
  sessions: {
    id: string;
    ego_state: string;
    duration_seconds: number;
    completed_at: string | null;
    created_at: string;
  }[];
}

interface UseAdminUserViewReturn {
  userData: AdminUserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAdminUserView = (userId: string): UseAdminUserViewReturn => {
  const { hasRole } = useUserRoles();
  const [userData, setUserData] = useState<AdminUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = hasRole('admin');

  const fetchUserData = useCallback(async () => {
    if (!userId || !isAdmin) {
      setLoading(false);
      setError(!isAdmin ? 'Unauthorized' : null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        profileResult,
        emailResult,
        rolesResult,
        communityResult,
        purchasesResult,
        sessionsResult,
        enrollmentsResult,
        checklistsResult,
        focusPlansResult,
        hypnosisSessionsResult,
        launchpadResult,
      ] = await Promise.all([
        // Profile
        supabase
          .from('profiles')
          .select('id, full_name, bio, created_at, preferred_language')
          .eq('id', userId)
          .single(),
        // Email (via edge function)
        supabase.functions.invoke('get-user-data', { body: { userId } }),
        // Roles
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId),
        // Community
        supabase
          .from('community_members')
          .select(`
            total_points,
            posts_count,
            comments_count,
            likes_received,
            avatar_url,
            community_levels (
              name,
              badge_color
            )
          `)
          .eq('user_id', userId)
          .single(),
        // Purchases
        supabase
          .from('purchases')
          .select('*')
          .eq('user_id', userId)
          .order('purchase_date', { ascending: false }),
        // Sessions count
        supabase
          .from('hypnosis_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        // Enrollments count
        supabase
          .from('course_enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        // Checklists
        supabase
          .from('aurora_checklists')
          .select('id, title, status, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        // Focus plans
        supabase
          .from('aurora_focus_plans')
          .select('id, title, status, duration_days')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
        // Recent hypnosis sessions
        supabase
          .from('hypnosis_sessions')
          .select('id, ego_state, duration_seconds, completed_at, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        // Launchpad summary
        supabase
          .from('launchpad_summaries')
          .select('*')
          .eq('user_id', userId)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single(),
      ]);

      if (profileResult.error) throw profileResult.error;

      const profile = profileResult.data as {
        id: string;
        full_name: string | null;
        bio: string | null;
        created_at: string;
        preferred_language: string | null;
      };
      const communityData = communityResult.data;
      const purchases = purchasesResult.data || [];

      const community = communityData ? {
        total_points: communityData.total_points || 0,
        posts_count: communityData.posts_count || 0,
        comments_count: communityData.comments_count || 0,
        likes_received: communityData.likes_received || 0,
        level_name: (communityData.community_levels as any)?.name || null,
        level_color: (communityData.community_levels as any)?.badge_color || null,
      } : null;

      const totalPurchases = purchases.length;
      const activeSessions = purchases.reduce((sum, p) => sum + (p.sessions_remaining || 0), 0);

      setUserData({
        id: userId,
        email: emailResult.data?.user?.email || 'Unknown',
        full_name: profile.full_name,
        bio: profile.bio,
        avatar_url: communityData?.avatar_url || null,
        created_at: profile.created_at,
        preferred_language: profile.preferred_language,
        roles: rolesResult.data?.map(r => r.role) || [],
        community,
        purchases,
        stats: {
          sessions_count: sessionsResult.count || 0,
          courses_enrolled: enrollmentsResult.count || 0,
          checklists_count: checklistsResult.data?.length || 0,
          total_purchases: totalPurchases,
          active_sessions: activeSessions,
        },
        aurora: {
          checklists: checklistsResult.data || [],
          focus_plans: focusPlansResult.data || [],
          launchpad_summary: launchpadResult.data || null,
        },
        sessions: hypnosisSessionsResult.data || [],
      });
    } catch (err) {
      console.error('Error fetching admin user view:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    userData,
    loading,
    error,
    refetch: fetchUserData,
  };
};
