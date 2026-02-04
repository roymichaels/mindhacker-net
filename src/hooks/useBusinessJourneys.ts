import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BusinessJourneySummary {
  id: string;
  business_name: string | null;
  current_step: number;
  journey_complete: boolean;
  created_at: string;
  updated_at: string;
}

export function useBusinessJourneys() {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<BusinessJourneySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJourneys = useCallback(async () => {
    if (!user) {
      setJourneys([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('business_journeys')
        .select('id, business_name, current_step, journey_complete, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJourneys(data || []);
    } catch (error) {
      console.error('Error fetching business journeys:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  const deleteJourney = useCallback(async (journeyId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('business_journeys')
        .delete()
        .eq('id', journeyId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setJourneys(prev => prev.filter(j => j.id !== journeyId));
      return true;
    } catch (error) {
      console.error('Error deleting journey:', error);
      return false;
    }
  }, [user]);

  return {
    journeys,
    isLoading,
    refetch: fetchJourneys,
    deleteJourney,
  };
}
