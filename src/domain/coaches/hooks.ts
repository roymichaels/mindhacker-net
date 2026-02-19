/**
 * @module domain/coaches/hooks
 * @purpose Coach-vocabulary wrappers around practitioner hooks
 * @data usePractitioners, usePractitioner, useMyPractitionerProfile
 * 
 * These wrappers let application code use "coach" naming while the
 * underlying hooks continue to query the `practitioners` DB table.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export {
  usePractitioners as useCoaches,
  usePractitioner as useCoach,
  usePractitioner as useCoachBySlug,
  useMyPractitionerProfile as useMyCoachProfile,
} from '@/hooks/usePractitioners';

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

// Re-export types from domain layer
export type {
  Coach,
  CoachService,
  CoachReview,
  CoachSpecialty,
  CoachWithDetails,
} from './types';
