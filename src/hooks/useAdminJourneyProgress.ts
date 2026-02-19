import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const ADMIN_JOURNEY_STEPS = [
  { id: 1, title: 'חזון הפלטפורמה', titleEn: 'Platform Vision', subtitle: 'מטרה וקהל יעד', subtitleEn: 'Purpose and audience', icon: '🎯' },
  { id: 2, title: 'צוות ותפקידים', titleEn: 'Team & Roles', subtitle: 'הגדרת הרשאות', subtitleEn: 'Set up permissions', icon: '👥' },
  { id: 3, title: 'מיתוג ועיצוב', titleEn: 'Branding & Theme', subtitle: 'צבעים, לוגו, זהות', subtitleEn: 'Colors, logo, identity', icon: '🎨' },
  { id: 4, title: 'קטלוג מוצרים', titleEn: 'Product Catalog', subtitle: 'הקמת מוצרים ושירותים', subtitleEn: 'Set up products & services', icon: '🛍️' },
  { id: 5, title: 'אסטרטגיית תוכן', titleEn: 'Content Strategy', subtitle: 'סוגי תוכן ותכנון', subtitleEn: 'Content types & planning', icon: '📝' },
  { id: 6, title: 'דפי נחיתה', titleEn: 'Landing Pages', subtitle: 'עמודים מרכזיים', subtitleEn: 'Key pages setup', icon: '🌐' },
  { id: 7, title: 'שיווק', titleEn: 'Marketing Setup', subtitle: 'קמפיינים ושותפים', subtitleEn: 'Campaigns & affiliates', icon: '📣' },
  { id: 8, title: 'תפעול', titleEn: 'Operations', subtitle: 'התראות, אנליטיקס, הגדרות', subtitleEn: 'Notifications, analytics, settings', icon: '⚙️' },
];

export const ADMIN_JOURNEY_PHASES = [
  { id: 1, title: 'יסודות הפלטפורמה', titleEn: 'Platform Basics', icon: '🏗️', steps: [1, 2, 3] },
  { id: 2, title: 'תוכן ומוצרים', titleEn: 'Content & Products', icon: '📦', steps: [4, 5, 6] },
  { id: 3, title: 'צמיחה ותפעול', titleEn: 'Growth & Operations', icon: '🚀', steps: [7, 8] },
];

interface AdminJourneyData {
  id: string;
  user_id: string;
  current_step: number;
  journey_complete: boolean;
  step_1_vision: Record<string, unknown>;
  step_2_team: Record<string, unknown>;
  step_3_branding: Record<string, unknown>;
  step_4_products: Record<string, unknown>;
  step_5_content: Record<string, unknown>;
  step_6_landing: Record<string, unknown>;
  step_7_marketing: Record<string, unknown>;
  step_8_operations: Record<string, unknown>;
  ai_summary: string | null;
}

function getStepDataKey(step: number): string {
  const keys: Record<number, string> = {
    1: 'vision', 2: 'team', 3: 'branding', 4: 'products',
    5: 'content', 6: 'landing', 7: 'marketing', 8: 'operations',
  };
  return keys[step] || 'unknown';
}

export function useAdminJourneyProgress(journeyId?: string) {
  const { user } = useAuth();
  const [journeyData, setJourneyData] = useState<AdminJourneyData | null>(null);
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
            .from('admin_journeys')
            .select('*')
            .eq('id', journeyId)
            .eq('user_id', user.id)
            .maybeSingle();
          if (error) throw error;
          if (data) { setJourneyData(data as unknown as AdminJourneyData); }
          else {
            const { data: created, error: e2 } = await supabase
              .from('admin_journeys').insert({ user_id: user.id }).select().single();
            if (e2) throw e2;
            setJourneyData(created as unknown as AdminJourneyData);
          }
        } else {
          const { data: created, error } = await supabase
            .from('admin_journeys').insert({ user_id: user.id }).select().single();
          if (error) throw error;
          setJourneyData(created as unknown as AdminJourneyData);
        }
      } catch (err) {
        console.error('Admin journey error:', err);
        toast.error('שגיאה בטעינת מסע הניהול');
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
      const { error } = await supabase.from('admin_journeys').update(updateData).eq('id', journeyData.id);
      if (error) throw error;
      setJourneyData(prev => prev ? { ...prev, current_step: nextStep, journey_complete: isComplete, [`step_${step}_${getStepDataKey(step)}`]: data || {} } as AdminJourneyData : null);
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
      await supabase.from('admin_journeys').update({ [dataKey]: data, updated_at: new Date().toISOString() }).eq('id', journeyData.id);
      setJourneyData(prev => prev ? { ...prev, [dataKey]: data } as AdminJourneyData : null);
    } catch (err) { console.error('Error saving step data:', err); }
  }, [user, journeyData]);

  const getStepData = useCallback((step: number): Record<string, unknown> | null => {
    if (!journeyData) return null;
    const key = `step_${step}_${getStepDataKey(step)}` as keyof AdminJourneyData;
    return (journeyData[key] as Record<string, unknown>) || null;
  }, [journeyData]);

  const resetJourney = useCallback(async () => {
    if (!user || !journeyData) return;
    setIsResetting(true);
    try {
      await supabase.from('admin_journeys').update({
        current_step: 1, journey_complete: false,
        step_1_vision: {}, step_2_team: {}, step_3_branding: {}, step_4_products: {},
        step_5_content: {}, step_6_landing: {}, step_7_marketing: {}, step_8_operations: {},
        ai_summary: null, updated_at: new Date().toISOString(),
      }).eq('id', journeyData.id);
      setJourneyData(prev => prev ? { ...prev, current_step: 1, journey_complete: false, step_1_vision: {}, step_2_team: {}, step_3_branding: {}, step_4_products: {}, step_5_content: {}, step_6_landing: {}, step_7_marketing: {}, step_8_operations: {}, ai_summary: null } : null);
      toast.success('המסע אופס בהצלחה');
    } catch (err) {
      console.error('Error resetting:', err);
      toast.error('שגיאה באיפוס המסע');
    } finally { setIsResetting(false); }
  }, [user, journeyData]);

  const getStepRewards = useCallback((step: number) => ({ xp: 25, tokens: step === totalSteps ? 10 : 0 }), [totalSteps]);

  return { journeyData, currentStep, isJourneyComplete, isLoading, isCompleting, isResetting, totalSteps, completeStep, saveStepData, getStepData, resetJourney, getStepRewards };
}
