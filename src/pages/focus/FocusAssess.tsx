/**
 * @page FocusAssess (/life/focus/assess)
 * Guided multi-section micro-flow assessment — one question per screen.
 * 6 subsystems × ~5 questions = ~30 questions.
 */
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useFocusCoach } from '@/hooks/useFocusCoach';
import { buildFocusAssessment } from '@/lib/focus/scoring';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, ChevronRight, ChevronLeft,
  Check, SkipForward, Crosshair,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FocusIntakeAnswers, SubsystemId } from '@/lib/focus/types';

/* ─── Step definitions ─── */
type QType = 'single' | 'multi' | 'numeric' | 'text';

interface Question {
  id: string;
  subsystem: SubsystemId;
  type: QType;
  title_key: string;
  options?: { value: string; label_key: string }[];
  placeholder?: string;
  max?: number;
  optional?: boolean;
}

const SUBSYSTEM_META: { id: SubsystemId; label_key: string; emoji: string }[] = [
  { id: 'breath_control', label_key: 'focus.section_breath', emoji: '🫁' },
  { id: 'attention_stability', label_key: 'focus.section_meditation', emoji: '🧘' },
  { id: 'guided_suggestibility', label_key: 'focus.section_guided', emoji: '🎧' },
  { id: 'trance_depth', label_key: 'focus.section_hypnosis', emoji: '🌀' },
  { id: 'somatic_awareness', label_key: 'focus.section_somatic', emoji: '☯️' },
  { id: 'structural_calm', label_key: 'focus.section_yoga', emoji: '🧎' },
];

const FREQ_OPTIONS = [
  { value: 'daily', label_key: 'focus.freq_daily' },
  { value: '3_5_week', label_key: 'focus.freq_3_5' },
  { value: '1_2_week', label_key: 'focus.freq_1_2' },
  { value: 'rarely', label_key: 'focus.freq_rarely' },
  { value: 'never', label_key: 'focus.freq_never' },
];

const QUESTIONS: Question[] = [
  // 1) Breath Work
  { id: 'breath_types', subsystem: 'breath_control', type: 'multi', title_key: 'focus.q_breath_types',
    options: [
      { value: 'box_breathing', label_key: 'focus.opt_box_breathing' },
      { value: 'coherent_6bpm', label_key: 'focus.opt_coherent_6bpm' },
      { value: 'wim_hof', label_key: 'focus.opt_wim_hof' },
      { value: 'slow_nasal', label_key: 'focus.opt_slow_nasal' },
      { value: 'breath_holds', label_key: 'focus.opt_breath_holds' },
      { value: 'none', label_key: 'focus.opt_none' },
    ]},
  { id: 'breath_freq', subsystem: 'breath_control', type: 'single', title_key: 'focus.q_breath_freq', options: FREQ_OPTIONS },
  { id: 'breath_duration', subsystem: 'breath_control', type: 'single', title_key: 'focus.q_breath_duration',
    options: [
      { value: 'under_5', label_key: 'focus.opt_under_5' },
      { value: '5_10', label_key: 'focus.opt_5_10' },
      { value: '10_20', label_key: 'focus.opt_10_20' },
      { value: '20_plus', label_key: 'focus.opt_20_plus' },
    ]},
  { id: 'breath_control_claim', subsystem: 'breath_control', type: 'single', title_key: 'focus.q_breath_control',
    options: [
      { value: 'can_downshift_fast', label_key: 'focus.opt_can_downshift' },
      { value: 'sometimes', label_key: 'focus.opt_sometimes' },
      { value: 'not_yet', label_key: 'focus.opt_not_yet' },
    ]},
  { id: 'breath_hold_sec', subsystem: 'breath_control', type: 'numeric', title_key: 'focus.q_breath_hold', placeholder: 'focus.opt_seconds', optional: true },

  // 2) Meditation (silent)
  { id: 'med_freq', subsystem: 'attention_stability', type: 'single', title_key: 'focus.q_med_freq', options: FREQ_OPTIONS },
  { id: 'med_session', subsystem: 'attention_stability', type: 'single', title_key: 'focus.q_med_session',
    options: [
      { value: 'under_5', label_key: 'focus.opt_under_5' },
      { value: '5_10', label_key: 'focus.opt_5_10' },
      { value: '10_20', label_key: 'focus.opt_10_20' },
      { value: '20_40', label_key: 'focus.opt_20_40' },
      { value: '40_plus', label_key: 'focus.opt_40_plus' },
    ]},
  { id: 'med_stillness', subsystem: 'attention_stability', type: 'single', title_key: 'focus.q_med_stillness',
    options: [
      { value: '2_min', label_key: 'focus.opt_2min' },
      { value: '5_min', label_key: 'focus.opt_5min' },
      { value: '10_min', label_key: 'focus.opt_10min' },
      { value: '20_plus', label_key: 'focus.opt_20min_plus' },
    ]},
  { id: 'med_wandering', subsystem: 'attention_stability', type: 'single', title_key: 'focus.q_med_wandering',
    options: [
      { value: 'under_10s', label_key: 'focus.opt_under_10s' },
      { value: '10_30s', label_key: 'focus.opt_10_30s' },
      { value: '30_60s', label_key: 'focus.opt_30_60s' },
      { value: 'minutes', label_key: 'focus.opt_minutes' },
    ]},
  { id: 'med_effect', subsystem: 'attention_stability', type: 'single', title_key: 'focus.q_med_effect',
    options: [
      { value: 'clearer', label_key: 'focus.opt_clearer' },
      { value: 'neutral', label_key: 'focus.opt_neutral' },
      { value: 'sleepy', label_key: 'focus.opt_sleepy' },
      { value: 'agitated', label_key: 'focus.opt_agitated' },
    ]},

  // 3) Guided Meditation
  { id: 'guided_freq', subsystem: 'guided_suggestibility', type: 'single', title_key: 'focus.q_guided_freq', options: FREQ_OPTIONS },
  { id: 'guided_sleep', subsystem: 'guided_suggestibility', type: 'single', title_key: 'focus.q_guided_sleep',
    options: [
      { value: 'never', label_key: 'focus.opt_never_sleep' },
      { value: 'sometimes', label_key: 'focus.opt_sometimes_sleep' },
      { value: 'often', label_key: 'focus.opt_often_sleep' },
    ]},
  { id: 'guided_follow', subsystem: 'guided_suggestibility', type: 'single', title_key: 'focus.q_guided_follow',
    options: [
      { value: 'yes', label_key: 'focus.opt_fully' },
      { value: 'partial', label_key: 'focus.opt_partial' },
      { value: 'no', label_key: 'focus.opt_no_follow' },
    ]},
  { id: 'guided_shift', subsystem: 'guided_suggestibility', type: 'single', title_key: 'focus.q_guided_shift',
    options: [
      { value: 'strong', label_key: 'focus.opt_strong' },
      { value: 'mild', label_key: 'focus.opt_mild' },
      { value: 'none', label_key: 'focus.opt_none_shift' },
    ]},
  { id: 'guided_voice', subsystem: 'guided_suggestibility', type: 'single', title_key: 'focus.q_guided_voice',
    options: [
      { value: 'calm', label_key: 'focus.opt_calm' },
      { value: 'firm', label_key: 'focus.opt_firm' },
      { value: 'mystical', label_key: 'focus.opt_mystical' },
      { value: 'minimal', label_key: 'focus.opt_minimal' },
    ]},

  // 4) Hypnosis
  { id: 'hyp_experience', subsystem: 'trance_depth', type: 'single', title_key: 'focus.q_hyp_experience',
    options: [
      { value: 'none', label_key: 'focus.opt_hyp_none' },
      { value: 'beginner', label_key: 'focus.opt_hyp_beginner' },
      { value: 'intermediate', label_key: 'focus.opt_hyp_intermediate' },
      { value: 'advanced', label_key: 'focus.opt_hyp_advanced' },
    ]},
  { id: 'hyp_freq', subsystem: 'trance_depth', type: 'single', title_key: 'focus.q_hyp_freq', options: FREQ_OPTIONS },
  { id: 'hyp_markers', subsystem: 'trance_depth', type: 'multi', title_key: 'focus.q_hyp_markers',
    options: [
      { value: 'time_distortion', label_key: 'focus.opt_time_distortion' },
      { value: 'body_numbness', label_key: 'focus.opt_body_numbness' },
      { value: 'vivid_imagery', label_key: 'focus.opt_vivid_imagery' },
      { value: 'spontaneous_emotion', label_key: 'focus.opt_spontaneous_emotion' },
      { value: 'none', label_key: 'focus.opt_none_markers' },
    ]},
  { id: 'hyp_effectiveness', subsystem: 'trance_depth', type: 'single', title_key: 'focus.q_hyp_effectiveness',
    options: [
      { value: 'reliably', label_key: 'focus.opt_reliably' },
      { value: 'sometimes', label_key: 'focus.opt_sometimes_eff' },
      { value: 'not_yet', label_key: 'focus.opt_not_yet_eff' },
    ]},
  { id: 'hyp_length', subsystem: 'trance_depth', type: 'numeric', title_key: 'focus.q_hyp_length', placeholder: 'focus.opt_minutes_unit', optional: true },

  // 5) Somatic (Tai Chi / Qigong / Nei Gong)
  { id: 'som_types', subsystem: 'somatic_awareness', type: 'multi', title_key: 'focus.q_som_types',
    options: [
      { value: 'tai_chi', label_key: 'focus.opt_tai_chi' },
      { value: 'qi_gong', label_key: 'focus.opt_qi_gong' },
      { value: 'nei_gong', label_key: 'focus.opt_nei_gong' },
      { value: 'yoga_standing', label_key: 'focus.opt_yoga_standing' },
      { value: 'none', label_key: 'focus.opt_none_som' },
    ]},
  { id: 'som_freq', subsystem: 'somatic_awareness', type: 'single', title_key: 'focus.q_som_freq', options: FREQ_OPTIONS },
  { id: 'som_session', subsystem: 'somatic_awareness', type: 'single', title_key: 'focus.q_som_session',
    options: [
      { value: 'under_5', label_key: 'focus.opt_under_5' },
      { value: '5_10', label_key: 'focus.opt_5_10' },
      { value: '10_20', label_key: 'focus.opt_10_20' },
      { value: '20_plus', label_key: 'focus.opt_20_plus' },
    ]},
  { id: 'som_integration', subsystem: 'somatic_awareness', type: 'single', title_key: 'focus.q_som_integration',
    options: [
      { value: 'strong', label_key: 'focus.opt_strong_int' },
      { value: 'partial', label_key: 'focus.opt_partial_int' },
      { value: 'none', label_key: 'focus.opt_none_int' },
    ]},
  { id: 'som_sensations', subsystem: 'somatic_awareness', type: 'multi', title_key: 'focus.q_som_sensations',
    options: [
      { value: 'warmth_in_hands', label_key: 'focus.opt_warmth' },
      { value: 'tingling', label_key: 'focus.opt_tingling' },
      { value: 'grounded_heavy', label_key: 'focus.opt_grounded' },
      { value: 'none', label_key: 'focus.opt_none_sens' },
    ]},

  // 6) Yoga
  { id: 'yoga_styles', subsystem: 'structural_calm', type: 'multi', title_key: 'focus.q_yoga_styles',
    options: [
      { value: 'dynamic', label_key: 'focus.opt_dynamic' },
      { value: 'static', label_key: 'focus.opt_static' },
      { value: 'standing', label_key: 'focus.opt_standing' },
      { value: 'mobility', label_key: 'focus.opt_mobility' },
      { value: 'none', label_key: 'focus.opt_none_yoga' },
    ]},
  { id: 'yoga_freq', subsystem: 'structural_calm', type: 'single', title_key: 'focus.q_yoga_freq', options: FREQ_OPTIONS },
  { id: 'yoga_breath', subsystem: 'structural_calm', type: 'single', title_key: 'focus.q_yoga_breath',
    options: [
      { value: 'controlled', label_key: 'focus.opt_controlled' },
      { value: 'partial', label_key: 'focus.opt_partial_breath' },
      { value: 'loses_breath', label_key: 'focus.opt_loses_breath' },
    ]},
  { id: 'yoga_balance', subsystem: 'structural_calm', type: 'single', title_key: 'focus.q_yoga_balance',
    options: [
      { value: 'strong', label_key: 'focus.opt_strong_bal' },
      { value: 'average', label_key: 'focus.opt_average_bal' },
      { value: 'weak', label_key: 'focus.opt_weak_bal' },
    ]},
  { id: 'yoga_injury', subsystem: 'structural_calm', type: 'text', title_key: 'focus.q_yoga_injury', max: 120, optional: true },
];

export default function FocusAssess() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { saveAssessment, saveDraft } = useFocusCoach();

  const [phase, setPhase] = useState<'intro' | 'flow' | 'saving'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [skippedSubs, setSkippedSubs] = useState<SubsystemId[]>([]);
  const [direction, setDirection] = useState(1);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;

  // Filter out skipped subsystem questions
  const activeQuestions = useMemo(
    () => QUESTIONS.filter(q => !skippedSubs.includes(q.subsystem)),
    [skippedSubs]
  );

  const totalQ = activeQuestions.length;
  const currentQ = activeQuestions[currentIdx];
  const pct = totalQ > 0 ? Math.round(((currentIdx + 1) / totalQ) * 100) : 0;

  // Current subsystem info
  const currentSubMeta = currentQ ? SUBSYSTEM_META.find(s => s.id === currentQ.subsystem) : null;

  // Is this the first question of a new subsystem?
  const isSubStart = currentIdx === 0 || (currentQ && activeQuestions[currentIdx - 1]?.subsystem !== currentQ.subsystem);

  // Map flat answers to structured FocusIntakeAnswers
  const buildStructuredAnswers = useCallback(() => {
    const a = answers;
    return {
      breath: {
        practice_types: a.breath_types ?? [],
        frequency: a.breath_freq ?? '',
        duration: a.breath_duration ?? '',
        control_claim: a.breath_control_claim ?? '',
        breath_hold_seconds: a.breath_hold_sec != null ? parseFloat(a.breath_hold_sec) : undefined,
      },
      meditation: {
        frequency: a.med_freq ?? '',
        session_length: a.med_session ?? '',
        stillness_capacity: a.med_stillness ?? '',
        mind_wandering: a.med_wandering ?? '',
        after_effect: a.med_effect ?? '',
      },
      guided: {
        frequency: a.guided_freq ?? '',
        falls_asleep: a.guided_sleep ?? '',
        follow_guidance: a.guided_follow ?? '',
        post_shift: a.guided_shift ?? '',
        preferred_voice: a.guided_voice ?? '',
      },
      hypnosis: {
        experience: a.hyp_experience ?? '',
        frequency: a.hyp_freq ?? '',
        depth_markers: a.hyp_markers ?? [],
        suggestion_effectiveness: a.hyp_effectiveness ?? '',
        preferred_length: a.hyp_length != null ? parseFloat(a.hyp_length) : undefined,
      },
      somatic: {
        practice_types: a.som_types ?? [],
        frequency: a.som_freq ?? '',
        session_length: a.som_session ?? '',
        breath_motion_integration: a.som_integration ?? '',
        sensation_markers: a.som_sensations ?? [],
      },
      yoga: {
        styles: a.yoga_styles ?? [],
        frequency: a.yoga_freq ?? '',
        breath_under_strain: a.yoga_breath ?? '',
        balance_control: a.yoga_balance ?? '',
        injury_constraints: a.yoga_injury ?? undefined,
      },
      skipped_subsystems: skippedSubs,
    };
  }, [answers, skippedSubs]);

  const handleNext = useCallback(async () => {
    setDirection(1);
    if (currentIdx < totalQ - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      // Submit
      setPhase('saving');
      try {
        const structured = buildStructuredAnswers();
        const result = buildFocusAssessment(structured);
        await saveAssessment(result);
        navigate('/life/focus/results');
      } catch (err) {
        console.error(err);
        setPhase('flow');
      }
    }
  }, [currentIdx, totalQ, buildStructuredAnswers, saveAssessment, navigate]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
    else setPhase('intro');
  }, [currentIdx]);

  const handleSkipSubsystem = useCallback(() => {
    if (!currentQ) return;
    const sub = currentQ.subsystem;
    setSkippedSubs(prev => [...prev, sub]);
    // Move to first question of next subsystem
    const nextIdx = activeQuestions.findIndex((q, i) => i > currentIdx && q.subsystem !== sub);
    if (nextIdx >= 0) {
      setCurrentIdx(nextIdx - skippedSubs.length * 5); // recalculates on re-filter
      // Actually, since activeQuestions will re-filter, reset to current subsystem start
      setCurrentIdx(currentIdx); // stays at same index but filtered questions change
    } else {
      // Last subsystem skipped — submit
      handleNext();
    }
  }, [currentQ, currentIdx, activeQuestions, skippedSubs, handleNext]);

  const setAnswer = useCallback((qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }, []);

  const toggleMulti = useCallback((qId: string, val: string) => {
    setAnswers(prev => {
      const current: string[] = prev[qId] ?? [];
      // "none" clears others, selecting non-none clears "none"
      if (val === 'none') return { ...prev, [qId]: ['none'] };
      const filtered = current.filter(v => v !== 'none');
      return { ...prev, [qId]: filtered.includes(val) ? filtered.filter(v => v !== val) : [...filtered, val] };
    });
  }, []);

  /* ─── Intro screen ─── */
  if (phase === 'intro') {
    const chips = ['focus.chip_breath', 'focus.chip_trance', 'focus.chip_attention', 'focus.chip_somatic', 'focus.chip_suggestibility', 'focus.chip_calm'];
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Crosshair className="w-14 h-14 text-cyan-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-foreground mb-2">{t('focus.introTitle')}</h1>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{t('focus.introSubtitle')}</p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {chips.map(c => (
                <Badge key={c} variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">{t(c)}</Badge>
              ))}
            </div>
            <Button onClick={() => setPhase('flow')} className="bg-cyan-600 hover:bg-cyan-700" size="lg">
              {t('focus.begin')} <ForwardIcon className="w-4 h-4 ms-1" />
            </Button>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  if (phase === 'saving' || !currentQ) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[300px]">
          <Crosshair className="w-6 h-6 animate-spin text-cyan-500" />
          <span className="ms-2 text-sm text-muted-foreground">{t('common.saving')}</span>
        </div>
      </PageShell>
    );
  }

  /* ─── Question flow ─── */
  const isLast = currentIdx === totalQ - 1;
  const currentVal = answers[currentQ.id];
  const canProceed = currentQ.optional || (
    currentQ.type === 'multi' ? (currentVal as string[] ?? []).length > 0
    : currentQ.type === 'numeric' ? true // optional by nature
    : currentQ.type === 'text' ? true
    : !!currentVal
  );

  return (
    <PageShell>
      <div className="space-y-5 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {currentSubMeta && <span className="text-lg">{currentSubMeta.emoji}</span>}
              <div>
                <p className="text-xs text-muted-foreground">{currentSubMeta ? t(currentSubMeta.label_key) : ''}</p>
                <span className="text-xs text-muted-foreground">{currentIdx + 1}/{totalQ}</span>
              </div>
            </div>
            {/* Skip subsystem */}
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleSkipSubsystem}>
              <SkipForward className="w-3 h-3 me-1" /> {t('focus.skipSection')}
            </Button>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden" dir="ltr">
            <motion.div className="h-full rounded-full bg-cyan-500" initial={false}
              animate={{ width: `${pct}%` }} transition={{ duration: 0.3, ease: 'easeOut' }} />
          </div>
        </div>

        {/* Subsystem intro badge */}
        {isSubStart && currentSubMeta && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
            <span className="text-lg me-2">{currentSubMeta.emoji}</span>
            <span className="text-sm font-semibold text-foreground">{t(currentSubMeta.label_key)}</span>
          </motion.div>
        )}

        {/* Question */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={currentQ.id} custom={direction}
            initial={{ opacity: 0, x: direction * 60 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }} transition={{ duration: 0.25 }}>
            <h2 className="text-lg font-bold text-foreground mb-4">{t(currentQ.title_key)}</h2>

            <div className="space-y-2">
              {currentQ.type === 'single' && currentQ.options?.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setAnswer(currentQ.id, opt.value)}
                  className={cn(
                    'w-full p-4 rounded-xl border text-start transition-all flex items-center justify-between',
                    currentVal === opt.value
                      ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}>
                  <span className="text-sm font-medium text-foreground">{t(opt.label_key)}</span>
                  {currentVal === opt.value && <Check className="w-4 h-4 text-cyan-500 shrink-0" />}
                </button>
              ))}

              {currentQ.type === 'multi' && currentQ.options?.map(opt => {
                const selected = (currentVal as string[] ?? []).includes(opt.value);
                return (
                  <button key={opt.value} type="button"
                    onClick={() => toggleMulti(currentQ.id, opt.value)}
                    className={cn(
                      'w-full p-4 rounded-xl border text-start transition-all flex items-center justify-between',
                      selected
                        ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                        : 'border-border bg-card hover:bg-muted/50'
                    )}>
                    <span className="text-sm font-medium text-foreground">{t(opt.label_key)}</span>
                    {selected && <Check className="w-4 h-4 text-cyan-500 shrink-0" />}
                  </button>
                );
              })}

              {currentQ.type === 'numeric' && (
                <Input type="number" inputMode="decimal" dir="ltr" autoFocus
                  placeholder={currentQ.placeholder ? t(currentQ.placeholder) : '—'}
                  value={currentVal ?? ''}
                  onChange={e => setAnswer(currentQ.id, e.target.value === '' ? undefined : e.target.value)}
                  className="text-start text-lg h-12" />
              )}

              {currentQ.type === 'text' && (
                <Input type="text" autoFocus maxLength={currentQ.max ?? 120}
                  placeholder="..."
                  value={currentVal ?? ''}
                  onChange={e => setAnswer(currentQ.id, e.target.value)}
                  className="text-start text-lg h-12" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next */}
        <Button onClick={handleNext} disabled={!canProceed && !currentQ.optional}
          className="w-full bg-cyan-600 hover:bg-cyan-700" size="lg">
          {isLast ? t('focus.computeResults') : t('common.next')}
          <ForwardIcon className="w-4 h-4 ms-1" />
        </Button>

        {/* Skip option for optional */}
        {currentQ.optional && !isLast && (
          <button type="button" onClick={handleNext}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
            {t('common.skip') ?? 'Skip'}
          </button>
        )}
      </div>
    </PageShell>
  );
}
