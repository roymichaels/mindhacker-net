/**
 * @module domain/coaches/hooks
 * @purpose Coach-vocabulary wrappers around practitioner hooks.
 * ALL coach data access flows through this file.
 * No UI component should call .from('practitioner_*') directly.
 * 
 * @data usePractitioners, usePractitioner, useMyPractitionerProfile
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';

export {
  usePractitioners as useCoaches,
  usePractitioner as useCoach,
  usePractitioner as useCoachBySlug,
  useMyPractitionerProfile as useMyCoachProfile,
} from '@/hooks/usePractitioners';

// Types are re-exported via ./types.ts — don't duplicate here

/** Fetch services for a specific coach */
export const useCoachServices = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ['coach-services', coachId],
    queryFn: async () => {
      if (!coachId) return [];
      const { data, error } = await supabase
        .from('practitioner_services')
        .select('*')
        .eq('practitioner_id', coachId)
        .eq('is_active', true)
        .order('order_index');
      if (error) throw error;
      return data || [];
    },
    enabled: !!coachId,
  });
};

/** Fetch reviews for a specific coach */
export const useCoachReviews = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ['coach-reviews', coachId],
    queryFn: async () => {
      if (!coachId) return [];
      const { data, error } = await supabase
        .from('practitioner_reviews')
        .select('*')
        .eq('practitioner_id', coachId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!coachId,
  });
};

/** Aggregate review stats (avg rating + count) */
export const useCoachReviewStats = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ['coach-review-stats', coachId],
    queryFn: async () => {
      if (!coachId) return { avg: 0, count: 0 };
      const { data } = await supabase
        .from('practitioner_reviews')
        .select('rating')
        .eq('practitioner_id', coachId);
      const reviews = data || [];
      const avg = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      return { avg: Math.round(avg * 10) / 10, count: reviews.length };
    },
    enabled: !!coachId,
  });
};

/** Fetch all reviews with reviewer names for marketing/management */
export const useCoachReviewsWithNames = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ['coach-reviews-with-names', coachId],
    queryFn: async () => {
      if (!coachId) return [];
      const { data, error } = await supabase
        .from('practitioner_reviews')
        .select('id, rating, review_text, is_approved, created_at, user_id')
        .eq('practitioner_id', coachId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return data.map(review => ({
        ...review,
        reviewer_name: profileMap.get(review.user_id) ?? null,
      }));
    },
    enabled: !!coachId,
  });
};

/** Upcoming bookings count for a coach */
export const useCoachUpcomingBookings = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ['coach-upcoming-bookings', coachId],
    queryFn: async () => {
      if (!coachId) return 0;
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('practitioner_id', coachId)
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .in('status', ['pending', 'confirmed']);
      return count || 0;
    },
    enabled: !!coachId,
  });
};

/** Active plans count for a coach */
export const useCoachPlansCount = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ['coach-plans-count', coachId],
    queryFn: async () => {
      if (!coachId) return 0;
      const { count } = await supabase
        .from('coach_client_plans')
        .select('id', { count: 'exact', head: true })
        .eq('coach_id', coachId)
        .eq('status', 'active');
      return count || 0;
    },
    enabled: !!coachId,
  });
};

/** Activity feed for coach sidebar */
export interface CoachActivityEvent {
  id: string;
  type: 'new_client' | 'review_received';
  label: string;
  time: string;
}

export const useCoachActivityFeed = (coachId: string | undefined) => {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const locale = isHe ? he : enUS;

  return useQuery({
    queryKey: ['coach-activity-feed', coachId, language],
    queryFn: async (): Promise<CoachActivityEvent[]> => {
      if (!coachId) return [];
      const events: CoachActivityEvent[] = [];

      const { data: recentClients } = await supabase
        .from('practitioner_clients')
        .select('id, created_at, client_user_id')
        .eq('practitioner_id', coachId)
        .order('created_at', { ascending: false })
        .limit(5);

      for (const c of recentClients || []) {
        events.push({
          id: `client-${c.id}`,
          type: 'new_client',
          label: isHe ? 'מתאמן חדש הצטרף' : 'New client joined',
          time: formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale }),
        });
      }

      const { data: recentReviews } = await supabase
        .from('practitioner_reviews')
        .select('id, created_at, rating')
        .eq('practitioner_id', coachId)
        .order('created_at', { ascending: false })
        .limit(5);

      for (const r of recentReviews || []) {
        events.push({
          id: `review-${r.id}`,
          type: 'review_received',
          label: isHe ? `ביקורת חדשה (${r.rating}⭐)` : `Review received (${r.rating}⭐)`,
          time: formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale }),
        });
      }

      return events.slice(0, 8);
    },
    enabled: !!coachId,
  });
};

/** Coach storefront settings (practitioner + practitioner_settings) */
export const useCoachSettings = (userId: string | undefined) => {
  const profileQuery = useQuery({
    queryKey: ['my-coach-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('practitioners')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  const settingsQuery = useQuery({
    queryKey: ['coach-settings', profileQuery.data?.id],
    queryFn: async () => {
      if (!profileQuery.data) return null;
      const { data } = await supabase
        .from('practitioner_settings')
        .select('*')
        .eq('practitioner_id', profileQuery.data.id)
        .maybeSingle();
      return data;
    },
    enabled: !!profileQuery.data,
  });

  return {
    practitioner: profileQuery.data,
    settings: settingsQuery.data,
    isLoading: profileQuery.isLoading || settingsQuery.isLoading,
  };
};

/** Save coach settings mutation */
export const useSaveCoachSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ settingsId, data }: { settingsId: string; data: Record<string, unknown> }) => {
      const { error } = await supabase
        .from('practitioner_settings')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', settingsId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-settings'] });
    },
  });
};

/** Coach availability for booking */
export const useCoachAvailability = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ['coach-availability', coachId],
    queryFn: async () => {
      if (!coachId) return [];
      const { data, error } = await supabase
        .from('practitioner_availability')
        .select('*')
        .eq('practitioner_id', coachId)
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!coachId,
  });
};

/** Coach offers */
export const useCoachOffers = (coachId: string | undefined) => {
  return useQuery({
    queryKey: ['coach-offers', coachId],
    queryFn: async () => {
      if (!coachId) return [];
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('practitioner_id', coachId)
        .order('homepage_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!coachId,
  });
};

// Domain types are exported from ./types.ts via barrel index
