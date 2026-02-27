/**
 * useUserJob — SSOT hook for the user's current job assignment.
 * 
 * SSOT: Current job = user_jobs WHERE is_primary = true
 * orb_profiles.computed_from is informational only.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Job {
  id: string;
  name: string;
  name_he: string | null;
  description: string | null;
  description_he: string | null;
  icon: string;
  role_tags: string[];
}

export interface UserJob {
  id: string;
  user_id: string;
  job_id: string;
  assigned_by: 'ai' | 'user' | 'coach' | 'admin';
  is_primary: boolean;
  assigned_at: string;
  metadata: Record<string, unknown>;
  jobs: Job;
}

export function useUserJob() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: currentJob, isLoading } = useQuery({
    queryKey: ['user-job', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_jobs')
        .select('*, jobs(*)')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as UserJob | null;
    },
    enabled: !!user?.id,
  });

  const { data: jobHistory } = useQuery({
    queryKey: ['user-job-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_jobs')
        .select('*, jobs(*)')
        .eq('user_id', user.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as UserJob[];
    },
    enabled: !!user?.id,
  });

  const { data: allJobs } = useQuery({
    queryKey: ['jobs-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return (data || []) as Job[];
    },
  });

  const assignJob = useMutation({
    mutationFn: async ({ jobName, assignedBy = 'user', metadata = {} }: {
      jobName: string;
      assignedBy?: 'ai' | 'user' | 'coach' | 'admin';
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase.rpc('assign_user_job', {
        p_user_id: user!.id,
        p_job_name: jobName,
        p_assigned_by: assignedBy,
        p_metadata: metadata as any,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-job', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-job-history', user?.id] });
    },
  });

  return {
    currentJob,
    jobHistory: jobHistory || [],
    allJobs: allJobs || [],
    isLoading,
    assignJob,
    jobName: currentJob?.jobs?.name || null,
    jobNameHe: currentJob?.jobs?.name_he || null,
    jobIcon: currentJob?.jobs?.icon || '🎯',
    jobDescription: currentJob?.jobs?.description || null,
    jobDescriptionHe: currentJob?.jobs?.description_he || null,
  };
}
