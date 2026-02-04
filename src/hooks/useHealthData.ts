import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLaunchpadData } from '@/hooks/useLaunchpadData';

export interface HealthData {
  healthScore: number;
  energyLevel: 'high' | 'medium' | 'low' | 'varies' | null;
  sleepQuality: 'excellent' | 'good' | 'moderate' | 'poor' | null;
  activityLevel: 'daily' | 'weekly' | 'rarely' | 'none' | null;
  hydrationStatus: string | null;
  stressLevel: 'low' | 'moderate' | 'high' | null;
  pendingHealthMissions: number;
  completedHealthMissions: number;
  healthStreak: number;
  lastHealthHypnosis: Date | null;
  lastHealthCheckIn: Date | null;
  recommendations: string[];
  trend: 'improving' | 'stable' | 'declining' | null;
}

// Score mapping for calculating health index
const energyScores: Record<string, number> = { high: 100, medium: 70, low: 40, varies: 55 };
const sleepScores: Record<string, number> = { 'more_than_8': 90, '7_to_8': 100, '6_to_7': 75, '5_to_6': 50, 'less_than_5': 25 };
const activityScores: Record<string, number> = { daily: 100, few_times_week: 80, once_week: 50, rarely: 25, none: 0 };
const hydrationScores: Record<string, number> = { excellent: 100, good: 80, moderate: 50, poor: 25 };

export function useHealthData() {
  const { user } = useAuth();
  const { data: launchpadData, isLoading: launchpadLoading } = useLaunchpadData();

  // Fetch health-specific data from aurora tables
  const { data: healthMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['health-metrics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch health missions
      const { data: healthMissions } = await supabase
        .from('aurora_checklists')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('category', 'health')
        .eq('status', 'active');

      // Fetch completed health missions
      const { data: completedMissions } = await supabase
        .from('aurora_checklists')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', 'health')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch energy patterns
      const { data: energyPatterns } = await supabase
        .from('aurora_energy_patterns')
        .select('pattern_type, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch health hypnosis sessions - use RPC or raw query to avoid TS issues
      let lastHealthHypnosisDate: string | null = null;
      try {
        const { data: hypnosisData } = await supabase
          .from('hypnosis_sessions')
          .select('created_at')
          .eq('user_id', user.id)
          .limit(1);
        if (hypnosisData && hypnosisData.length > 0) {
          lastHealthHypnosisDate = hypnosisData[0].created_at;
        }
      } catch (e) {
        console.log('Could not fetch hypnosis sessions');
      }

      // Fetch habit logs
      const { data: habitLogs } = await supabase
        .from('daily_habit_logs')
        .select('track_date, is_completed')
        .eq('user_id', user.id)
        .gte('track_date', weekAgo)
        .eq('is_completed', true) as { data: Array<{ track_date: string; is_completed: boolean }> | null };

      // Calculate streak from habit logs
      let streak = 0;
      if (habitLogs && habitLogs.length > 0) {
        const sortedDates = [...new Set(habitLogs.map(l => l.track_date))].sort().reverse();
        for (let i = 0; i < sortedDates.length; i++) {
          const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          if (sortedDates.includes(expectedDate)) {
            streak++;
          } else {
            break;
          }
        }
      }

      // Count pending missions (simplified - just count active missions)
      const pendingCount = healthMissions?.length || 0;

      return {
        pendingHealthMissions: pendingCount,
        completedHealthMissions: completedMissions?.length || 0,
        healthStreak: streak,
        lastHealthHypnosis: lastHealthHypnosisDate ? new Date(lastHealthHypnosisDate) : null,
        energyPatterns: energyPatterns || [],
      };
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
  });

  const healthData = useMemo<HealthData>(() => {
    const profileData = launchpadData?.personalProfile || {};
    
    const energyLevel = (profileData.energy_level as string) || null;
    const sleepHours = (profileData.sleep_hours as string) || null;
    const activityFrequency = (profileData.activity_frequency as string) || null;
    const hydration = (profileData.hydration as string) || null;
    const stressLevel = (profileData.stress_level as string) || null;

    // Calculate composite health score (0-100)
    const scores: number[] = [];
    if (energyLevel && energyScores[energyLevel]) scores.push(energyScores[energyLevel]);
    if (sleepHours && sleepScores[sleepHours]) scores.push(sleepScores[sleepHours]);
    if (activityFrequency && activityScores[activityFrequency]) scores.push(activityScores[activityFrequency]);
    if (hydration && hydrationScores[hydration]) scores.push(hydrationScores[hydration]);

    const healthScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Generate recommendations based on data
    const recommendations: string[] = [];
    if (energyLevel === 'low' || energyLevel === 'varies') {
      recommendations.push('energy_boost');
    }
    if (sleepHours === 'less_than_5' || sleepHours === '5_to_6') {
      recommendations.push('improve_sleep');
    }
    if (activityFrequency === 'rarely' || activityFrequency === 'none') {
      recommendations.push('increase_activity');
    }
    if (hydration === 'poor' || hydration === 'moderate') {
      recommendations.push('hydrate_more');
    }
    if (healthMetrics?.pendingHealthMissions && healthMetrics.pendingHealthMissions > 0) {
      recommendations.push('complete_missions');
    }

    // Determine trend based on streak
    let trend: 'improving' | 'stable' | 'declining' | null = null;
    if (healthMetrics?.healthStreak) {
      if (healthMetrics.healthStreak >= 5) trend = 'improving';
      else if (healthMetrics.healthStreak >= 2) trend = 'stable';
      else trend = 'declining';
    }

    return {
      healthScore,
      energyLevel: energyLevel as HealthData['energyLevel'],
      sleepQuality: mapSleepToQuality(sleepHours),
      activityLevel: mapActivityToLevel(activityFrequency),
      hydrationStatus: hydration,
      stressLevel: stressLevel as HealthData['stressLevel'],
      pendingHealthMissions: healthMetrics?.pendingHealthMissions || 0,
      completedHealthMissions: healthMetrics?.completedHealthMissions || 0,
      healthStreak: healthMetrics?.healthStreak || 0,
      lastHealthHypnosis: healthMetrics?.lastHealthHypnosis || null,
      lastHealthCheckIn: null,
      recommendations,
      trend,
    };
  }, [launchpadData, healthMetrics]);

  return {
    healthData,
    isLoading: launchpadLoading || metricsLoading,
    hasData: healthData.healthScore > 0,
  };
}

function mapSleepToQuality(sleepHours: string | null): HealthData['sleepQuality'] {
  if (!sleepHours) return null;
  if (sleepHours === '7_to_8' || sleepHours === 'more_than_8') return 'excellent';
  if (sleepHours === '6_to_7') return 'good';
  if (sleepHours === '5_to_6') return 'moderate';
  return 'poor';
}

function mapActivityToLevel(activity: string | null): HealthData['activityLevel'] {
  if (!activity) return null;
  if (activity === 'daily') return 'daily';
  if (activity === 'few_times_week' || activity === 'once_week') return 'weekly';
  if (activity === 'rarely') return 'rarely';
  return 'none';
}
