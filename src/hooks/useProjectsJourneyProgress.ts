import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const PROJECTS_JOURNEY_STEPS = [
  { id: 1, title: 'חזון ניהול פרויקטים', titleEn: 'Project Management Vision', subtitle: 'איך תרצה לארגן?', subtitleEn: 'How do you want to organize?', icon: '🗺️' },
  { id: 2, title: 'פרויקט ראשון', titleEn: 'First Project', subtitle: 'הקמת הפרויקט הראשון', subtitleEn: 'Set up your first project', icon: '🏗️' },
  { id: 3, title: 'יישור מטרות', titleEn: 'Goals Alignment', subtitle: 'חיבור לתוכנית 90 יום', subtitleEn: 'Map to 90-day goals', icon: '🎯' },
  { id: 4, title: 'פירוק משימות', titleEn: 'Task Breakdown', subtitle: 'מפרויקט למשימות', subtitleEn: 'Decompose into tasks', icon: '📋' },
  { id: 5, title: 'אבני דרך', titleEn: 'Milestones & Timeline', subtitle: 'ציוני דרך ולוחות זמנים', subtitleEn: 'Key milestones & deadlines', icon: '🏆' },
  { id: 6, title: 'שיתוף פעולה', titleEn: 'Collaboration', subtitle: 'בעלי עניין ומשאבים', subtitleEn: 'Stakeholders & resources', icon: '🤝' },
  { id: 7, title: 'מעקב התקדמות', titleEn: 'Progress Tracking', subtitle: 'קצב סקירה ומדדים', subtitleEn: 'Review cadence & metrics', icon: '📊' },
  { id: 8, title: 'אינטגרציית אורורה', titleEn: 'Aurora Integration', subtitle: 'אימון AI לפרויקטים', subtitleEn: 'AI coaching for projects', icon: '🤖' },
];

export const PROJECTS_JOURNEY_PHASES = [
  { id: 1, title: 'יסודות', titleEn: 'Foundation', icon: '🏗️', steps: [1, 2, 3] },
  { id: 2, title: 'ביצוע', titleEn: 'Execution', icon: '⚡', steps: [4, 5, 6] },
  { id: 3, title: 'מומחיות', titleEn: 'Mastery', icon: '🌟', steps: [7, 8] },
];

interface ProjectsJourneyData {
  id: string;
  user_id: string;
  current_step: number;
  journey_complete: boolean;
  step_1_vision: Record<string, unknown>;
  step_2_first_project: Record<string, unknown>;
  step_3_goals: Record<string, unknown>;
  step_4_tasks: Record<string, unknown>;
  step_5_milestones: Record<string, unknown>;
  step_6_collaboration: Record<string, unknown>;
  step_7_tracking: Record<string, unknown>;
  step_8_aurora: Record<string, unknown>;
  ai_summary: string | null;
}

function getStepDataKey(step: number): string {
  const keys: Record<number, string> = {
    1: 'vision', 2: 'first_project', 3: 'goals', 4: 'tasks',
    5: 'milestones', 6: 'collaboration', 7: 'tracking', 8: 'aurora',
  };
  return keys[step] || 'unknown';
}

export function useProjectsJourneyProgress(journeyId?: string) {
  const { user } = useAuth();
  const [journeyData, setJourneyData] = useState<ProjectsJourneyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const currentStep = journeyData?.current_step ?? 1;
  const isJourneyComplete = journeyData?.journey_complete ?? false;
  const totalSteps = 8;

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const fetchOrCreate = async () => {
      try {
        if (journeyId) {
          const { data, error } = await supabase
            .from('projects_journeys')
            .select('*')
            .eq('id', journeyId)
            .eq('user_id', user.id)
            .maybeSingle();
          if (error) throw error;
          if (data) { setJourneyData(data as unknown as ProjectsJourneyData); }
          else {
            const { data: created, error: e2 } = await supabase
              .from('projects_journeys').insert({ user_id: user.id }).select().single();
            if (e2) throw e2;
            setJourneyData(created as unknown as ProjectsJourneyData);
          }
        } else {
          const { data: created, error } = await supabase
            .from('projects_journeys').insert({ user_id: user.id }).select().single();
          if (error) throw error;
          setJourneyData(created as unknown as ProjectsJourneyData);
        }
      } catch (err) {
        console.error('Projects journey error:', err);
        toast.error('שגיאה בטעינת מסע הפרויקטים');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrCreate();
  }, [user, journeyId]);

  const completeStep = useCallback(async ({ step, data }: { step: number; data?: Record<string, unknown> }) => {
    if (!user || !journeyData) return;
    setIsCompleting(true);
    try {
      const nextStep = Math.min(step + 1, totalSteps + 1);
      const isComplete = step === totalSteps;
      const updateData: Record<string, unknown> = {
        current_step: nextStep, journey_complete: isComplete, updated_at: new Date().toISOString(),
      };
      if (data && step <= 8) {
        updateData[`step_${step}_${getStepDataKey(step)}`] = data;
      }
      const { error } = await supabase.from('projects_journeys').update(updateData).eq('id', journeyData.id);
      if (error) throw error;
      setJourneyData(prev => prev ? { ...prev, current_step: nextStep, journey_complete: isComplete, [`step_${step}_${getStepDataKey(step)}`]: data || {} } as ProjectsJourneyData : null);
    } catch (err) {
      console.error('Error completing step:', err);
      toast.error('שגיאה בשמירת השלב');
    } finally {
      setIsCompleting(false);
    }
  }, [user, journeyData, totalSteps]);

  const saveStepData = useCallback(async (step: number, data: Record<string, unknown>) => {
    if (!user || !journeyData) return;
    try {
      const dataKey = `step_${step}_${getStepDataKey(step)}`;
      await supabase.from('projects_journeys').update({ [dataKey]: data, updated_at: new Date().toISOString() }).eq('id', journeyData.id);
      setJourneyData(prev => prev ? { ...prev, [dataKey]: data } as ProjectsJourneyData : null);
    } catch (err) { console.error('Error saving step data:', err); }
  }, [user, journeyData]);

  const getStepData = useCallback((step: number): Record<string, unknown> | null => {
    if (!journeyData) return null;
    const key = `step_${step}_${getStepDataKey(step)}` as keyof ProjectsJourneyData;
    return (journeyData[key] as Record<string, unknown>) || null;
  }, [journeyData]);

  const resetJourney = useCallback(async () => {
    if (!user || !journeyData) return;
    setIsResetting(true);
    try {
      await supabase.from('projects_journeys').update({
        current_step: 1, journey_complete: false,
        step_1_vision: {}, step_2_first_project: {}, step_3_goals: {}, step_4_tasks: {},
        step_5_milestones: {}, step_6_collaboration: {}, step_7_tracking: {}, step_8_aurora: {},
        ai_summary: null, updated_at: new Date().toISOString(),
      }).eq('id', journeyData.id);
      setJourneyData(prev => prev ? { ...prev, current_step: 1, journey_complete: false, step_1_vision: {}, step_2_first_project: {}, step_3_goals: {}, step_4_tasks: {}, step_5_milestones: {}, step_6_collaboration: {}, step_7_tracking: {}, step_8_aurora: {}, ai_summary: null } : null);
      toast.success('המסע אופס בהצלחה');
    } catch (err) {
      console.error('Error resetting:', err);
      toast.error('שגיאה באיפוס המסע');
    } finally { setIsResetting(false); }
  }, [user, journeyData]);

  const getStepRewards = useCallback((step: number) => ({ xp: 25, tokens: step === totalSteps ? 10 : 0 }), [totalSteps]);

  return { journeyData, currentStep, isJourneyComplete, isLoading, isCompleting, isResetting, totalSteps, completeStep, saveStepData, getStepData, resetJourney, getStepRewards };
}
