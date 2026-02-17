/**
 * QuestRunnerPage — Renders a single pillar quest via FlowRenderer
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFlowSpec } from '@/lib/flow/flowSpec';
import { PILLAR_QUESTS } from '@/flows/pillarSpecs';
import { FlowRenderer } from '@/components/flow/FlowRenderer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback, useState, useRef } from 'react';
import { toast } from 'sonner';
import type { FlowAnswers } from '@/lib/flow/types';

export default function QuestRunnerPage() {
  const { pillar } = useParams<{ pillar: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const pillarMeta = PILLAR_QUESTS.find(p => p.id === pillar);
  const spec = pillar ? getFlowSpec(`quest-${pillar}`) : undefined;

  // Load existing quest answers
  const { data: savedAnswers, isLoading } = useQuery({
    queryKey: ['quest-answers', pillar, user?.id],
    queryFn: async () => {
      if (!user || !pillar) return null;
      const { data } = await supabase
        .from('launchpad_progress')
        .select('step_2_profile_data')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const profileData = data?.step_2_profile_data as Record<string, unknown> | null;
      const quests = profileData?.pillar_quests as Record<string, { answers?: Record<string, unknown> }> | undefined;
      return quests?.[pillar]?.answers ?? null;
    },
    enabled: !!user && !!pillar,
  });

  // Save mutation — merges into step_2_profile_data.pillar_quests[pillar]
  const saveMutation = useMutation({
    mutationFn: async ({ answers, completed }: { answers: Record<string, unknown>; completed?: boolean }) => {
      if (!user || !pillar) return;
      
      // Read current profile data
      const { data: current } = await supabase
        .from('launchpad_progress')
        .select('step_2_profile_data')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const profileData = (current?.step_2_profile_data as Record<string, unknown>) ?? {};
      const existingQuests = (profileData.pillar_quests as Record<string, unknown>) ?? {};
      const existingPillar = (existingQuests[pillar] as Record<string, unknown>) ?? {};

      const updatedPillar = {
        ...existingPillar,
        answers,
        ...(completed ? { completed: true, completedAt: new Date().toISOString() } : {}),
      };

      const updatedProfileData = {
        ...profileData,
        pillar_quests: {
          ...existingQuests,
          [pillar]: updatedPillar,
        },
      } as Record<string, unknown>;

      const { error } = await supabase
        .from('launchpad_progress')
        .update({ step_2_profile_data: updatedProfileData as unknown as import('@/integrations/supabase/types').Json })
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
  });

  // Award XP on completion
  const awardXP = useCallback(async () => {
    if (!user) return;
    try {
      await supabase.rpc('award_unified_xp', {
        p_user_id: user.id,
        p_amount: 50,
        p_source: 'quest_complete',
      } as any);
    } catch {
      // XP award is non-critical
    }
  }, [user, pillar]);

  const handleAutoSave = useCallback((data: Record<string, unknown>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveMutation.mutate({ answers: data });
    }, 800);
  }, [saveMutation]);

  const handleComplete = useCallback(async (data: Record<string, unknown>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    try {
      await saveMutation.mutateAsync({ answers: data, completed: true });
      await awardXP();
      queryClient.invalidateQueries({ queryKey: ['pillar-quests'] });
      toast.success(language === 'he' ? 'משימה הושלמה! +50 XP' : 'Quest completed! +50 XP');
      navigate('/quests');
    } catch {
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Error saving');
    }
  }, [saveMutation, awardXP, queryClient, navigate, language]);

  if (!pillarMeta || !spec) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Quest not found</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const stepSpec = spec.steps[0];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/quests')}
          >
            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{pillarMeta.icon}</span>
            <h1 className="text-xl font-bold">
              {language === 'he' ? pillarMeta.title_he : pillarMeta.title_en}
            </h1>
          </div>
        </div>

        {/* FlowRenderer */}
        <FlowRenderer
          step={stepSpec}
          stepNumber={1}
          totalSteps={1}
          savedAnswers={savedAnswers as Record<string, unknown> | undefined}
          onAutoSave={handleAutoSave}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
