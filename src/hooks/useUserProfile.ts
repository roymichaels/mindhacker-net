import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfileData {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  preferred_language: string | null;
  // Community data
  community?: {
    total_points: number;
    posts_count: number;
    comments_count: number;
    likes_received: number;
    level_name: string | null;
    level_color: string | null;
  } | null;
  // Activity stats
  stats?: {
    sessions_count: number;
    courses_enrolled: number;
    checklists_count: number;
  };
}

interface UseUserProfileReturn {
  profile: UserProfileData | null;
  loading: boolean;
  error: string | null;
  isOwnProfile: boolean;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfileData>) => Promise<boolean>;
}

export const useUserProfile = (userId?: string): UseUserProfileReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch base profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, bio, created_at, preferred_language')
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;

      // Fetch community member data
      const { data: communityData } = await supabase
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
        .eq('user_id', targetUserId)
        .single();

      // Fetch activity stats
      const [sessionsResult, enrollmentsResult, checklistsResult] = await Promise.all([
        supabase
          .from('hypnosis_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId),
        supabase
          .from('course_enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId),
        supabase
          .from('aurora_checklists')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId),
      ]);

      const community = communityData ? {
        total_points: communityData.total_points || 0,
        posts_count: communityData.posts_count || 0,
        comments_count: communityData.comments_count || 0,
        likes_received: communityData.likes_received || 0,
        level_name: (communityData.community_levels as any)?.name || null,
        level_color: (communityData.community_levels as any)?.badge_color || null,
      } : null;

      setProfile({
        id: profileData.id,
        full_name: profileData.full_name,
        bio: profileData.bio,
        created_at: profileData.created_at,
        preferred_language: profileData.preferred_language,
        avatar_url: communityData?.avatar_url || null,
        community,
        stats: {
          sessions_count: sessionsResult.count || 0,
          courses_enrolled: enrollmentsResult.count || 0,
          checklists_count: checklistsResult.count || 0,
        },
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  const updateProfile = useCallback(async (updates: Partial<UserProfileData>): Promise<boolean> => {
    if (!isOwnProfile || !targetUserId) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          bio: updates.bio,
          preferred_language: updates.preferred_language,
        })
        .eq('id', targetUserId);

      if (error) throw error;
      
      await fetchProfile();
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  }, [isOwnProfile, targetUserId, fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    isOwnProfile,
    refetch: fetchProfile,
    updateProfile,
  };
};
