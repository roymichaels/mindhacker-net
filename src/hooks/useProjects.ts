import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from './useTranslation';

export interface UserProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  vision: string | null;
  why_it_matters: string | null;
  desired_outcome: string | null;
  timeline: string | null;
  key_milestones: any[];
  resources_needed: string | null;
  potential_blockers: string | null;
  linked_life_areas: string[];
  progress_percentage: number;
  linked_goal_ids: string[];
  linked_checklist_ids: string[];
  tags: string[];
  cover_color: string;
  target_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectInsert = Omit<UserProject, 'id' | 'created_at' | 'updated_at'>;

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { language } = useTranslation();

  const projectsQuery = useQuery({
    queryKey: ['user-projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as UserProject[];
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async (project: Partial<ProjectInsert>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('user_projects')
        .insert({ ...project, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as UserProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      toast.success(language === 'he' ? 'פרויקט נוצר בהצלחה!' : 'Project created successfully!');
    },
    onError: () => {
      toast.error(language === 'he' ? 'שגיאה ביצירת הפרויקט' : 'Error creating project');
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ProjectInsert>) => {
      const { data, error } = await supabase
        .from('user_projects')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as UserProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      toast.success(language === 'he' ? 'הפרויקט נמחק' : 'Project deleted');
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    createProject,
    updateProject,
    deleteProject,
  };
}
