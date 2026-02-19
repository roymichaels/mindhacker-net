/**
 * RecalibrateModal — Full editable form of ALL onboarding answers.
 * Uses the full onboardingFlowSpec (Neural Intake V3 — 17 steps, ~70 variables).
 * On save, re-runs generate-launchpad-summary to rebuild the entire plan.
 */
import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { MobileTimePicker } from '@/components/ui/mobile-time-picker';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import onboardingFlowSpec from '@/flows/onboardingFlowSpec';
import { getVisibleMiniSteps } from '@/lib/flow/flowSpec';
import { cn } from '@/lib/utils';
import { RefreshCw, Loader2, Sparkles, Check, ChevronDown, ChevronUp, X, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FlowAnswers, MiniStep, FlowStep, FlowOption } from '@/lib/flow/types';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RecalibrateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOTIVATIONAL_MESSAGES_HE = [
  'מחשב מחדש את המסלול שלך...',
  'בונה תוכנית חדשה מותאמת אישית...',
  'מעדכן את אבני הדרך שלך...',
  'מכין את השלב הבא של הצמיחה שלך...',
];
const MOTIVATIONAL_MESSAGES_EN = [
  'Recalculating your trajectory...',
  'Building a personalized new plan...',
  'Updating your milestones...',
  'Preparing your next growth phase...',
];

// Keys that map to step_1_intention
const STEP1_KEYS = new Set([
  'entry_context', 'pressure_zone', 'functional_signals', 'failure_moment',
  'target_90_days', 'urgency_scale', 'restructure_willingness',
  'non_negotiable_constraint', 'final_notes',
]);

// Phase groupings for collapsible sections
const PHASE_GROUPS = [
  { id: 'entry', labelHe: 'הקשר כניסה', labelEn: 'Entry Context', stepIds: [0] },
  { id: 'diagnosis', labelHe: 'אבחון מצב', labelEn: 'State Diagnosis', stepIds: [1, 2, 3] },
  { id: 'biological', labelHe: 'בסיס ביולוגי', labelEn: 'Biological Baseline', stepIds: [4, 5, 6, 7, 8] },
  { id: 'time', labelHe: 'ארכיטקטורת זמן', labelEn: 'Time Architecture', stepIds: [9, 10] },
  { id: 'psychological', labelHe: 'מערכת הפעלה פסיכולוגית', labelEn: 'Psychological OS', stepIds: [11, 12, 13] },
  { id: 'target', labelHe: 'יעד + מחויבות', labelEn: 'Target + Commitment', stepIds: [14, 15, 16] },
];

export function RecalibrateModal({ open, onOpenChange }: RecalibrateModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { language } = useTranslation();
  const isHe = language === 'he';

  const CACHE_KEY = `recalibrate_answers_${user?.id}`;

  const [answers, setAnswers] = useState<FlowAnswers>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [motivationalIdx, setMotivationalIdx] = useState(0);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());

  // Cycle motivational messages while submitting
  useEffect(() => {
    if (!submitting) return;
    const interval = setInterval(() => {
      setMotivationalIdx(prev => (prev + 1) % MOTIVATIONAL_MESSAGES_HE.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [submitting]);

  // Load current answers from ALL available data sources on open
  useEffect(() => {
    if (!open || !user?.id) return;
    setLoading(true);
    (async () => {
      try {
        // 1. Load launchpad_progress (all relevant columns)
        const { data: launchpad } = await supabase
          .from('launchpad_progress')
          .select('step_1_intention, step_2_profile_data, step_3_lifestyle_data, step_10_final_notes')
          .eq('user_id', user.id)
          .maybeSingle();

        // 2. Load aurora data for enrichment
        const [
          { data: energyPatterns },
          { data: behavioralPatterns },
          { data: lifeDirection },
          { data: identityElements },
          { data: commitments },
        ] = await Promise.all([
          supabase.from('aurora_energy_patterns').select('pattern_type, description').eq('user_id', user.id),
          supabase.from('aurora_behavioral_patterns').select('pattern_type, description').eq('user_id', user.id),
          supabase.from('aurora_life_direction').select('content, clarity_score').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('aurora_identity_elements').select('element_type, content').eq('user_id', user.id),
          supabase.from('aurora_commitments').select('title, description').eq('user_id', user.id).eq('status', 'active'),
        ]);

        const flat: FlowAnswers = {};

        // Helper to parse JSON columns
        const parseJson = (val: unknown): Record<string, unknown> => {
          if (!val) return {};
          if (typeof val === 'string') {
            try { return JSON.parse(val); } catch { return {}; }
          }
          return val as Record<string, unknown>;
        };

        // Merge step_1_intention
        const step1 = parseJson(launchpad?.step_1_intention);
        for (const [k, v] of Object.entries(step1)) {
          if (v !== undefined && v !== null) flat[k] = v as string | string[] | number;
        }

        // Merge step_2_profile_data
        const step2 = parseJson(launchpad?.step_2_profile_data);
        for (const [k, v] of Object.entries(step2)) {
          if (v !== undefined && v !== null) flat[k] = v as string | string[] | number;
        }

        // Merge step_3_lifestyle_data (sleep, work patterns, etc.)
        const step3 = parseJson(launchpad?.step_3_lifestyle_data);
        for (const [k, v] of Object.entries(step3)) {
          if (v !== undefined && v !== null && !flat[k]) flat[k] = v as string | string[] | number;
        }

        // Merge step_10_final_notes
        if (launchpad?.step_10_final_notes && !flat['final_notes']) {
          flat['final_notes'] = launchpad.step_10_final_notes as string;
        }

        // Legacy key mappings (old flow → new flow)
        const LEGACY_MAP: Record<string, string> = {
          'friction_type': 'pressure_zone',
          'specific_tension': 'functional_signals',
          'desired_shift': 'target_90_days',
          'commitment_level': 'restructure_willingness',
          'age_range': 'age_bracket',
          'work_structure': 'current_work',
        };
        for (const [oldKey, newKey] of Object.entries(LEGACY_MAP)) {
          if (flat[oldKey] && !flat[newKey]) {
            flat[newKey] = flat[oldKey];
          }
        }

        // Enrich from aurora data (only fill gaps, don't override existing answers)
        // Map energy patterns to relevant questions
        if (energyPatterns?.length && !flat['energy_description']) {
          const sleepPattern = energyPatterns.find(p => p.pattern_type === 'sleep');
          const stressPattern = energyPatterns.find(p => p.pattern_type === 'stress');
          if (sleepPattern && !flat['sleep_issues']) flat['sleep_issues'] = sleepPattern.description;
          if (stressPattern && !flat['stress_description']) flat['stress_description'] = stressPattern.description;
        }

        // Map life direction to final notes if empty
        if (lifeDirection?.content && !flat['final_notes']) {
          flat['final_notes'] = lifeDirection.content;
        }

        // Map commitments context
        if (commitments?.length && !flat['non_negotiable_constraint']) {
          flat['non_negotiable_constraint'] = commitments.map(c => c.title).join(', ');
        }

        // Merge cached answers on top (user's unsaved clicks take priority)
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            const cachedAnswers = JSON.parse(cached);
            for (const [k, v] of Object.entries(cachedAnswers)) {
              if (v !== undefined && v !== null) flat[k] = v as string | string[] | number;
            }
          }
        } catch { /* ignore parse errors */ }

        setAnswers(flat);
      } catch (e) {
        console.error('Failed to load answers:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, user?.id]);

  // Get all card steps (exclude custom renderers)
  const questionSteps = useMemo(
    () => onboardingFlowSpec.steps.filter(s => s.renderer === 'card'),
    []
  );

  // Persist answers to localStorage immediately on every change
  const saveToCache = (updated: FlowAnswers) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    } catch { /* quota exceeded — silently ignore */ }
  };

  const setAnswer = (key: string, value: string | string[] | number) => {
    setAnswers(prev => {
      const next = { ...prev, [key]: value };
      saveToCache(next);
      return next;
    });
  };

  const toggleMultiSelect = (key: string, value: string, maxSelected?: number) => {
    setAnswers(prev => {
      const current = (prev[key] as string[]) || [];
      let next: FlowAnswers;
      if (current.includes(value)) {
        next = { ...prev, [key]: current.filter(v => v !== value) };
      } else {
        if (maxSelected && current.length >= maxSelected) return prev;
        next = { ...prev, [key]: [...current, value] };
      }
      saveToCache(next);
      return next;
    });
  };

  const togglePhase = (phaseId: string) => {
    setCollapsedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    setMotivationalIdx(0);

    try {
      // Split answers into step_1 and step_2 data
      const step1Data: Record<string, unknown> = {};
      const step2Data: Record<string, unknown> = {};

      for (const [k, v] of Object.entries(answers)) {
        if (v === undefined || v === null) continue;
        if (STEP1_KEYS.has(k)) {
          step1Data[k] = v;
        } else {
          step2Data[k] = v;
        }
      }

      // Add pillar mapping from pressure_zone
      if (answers.pressure_zone) {
        const { FRICTION_PILLAR_MAP } = await import('@/flows/onboardingFlowSpec');
        step1Data.selected_pillar = FRICTION_PILLAR_MAP[answers.pressure_zone as string] || 'mind';
      }

      // 1. Save updated answers
      const { error: updateErr } = await supabase
        .from('launchpad_progress')
        .update({
          step_1_intention: step1Data as any,
          step_2_profile_data: step2Data as any,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateErr) throw updateErr;

      // 2. Clear identity elements (they'll be regenerated)
      await supabase
        .from('aurora_identity_elements')
        .delete()
        .eq('user_id', user.id);

      // 3. Get old life plan IDs, then delete all related data
      const { data: oldPlans } = await supabase
        .from('life_plans')
        .select('id')
        .eq('user_id', user.id);

      const oldPlanIds = (oldPlans || []).map(p => p.id);

      if (oldPlanIds.length > 0) {
        // Delete milestones for old plans
        await supabase
          .from('life_plan_milestones')
          .delete()
          .in('plan_id', oldPlanIds);

        // Delete the old life plans themselves
        await supabase
          .from('life_plans')
          .delete()
          .in('id', oldPlanIds);
      }

      // Delete ALL plan-sourced action items (milestones, habits, tasks from plan)
      await supabase
        .from('action_items')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'plan');

      // Also delete aurora-generated checklists & action items
      await supabase
        .from('aurora_checklists')
        .delete()
        .eq('user_id', user.id)
        .eq('origin', 'plan');

      await supabase
        .from('action_items')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'aurora');

      // Also delete old launchpad summaries
      await supabase
        .from('launchpad_summaries')
        .delete()
        .eq('user_id', user.id);

      // 3. Call generate-launchpad-summary edge function
      const { data: { session } } = await supabase.auth.getSession();
      const { error: fnErr } = await supabase.functions.invoke('generate-launchpad-summary', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: { userId: user.id, regenerate: true },
      });

      if (fnErr) throw fnErr;

      // 4. Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['life-plan'] }),
        queryClient.invalidateQueries({ queryKey: ['milestones'] }),
        queryClient.invalidateQueries({ queryKey: ['launchpad-data'] }),
        queryClient.invalidateQueries({ queryKey: ['launchpad-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['current-week-milestone'] }),
        queryClient.invalidateQueries({ queryKey: ['unified-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['life-plan-milestones'] }),
        queryClient.invalidateQueries({ queryKey: ['daily-roadmap'] }),
        queryClient.invalidateQueries({ queryKey: ['action-items'] }),
      ]);

      // Clear cache on success
      try { localStorage.removeItem(CACHE_KEY); } catch {}

      toast.success(isHe ? '✨ התוכנית שלך חושבה מחדש בהצלחה!' : '✨ Your plan has been recalculated!');
      onOpenChange(false);
    } catch (e) {
      console.error('Recalibration failed:', e);
      toast.error(isHe ? 'שגיאה בחישוב מחדש, נסה שוב' : 'Recalculation failed, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const messages = isHe ? MOTIVATIONAL_MESSAGES_HE : MOTIVATIONAL_MESSAGES_EN;

  // Count answered questions
  const totalQuestions = questionSteps.reduce((sum, step) => {
    const visible = getVisibleMiniSteps(step, answers);
    return sum + (visible.length > 0 ? visible.length : step.miniSteps.filter(m => !m.branching).length);
  }, 0);
  
  const answeredCount = questionSteps.reduce((sum, step) => {
    const visible = getVisibleMiniSteps(step, answers);
    const minis = visible.length > 0 ? visible : step.miniSteps.filter(m => !m.branching);
    return sum + minis.filter(m => {
      const a = answers[m.id];
      return a !== undefined && a !== null && a !== '' && (!Array.isArray(a) || a.length > 0);
    }).length;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden border-border/50 bg-background/95 backdrop-blur-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <RefreshCw className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">{isHe ? 'כיול מחדש' : 'Recalibrate'}</h2>
              <p className="text-xs text-muted-foreground">
                {isHe 
                  ? `${answeredCount}/${totalQuestions} תשובות • עדכן וחשב מחדש`
                  : `${answeredCount}/${totalQuestions} answered • Update and recalculate`}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        {submitting ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-12 h-12 text-primary" />
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.p
                key={motivationalIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-semibold text-center text-foreground/80"
              >
                {messages[motivationalIdx]}
              </motion.p>
            </AnimatePresence>
            <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 12, ease: 'easeInOut' }}
              />
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-3 pb-28">
              {PHASE_GROUPS.map(phase => {
                const phaseSteps = questionSteps.filter(s => phase.stepIds.includes(s.id));
                if (phaseSteps.length === 0) return null;
                const isCollapsed = collapsedPhases.has(phase.id);

                // Count answered in this phase
                const phaseAnswered = phaseSteps.reduce((sum, step) => {
                  const visible = getVisibleMiniSteps(step, answers);
                  const minis = visible.length > 0 ? visible : step.miniSteps.filter(m => !m.branching);
                  return sum + minis.filter(m => {
                    const a = answers[m.id];
                    return a !== undefined && a !== null && a !== '' && (!Array.isArray(a) || a.length > 0);
                  }).length;
                }, 0);

                const phaseTotal = phaseSteps.reduce((sum, step) => {
                  const visible = getVisibleMiniSteps(step, answers);
                  return sum + (visible.length > 0 ? visible.length : step.miniSteps.filter(m => !m.branching).length);
                }, 0);

                return (
                  <div key={phase.id} className="rounded-2xl border border-border/30 overflow-hidden">
                    {/* Phase header */}
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-card/60 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {isHe ? phase.labelHe : phase.labelEn}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                          {phaseAnswered}/{phaseTotal}
                        </span>
                      </div>
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* Phase content */}
                    {!isCollapsed && (
                      <div className="p-3 space-y-3 bg-background/30">
                        {phaseSteps.map(step => {
                          const visibleMinis = getVisibleMiniSteps(step, answers);
                          const minisToRender = visibleMinis.length > 0
                            ? visibleMinis
                            : step.miniSteps.filter(m => !m.branching).slice(0, 1);

                          if (minisToRender.length === 0) return null;

                          return minisToRender.map(mini => (
                            <QuestionSection
                              key={mini.id + '_' + step.id}
                              mini={mini}
                              answer={answers[mini.id]}
                              isHe={isHe}
                              onSelect={(val) => setAnswer(mini.id, val)}
                              onToggleMulti={(val) => toggleMultiSelect(mini.id, val, mini.validation.maxSelected)}
                              onSliderChange={(val) => setAnswer(mini.id, val)}
                              onTextChange={(val) => setAnswer(mini.id, val)}
                            />
                          ));
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer CTA */}
        {!submitting && !loading && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent border-t border-border/20">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full rounded-2xl py-3.5 text-base font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <RefreshCw className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2" />
              {isHe ? 'חשב מחדש את התוכנית שלי' : 'Recalculate My Plan'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Sortable Rank Item for RecalibrateModal ─── */
function SortableRecalRankItem({ item, index, isHe }: { item: FlowOption; index: number; isHe: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.value });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const label = isHe ? item.label_he : item.label_en;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all select-none min-h-[36px]",
        isDragging
          ? "border-primary bg-primary/15 shadow-lg scale-[1.02]"
          : "border-border/20 bg-background/40 hover:border-primary/40"
      )}
    >
      <span className="text-xs font-bold text-primary/70 min-w-[18px] text-center">{index + 1}</span>
      {item.icon && <span className="text-sm shrink-0">{item.icon}</span>}
      <span className="text-xs leading-tight flex-1 font-medium text-foreground">{label}</span>
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── Individual Question Section ─── */
interface QuestionSectionProps {
  mini: MiniStep;
  answer: string | string[] | number | undefined;
  isHe: boolean;
  onSelect: (value: string) => void;
  onToggleMulti: (value: string) => void;
  onSliderChange: (value: number) => void;
  onTextChange: (value: string) => void;
}

function QuestionSection({ mini, answer, isHe, onSelect, onToggleMulti, onSliderChange, onTextChange }: QuestionSectionProps) {
  const title = isHe ? mini.title_he : mini.title_en;
  const isMulti = mini.inputType === 'multi_select';
  const isTextarea = mini.inputType === 'textarea';
  const isSlider = mini.inputType === 'slider';
  const isPriorityRank = mini.inputType === 'priority_rank';
  const isTimePicker = mini.inputType === 'time_picker';
  const hasAnswer = answer !== undefined && answer !== null && answer !== '' && (!Array.isArray(answer) || answer.length > 0);

  // Priority rank state
  const [rankedItems, setRankedItems] = useState<FlowOption[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  useEffect(() => {
    if (isPriorityRank && mini.options) {
      if (Array.isArray(answer) && answer.length === mini.options.length) {
        const ordered = (answer as string[])
          .map(v => mini.options!.find(o => o.value === v))
          .filter(Boolean) as FlowOption[];
        setRankedItems(ordered);
      } else {
        setRankedItems([...mini.options]);
        onSelect(mini.options.map(o => o.value) as any);
      }
    }
  }, [mini.id]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rankedItems.findIndex(i => i.value === active.id);
    const newIndex = rankedItems.findIndex(i => i.value === over.id);
    const reordered = arrayMove(rankedItems, oldIndex, newIndex);
    setRankedItems(reordered);
    onSelect(reordered.map(i => i.value) as any);
  };

  return (
    <div className={cn(
      "rounded-xl border p-3 space-y-2 transition-colors",
      hasAnswer
        ? "border-primary/20 bg-primary/5"
        : "border-border/20 bg-card/30"
    )}>
      {/* Title */}
      <div className="flex items-center gap-2">
        {hasAnswer && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
        <h4 className="text-xs font-semibold text-foreground/90 leading-tight">{title}</h4>
      </div>

      {/* Slider */}
      {isSlider && (
        <div className="space-y-2 px-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{mini.sliderMin ?? 1}</span>
            <span className="text-lg font-bold text-primary">
              {(answer as number) ?? mini.sliderMin ?? 1}
            </span>
            <span className="text-xs text-muted-foreground">{mini.sliderMax ?? 10}</span>
          </div>
          <Slider
            value={[(answer as number) ?? mini.sliderMin ?? 1]}
            min={mini.sliderMin ?? 1}
            max={mini.sliderMax ?? 10}
            step={mini.sliderStep ?? 1}
            onValueChange={(v) => onSliderChange(v[0])}
          />
        </div>
      )}

      {/* Textarea */}
      {isTextarea && (
        <Textarea
          value={(answer as string) || ''}
          onChange={(e) => onTextChange(e.target.value)}
          className="min-h-[80px] rounded-lg bg-background/60 border-border/30 resize-none text-xs"
          placeholder={isHe ? 'כתוב כאן...' : 'Write here...'}
          dir={isHe ? 'rtl' : 'ltr'}
        />
      )}

      {/* Priority Rank — Drag to reorder */}
      {isPriorityRank && rankedItems.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rankedItems.map(i => i.value)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {rankedItems.map((item, index) => (
                <SortableRecalRankItem key={item.value} item={item} index={index} isHe={isHe} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Time Picker */}
      {isTimePicker && (
        <div className="flex flex-col items-center gap-3">
          <MobileTimePicker
            value={typeof answer === 'string' && /^\d{2}:\d{2}$/.test(answer) ? answer : '07:00'}
            onChange={(time) => onSelect(time)}
            minHour={mini.minHour}
            maxHour={mini.maxHour}
          />
          {/* Fallback options like "Flexible" / "Not working" */}
          {mini.options && mini.options.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 w-full">
              {mini.options.map(opt => {
                const selected = answer === opt.value;
                const label = isHe ? opt.label_he : opt.label_en;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (selected) {
                        onSelect('07:00');
                      } else {
                        onSelect(opt.value);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                      selected
                        ? "bg-primary/10 border-primary/40 text-foreground"
                        : "bg-background/40 border-border/20 text-muted-foreground hover:border-border/40"
                    )}
                  >
                    {opt.icon && <span className="text-sm">{opt.icon}</span>}
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Select options (single/multi) */}
      {!isSlider && !isTextarea && !isPriorityRank && !isTimePicker && (
        <div className="grid grid-cols-2 gap-1.5">
          {mini.options?.map(opt => {
            const selected = isMulti
              ? ((answer as string[]) || []).includes(opt.value)
              : answer === opt.value;
            const label = isHe ? opt.label_he : opt.label_en;

            return (
              <button
                key={opt.value}
                onClick={() => isMulti ? onToggleMulti(opt.value) : onSelect(opt.value)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-start transition-all min-h-[36px]",
                  "text-xs font-medium",
                  selected
                    ? "bg-primary/10 border-primary/40 text-foreground shadow-sm shadow-primary/10"
                    : "bg-background/40 border-border/20 text-muted-foreground hover:bg-accent/5 hover:border-border/40"
                )}
              >
                {opt.icon && <span className="text-sm flex-shrink-0">{opt.icon}</span>}
                <span className="flex-1 leading-tight">{label}</span>
                {selected && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
