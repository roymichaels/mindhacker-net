/**
 * MissingQuestModal — Pops pillar quest questions inline for users
 * who already completed onboarding but have unanswered quest assessments.
 */
import { useCallback, useRef, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getFlowSpec } from '@/lib/flow/flowSpec';
import { FlowRenderer } from '@/components/flow/FlowRenderer';
import { toast } from 'sonner';
import type { MissingQuest } from '@/hooks/useSmartOnboardingRedirect';
import { cn } from '@/lib/utils';
import '@/flows/pillarSpecs'; // ensure specs are registered

interface MissingQuestModalProps {
  quest: MissingQuest;
  onClose: () => void;
  onDismissAll: () => void;
  remainingCount: number;
}

export function MissingQuestModal({ quest, onClose, onDismissAll, remainingCount }: MissingQuestModalProps) {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const spec = getFlowSpec(`quest-${quest.pillarId}`);

  const saveMutation = useMutation({
    mutationFn: async ({ answers, completed }: { answers: Record<string, unknown>; completed?: boolean }) => {
      if (!user) return;

      const { data: current } = await supabase
        .from('launchpad_progress')
        .select('step_2_profile_data')
        .eq('user_id', user.id)
        .maybeSingle();

      const profileData = (current?.step_2_profile_data as Record<string, unknown>) ?? {};
      const existingQuests = (profileData.pillar_quests as Record<string, unknown>) ?? {};
      const existingPillar = (existingQuests[quest.pillarId] as Record<string, unknown>) ?? {};

      const updatedPillar = {
        ...existingPillar,
        answers,
        ...(completed ? { completed: true, completedAt: new Date().toISOString() } : {}),
      };

      const updatedProfileData = {
        ...profileData,
        pillar_quests: {
          ...existingQuests,
          [quest.pillarId]: updatedPillar,
        },
      };

      const { error } = await supabase
        .from('launchpad_progress')
        .update({ step_2_profile_data: updatedProfileData as any })
        .eq('user_id', user.id);

      if (error) throw error;
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['quest-completion-status'] });
      queryClient.invalidateQueries({ queryKey: ['quest-answers'] });
      toast.success(
        language === 'he'
          ? `${quest.meta.icon} ${quest.meta.title_he} הושלם! +50 XP`
          : `${quest.meta.icon} ${quest.meta.title_en} completed! +50 XP`
      );

      // Award XP
      if (user) {
        try {
          await supabase.rpc('award_unified_xp', {
            p_user_id: user.id,
            p_amount: 50,
            p_source: 'quest_complete',
          } as any);
        } catch { /* non-critical */ }
      }

      onClose();
    } catch {
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Error saving');
    }
  }, [saveMutation, queryClient, quest, language, user, onClose]);

  if (!spec) return null;

  const stepSpec = spec.steps[0];

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-2 border-primary/20 bg-card/98 backdrop-blur-xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{quest.meta.icon}</span>
            <div>
              <h2 className="font-bold text-foreground">
                {language === 'he' ? quest.meta.title_he : quest.meta.title_en}
              </h2>
              <p className="text-xs text-muted-foreground">
                {language === 'he'
                  ? `שאלון חסר • ${remainingCount > 0 ? `עוד ${remainingCount}` : 'אחרון'}`
                  : `Missing assessment • ${remainingCount > 0 ? `${remainingCount} more` : 'last one'}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {remainingCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismissAll}
                className="text-xs text-muted-foreground"
              >
                {language === 'he' ? 'דלג על הכל' : 'Skip all'}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quest flow */}
        <div className="p-4 md:p-6">
          <FlowRenderer
            step={stepSpec}
            stepNumber={1}
            totalSteps={1}
            onAutoSave={handleAutoSave}
            onComplete={handleComplete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
