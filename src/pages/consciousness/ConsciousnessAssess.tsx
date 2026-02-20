/**
 * @page ConsciousnessAssess (/life/consciousness/assess)
 * @tab Life
 * @purpose Soul Frequency assessment flow — 6 sections, up to 24 questions
 * @data useConsciousnessCoach, life_domains, launchpad_progress
 */
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useConsciousnessCoach } from '@/hooks/useConsciousnessCoach';
import { buildConsciousnessAssessment } from '@/lib/consciousness/scoring';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, ChevronRight, ChevronLeft,
  Check, Waves,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConsciousnessIntakeAnswers, AssessmentDepth } from '@/lib/consciousness/types';

type QType = 'single' | 'multi' | 'band5' | 'freetext';
type SectionId = 'soul_intent' | 'masks' | 'frequency' | 'alignment' | 'inner_signal' | 'field_coherence';

interface Question {
  id: string;
  section: SectionId;
  type: QType;
  titleKey: string;
  options?: { value: string; labelKey: string }[];
  quickOnly?: boolean; // included in quick mode too
  fullOnly?: boolean; // excluded from quick mode
}

const SECTION_META: { id: SectionId; labelKey: string; emoji: string }[] = [
  { id: 'soul_intent', labelKey: 'consciousness.section_soul_intent', emoji: '🔮' },
  { id: 'masks', labelKey: 'consciousness.section_masks', emoji: '🎭' },
  { id: 'frequency', labelKey: 'consciousness.section_frequency', emoji: '〰️' },
  { id: 'alignment', labelKey: 'consciousness.section_alignment', emoji: '🧭' },
  { id: 'inner_signal', labelKey: 'consciousness.section_inner_signal', emoji: '👁️' },
  { id: 'field_coherence', labelKey: 'consciousness.section_field_coherence', emoji: '🌀' },
];

const BAND5_OPTIONS = [
  { value: '1', labelKey: 'consciousness.band_1' },
  { value: '2', labelKey: 'consciousness.band_2' },
  { value: '3', labelKey: 'consciousness.band_3' },
  { value: '4', labelKey: 'consciousness.band_4' },
  { value: '5', labelKey: 'consciousness.band_5' },
];

const ALL_QUESTIONS: Question[] = [
  // Section 1 — Soul Intent
  { id: 'mission_clarity', section: 'soul_intent', type: 'band5', titleKey: 'consciousness.q_mission_clarity' },
  { id: 'ideal_life_image', section: 'soul_intent', type: 'single', titleKey: 'consciousness.q_ideal_life', options: [
    { value: 'crystal', labelKey: 'consciousness.opt_crystal' },
    { value: 'partial', labelKey: 'consciousness.opt_partial' },
    { value: 'fog', labelKey: 'consciousness.opt_fog' },
  ]},
  { id: 'core_values', section: 'soul_intent', type: 'multi', titleKey: 'consciousness.q_core_values', options: [
    { value: 'truth', labelKey: 'consciousness.val_truth' },
    { value: 'freedom', labelKey: 'consciousness.val_freedom' },
    { value: 'growth', labelKey: 'consciousness.val_growth' },
    { value: 'love', labelKey: 'consciousness.val_love' },
    { value: 'courage', labelKey: 'consciousness.val_courage' },
    { value: 'integrity', labelKey: 'consciousness.val_integrity' },
    { value: 'creativity', labelKey: 'consciousness.val_creativity' },
    { value: 'service', labelKey: 'consciousness.val_service' },
    { value: 'wisdom', labelKey: 'consciousness.val_wisdom' },
    { value: 'discipline', labelKey: 'consciousness.val_discipline' },
  ]},
  { id: 'core_values_freetext', section: 'soul_intent', type: 'freetext', titleKey: 'consciousness.q_values_freetext', fullOnly: true },

  // Section 2 — Masks
  { id: 'performs_persona', section: 'masks', type: 'band5', titleKey: 'consciousness.q_performs_persona' },
  { id: 'main_masks', section: 'masks', type: 'multi', titleKey: 'consciousness.q_main_masks', options: [
    { value: 'the_strong', labelKey: 'consciousness.mask_strong' },
    { value: 'the_pleaser', labelKey: 'consciousness.mask_pleaser' },
    { value: 'the_genius', labelKey: 'consciousness.mask_genius' },
    { value: 'the_rebel', labelKey: 'consciousness.mask_rebel' },
    { value: 'the_mystic', labelKey: 'consciousness.mask_mystic' },
    { value: 'the_nice', labelKey: 'consciousness.mask_nice' },
    { value: 'the_controller', labelKey: 'consciousness.mask_controller' },
    { value: 'the_lone_wolf', labelKey: 'consciousness.mask_lone_wolf' },
  ]},
  { id: 'mask_costs', section: 'masks', type: 'multi', titleKey: 'consciousness.q_mask_costs', options: [
    { value: 'fatigue', labelKey: 'consciousness.cost_fatigue' },
    { value: 'anxiety', labelKey: 'consciousness.cost_anxiety' },
    { value: 'numbness', labelKey: 'consciousness.cost_numbness' },
    { value: 'anger', labelKey: 'consciousness.cost_anger' },
    { value: 'procrastination', labelKey: 'consciousness.cost_procrastination' },
    { value: 'disconnection', labelKey: 'consciousness.cost_disconnection' },
    { value: 'self_doubt', labelKey: 'consciousness.cost_self_doubt' },
  ]},

  // Section 3 — Frequency
  { id: 'baseline_state', section: 'frequency', type: 'single', titleKey: 'consciousness.q_baseline_state', options: [
    { value: 'grounded', labelKey: 'consciousness.state_grounded' },
    { value: 'stable', labelKey: 'consciousness.state_stable' },
    { value: 'restless', labelKey: 'consciousness.state_restless' },
    { value: 'heavy', labelKey: 'consciousness.state_heavy' },
    { value: 'sharp', labelKey: 'consciousness.state_sharp' },
    { value: 'numb', labelKey: 'consciousness.state_numb' },
    { value: 'chaotic', labelKey: 'consciousness.state_chaotic' },
  ]},
  { id: 'mood_volatility', section: 'frequency', type: 'band5', titleKey: 'consciousness.q_mood_volatility' },
  { id: 'social_collapse', section: 'frequency', type: 'band5', titleKey: 'consciousness.q_social_collapse', fullOnly: true },
  { id: 'context_split', section: 'frequency', type: 'band5', titleKey: 'consciousness.q_context_split', fullOnly: true },

  // Section 4 — Alignment
  { id: 'values_alignment', section: 'alignment', type: 'band5', titleKey: 'consciousness.q_values_alignment' },
  { id: 'misalignment_area', section: 'alignment', type: 'single', titleKey: 'consciousness.q_misalignment_area', options: [
    { value: 'work', labelKey: 'consciousness.area_work' },
    { value: 'relationships', labelKey: 'consciousness.area_relationships' },
    { value: 'body', labelKey: 'consciousness.area_body' },
    { value: 'spiritual', labelKey: 'consciousness.area_spiritual' },
    { value: 'money', labelKey: 'consciousness.area_money' },
    { value: 'creativity', labelKey: 'consciousness.area_creativity' },
    { value: 'discipline', labelKey: 'consciousness.area_discipline' },
  ]},
  { id: 'misalignment_response', section: 'alignment', type: 'single', titleKey: 'consciousness.q_misalignment_response', options: [
    { value: 'self_attack', labelKey: 'consciousness.resp_self_attack' },
    { value: 'escape', labelKey: 'consciousness.resp_escape' },
    { value: 'numb', labelKey: 'consciousness.resp_numb' },
    { value: 'overwork', labelKey: 'consciousness.resp_overwork' },
    { value: 'fight', labelKey: 'consciousness.resp_fight' },
    { value: 'freeze', labelKey: 'consciousness.resp_freeze' },
    { value: 'rationalize', labelKey: 'consciousness.resp_rationalize' },
  ], fullOnly: true },

  // Section 5 — Inner Signal
  { id: 'body_yes_no', section: 'inner_signal', type: 'band5', titleKey: 'consciousness.q_body_yes_no' },
  { id: 'trusts_guidance', section: 'inner_signal', type: 'band5', titleKey: 'consciousness.q_trusts_guidance' },
  { id: 'silence_capacity', section: 'inner_signal', type: 'band5', titleKey: 'consciousness.q_silence_capacity' },
  { id: 'signal_channel', section: 'inner_signal', type: 'single', titleKey: 'consciousness.q_signal_channel', fullOnly: true, options: [
    { value: 'body_sensations', labelKey: 'consciousness.ch_body' },
    { value: 'images', labelKey: 'consciousness.ch_images' },
    { value: 'words', labelKey: 'consciousness.ch_words' },
    { value: 'dreams', labelKey: 'consciousness.ch_dreams' },
    { value: 'synchronicities', labelKey: 'consciousness.ch_sync' },
    { value: 'knowing', labelKey: 'consciousness.ch_knowing' },
  ]},

  // Section 6 — Field Coherence
  { id: 'breath_under_stress', section: 'field_coherence', type: 'single', titleKey: 'consciousness.q_breath_stress', options: [
    { value: 'deep_slow', labelKey: 'consciousness.breath_deep' },
    { value: 'shallow_fast', labelKey: 'consciousness.breath_shallow' },
    { value: 'hold', labelKey: 'consciousness.breath_hold' },
    { value: 'erratic', labelKey: 'consciousness.breath_erratic' },
  ]},
  { id: 'sleep_stability', section: 'field_coherence', type: 'single', titleKey: 'consciousness.q_sleep_stability', options: [
    { value: 'stable', labelKey: 'consciousness.sleep_stable' },
    { value: 'moderate', labelKey: 'consciousness.sleep_moderate' },
    { value: 'poor', labelKey: 'consciousness.sleep_poor' },
  ]},
  { id: 'caffeine_dependence', section: 'field_coherence', type: 'single', titleKey: 'consciousness.q_caffeine', fullOnly: true, options: [
    { value: 'none', labelKey: 'consciousness.caff_none' },
    { value: 'moderate', labelKey: 'consciousness.caff_moderate' },
    { value: 'dependent', labelKey: 'consciousness.caff_dependent' },
  ]},
  { id: 'morning_sunlight', section: 'field_coherence', type: 'single', titleKey: 'consciousness.q_sunlight', fullOnly: true, options: [
    { value: 'daily', labelKey: 'consciousness.sun_daily' },
    { value: 'sometimes', labelKey: 'consciousness.sun_sometimes' },
    { value: 'rarely', labelKey: 'consciousness.sun_rarely' },
  ]},
];

export default function ConsciousnessAssess() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { saveAssessment } = useConsciousnessCoach();

  const [phase, setPhase] = useState<'intro' | 'depth' | 'flow' | 'saving'>('intro');
  const [depth, setDepth] = useState<AssessmentDepth>('full');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState(1);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;

  const questions = useMemo(() =>
    ALL_QUESTIONS.filter(q => depth === 'full' ? true : !q.fullOnly),
    [depth]
  );

  const totalQ = questions.length;
  const currentQ = questions[currentIdx];
  const pct = Math.round(((currentIdx + 1) / totalQ) * 100);
  const currentSectionMeta = currentQ ? SECTION_META.find(s => s.id === currentQ.section) : null;
  const isSubStart = currentIdx === 0 || questions[currentIdx - 1]?.section !== currentQ?.section;

  const buildStructuredAnswers = useCallback((): ConsciousnessIntakeAnswers => {
    const a = answers;
    return {
      depth,
      soul_intent: {
        mission_clarity: a.mission_clarity,
        ideal_life_image: a.ideal_life_image,
        core_values: a.core_values,
        core_values_freetext: a.core_values_freetext,
      },
      masks: {
        performs_persona: a.performs_persona,
        main_masks: a.main_masks,
        mask_costs: a.mask_costs,
      },
      frequency: {
        baseline_state: a.baseline_state,
        mood_volatility: a.mood_volatility,
        social_collapse: a.social_collapse,
        context_split: a.context_split,
      },
      alignment: {
        values_alignment: a.values_alignment,
        misalignment_area: a.misalignment_area,
        misalignment_response: a.misalignment_response,
      },
      inner_signal: {
        body_yes_no: a.body_yes_no,
        trusts_guidance: a.trusts_guidance,
        silence_capacity: a.silence_capacity,
        signal_channel: a.signal_channel,
      },
      field_coherence: {
        breath_under_stress: a.breath_under_stress,
        sleep_stability: a.sleep_stability,
        caffeine_dependence: a.caffeine_dependence,
        morning_sunlight: a.morning_sunlight,
      },
    };
  }, [answers, depth]);

  const handleNext = useCallback(async () => {
    setDirection(1);
    if (currentIdx < totalQ - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setPhase('saving');
      try {
        const structured = buildStructuredAnswers();
        const result = buildConsciousnessAssessment(structured);
        await saveAssessment(result);
        navigate('/life/consciousness/results');
      } catch (err) {
        console.error(err);
        setPhase('flow');
      }
    }
  }, [currentIdx, totalQ, buildStructuredAnswers, saveAssessment, navigate]);

  const handleBack = useCallback(() => {
    setDirection(-1);
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
    else setPhase('depth');
  }, [currentIdx]);

  const setAnswer = useCallback((qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }, []);

  const toggleMulti = useCallback((qId: string, val: string) => {
    setAnswers(prev => {
      const current: string[] = prev[qId] ?? [];
      return { ...prev, [qId]: current.includes(val) ? current.filter(v => v !== val) : [...current, val] };
    });
  }, []);

  // Intro phase
  if (phase === 'intro') {
    const chips = ['consciousness.chip_soul', 'consciousness.chip_masks', 'consciousness.chip_frequency', 'consciousness.chip_alignment', 'consciousness.chip_signal', 'consciousness.chip_coherence'];
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Waves className="w-14 h-14 text-violet-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-foreground mb-2">{t('consciousness.introTitle')}</h1>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{t('consciousness.introSubtitle')}</p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {chips.map(c => (
                <Badge key={c} variant="secondary" className="bg-violet-500/10 text-violet-400 border-violet-500/30">{t(c)}</Badge>
              ))}
            </div>
            <Button onClick={() => setPhase('depth')} className="bg-violet-600 hover:bg-violet-700" size="lg">
              {t('consciousness.begin')} <ForwardIcon className="w-4 h-4 ms-1" />
            </Button>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  // Depth selection
  if (phase === 'depth') {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-bold text-foreground mb-2">{t('consciousness.depthTitle')}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t('consciousness.depthSubtitle')}</p>
            <div className="space-y-3 max-w-sm mx-auto">
              {(['full', 'quick'] as AssessmentDepth[]).map(d => (
                <button key={d} type="button" onClick={() => { setDepth(d); setPhase('flow'); }}
                  className={cn(
                    'w-full p-4 rounded-xl border text-start transition-all flex items-center justify-between',
                    depth === d ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30' : 'border-border bg-card hover:bg-muted/50'
                  )}>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(`consciousness.depth_${d}`)}</p>
                    <p className="text-xs text-muted-foreground">{t(`consciousness.depth_${d}_desc`)}</p>
                  </div>
                  {depth === d && <Check className="w-4 h-4 text-violet-500 shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  // Saving
  if (phase === 'saving' || !currentQ) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[300px]">
          <Waves className="w-6 h-6 animate-spin text-violet-500" />
          <span className="ms-2 text-sm text-muted-foreground">{t('common.saving')}</span>
        </div>
      </PageShell>
    );
  }

  const isLast = currentIdx === totalQ - 1;
  const currentVal = answers[currentQ.id];
  const canProceed =
    currentQ.type === 'multi' ? (currentVal as string[] ?? []).length > 0
    : currentQ.type === 'freetext' ? true
    : !!currentVal;

  const effectiveOptions = currentQ.type === 'band5' ? BAND5_OPTIONS : currentQ.options;

  return (
    <PageShell>
      <div className="space-y-5 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Progress header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {currentSectionMeta && <span className="text-lg">{currentSectionMeta.emoji}</span>}
              <div>
                <p className="text-xs text-muted-foreground">{currentSectionMeta ? t(currentSectionMeta.labelKey) : ''}</p>
                <span className="text-xs text-muted-foreground">{currentIdx + 1}/{totalQ}</span>
              </div>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden" dir="ltr">
            <motion.div className="h-full rounded-full bg-violet-500" initial={false}
              animate={{ width: `${pct}%` }} transition={{ duration: 0.3, ease: 'easeOut' }} />
          </div>
        </div>

        {/* Section banner */}
        {isSubStart && currentSectionMeta && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 text-center">
            <span className="text-lg me-2">{currentSectionMeta.emoji}</span>
            <span className="text-sm font-semibold text-foreground">{t(currentSectionMeta.labelKey)}</span>
          </motion.div>
        )}

        {/* Question */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={currentQ.id} custom={direction}
            initial={{ opacity: 0, x: direction * 60 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }} transition={{ duration: 0.25 }}>
            <h2 className="text-lg font-bold text-foreground mb-4">{t(currentQ.titleKey)}</h2>

            <div className="space-y-2">
              {(currentQ.type === 'single' || currentQ.type === 'band5') && effectiveOptions?.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setAnswer(currentQ.id, opt.value)}
                  className={cn(
                    'w-full p-4 rounded-xl border text-start transition-all flex items-center justify-between',
                    currentVal === opt.value
                      ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}>
                  <span className="text-sm font-medium text-foreground">{t(opt.labelKey)}</span>
                  {currentVal === opt.value && <Check className="w-4 h-4 text-violet-500 shrink-0" />}
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
                        ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30'
                        : 'border-border bg-card hover:bg-muted/50'
                    )}>
                    <span className="text-sm font-medium text-foreground">{t(opt.labelKey)}</span>
                    {selected && <Check className="w-4 h-4 text-violet-500 shrink-0" />}
                  </button>
                );
              })}

              {currentQ.type === 'freetext' && (
                <Input type="text" autoFocus
                  placeholder={t('consciousness.freetext_placeholder')}
                  value={currentVal ?? ''}
                  onChange={e => setAnswer(currentQ.id, e.target.value || undefined)}
                  className="text-start text-base h-12" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => { setDirection(1); handleNext(); }} className="text-muted-foreground text-xs">
            {t('common.skip')}
          </Button>
          <Button onClick={handleNext} disabled={!canProceed && currentQ.type !== 'freetext'}
            className="bg-violet-600 hover:bg-violet-700" size="lg">
            {isLast ? t('consciousness.finish') : t('common.next')}
            {!isLast && <ForwardIcon className="w-4 h-4 ms-1" />}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
