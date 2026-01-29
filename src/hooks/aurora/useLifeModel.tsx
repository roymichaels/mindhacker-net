import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface LifeDirection {
  id: string;
  user_id: string;
  content: string;
  clarity_score: number;
  created_at: string;
  updated_at: string;
}

interface EnergyPattern {
  id: string;
  user_id: string;
  pattern_type: 'sleep' | 'nutrition' | 'movement' | 'stress';
  description: string;
  created_at: string;
}

interface BehavioralPattern {
  id: string;
  user_id: string;
  pattern_type: 'focus' | 'avoidance' | 'discipline' | 'resistance' | 'strength';
  description: string;
  created_at: string;
}

interface FocusPlan {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  duration_days: number;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
}

interface DailyMinimum {
  id: string;
  user_id: string;
  title: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export const useLifeModel = () => {
  const { user } = useAuth();

  // Life Direction
  const { data: lifeDirection, refetch: refetchDirection } = useQuery({
    queryKey: ['aurora-life-direction', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('aurora_life_direction')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as LifeDirection | null;
    },
    enabled: !!user?.id,
  });

  // Energy Patterns
  const { data: energyPatterns = [], refetch: refetchEnergy } = useQuery({
    queryKey: ['aurora-energy-patterns', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('aurora_energy_patterns')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as EnergyPattern[];
    },
    enabled: !!user?.id,
  });

  // Behavioral Patterns
  const { data: behavioralPatterns = [], refetch: refetchBehavioral } = useQuery({
    queryKey: ['aurora-behavioral-patterns', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('aurora_behavioral_patterns')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as BehavioralPattern[];
    },
    enabled: !!user?.id,
  });

  // Focus Plans
  const { data: focusPlans = [], refetch: refetchFocus } = useQuery({
    queryKey: ['aurora-focus-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('aurora_focus_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FocusPlan[];
    },
    enabled: !!user?.id,
  });

  // Daily Minimums
  const { data: dailyMinimums = [], refetch: refetchMinimums } = useQuery({
    queryKey: ['aurora-daily-minimums', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('aurora_daily_minimums')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as DailyMinimum[];
    },
    enabled: !!user?.id,
  });

  // Computed values
  const activeFocusPlan = focusPlans.find((p) => p.status === 'active') || null;

  // Realtime subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const channels = [
      supabase
        .channel('aurora-life-direction-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'aurora_life_direction', filter: `user_id=eq.${user.id}` }, () => refetchDirection())
        .subscribe(),
      supabase
        .channel('aurora-energy-patterns-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'aurora_energy_patterns', filter: `user_id=eq.${user.id}` }, () => refetchEnergy())
        .subscribe(),
      supabase
        .channel('aurora-behavioral-patterns-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'aurora_behavioral_patterns', filter: `user_id=eq.${user.id}` }, () => refetchBehavioral())
        .subscribe(),
      supabase
        .channel('aurora-focus-plans-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'aurora_focus_plans', filter: `user_id=eq.${user.id}` }, () => refetchFocus())
        .subscribe(),
      supabase
        .channel('aurora-daily-minimums-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'aurora_daily_minimums', filter: `user_id=eq.${user.id}` }, () => refetchMinimums())
        .subscribe(),
    ];

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [user?.id, refetchDirection, refetchEnergy, refetchBehavioral, refetchFocus, refetchMinimums]);

  return {
    lifeDirection,
    energyPatterns,
    behavioralPatterns,
    focusPlans,
    activeFocusPlan,
    dailyMinimums,
  };
};
