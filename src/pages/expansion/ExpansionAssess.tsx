/**
 * @page ExpansionAssess (/life/expansion/assess)
 * Guided multi-section micro-flow assessment — one question per screen.
 * 4 subsystems × 5 questions = 20 questions.
 */
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { useExpansionCoach } from '@/hooks/useExpansionCoach';
import { buildExpansionAssessment } from '@/lib/expansion/scoring';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, ChevronRight, ChevronLeft,
  Check, Brain,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExpansionIntakeAnswers } from '@/lib/expansion/types';

type QType = 'single' | 'multi' | 'numeric';
type SectionId = 'learning' | 'creative' | 'language' | 'philosophical';

interface Question {
  id: string;
  section: SectionId;
  type: QType;
  title_key: string;
  options?: { value: string; label_key: string }[];
  placeholder?: string;
}

const SECTION_META: { id: SectionId; label_key: string; emoji: string }[] = [
  { id: 'learning', label_key: 'expansion.section_learning', emoji: '📚' },
  { id: 'creative', label_key: 'expansion.section_creative', emoji: '🎨' },
  { id: 'language', label_key: 'expansion.section_language', emoji: '🌐' },
  { id: 'philosophical', label_key: 'expansion.section_philosophical', emoji: '🧠' },
];

const QUESTIONS: Question[] = [
  // Section 1 — Learning Depth & Velocity
  { id: 'learn_hours', section: 'learning', type: 'numeric', title_key: 'expansion.q_learn_hours', placeholder: 'expansion.ph_hours' },
  { id: 'learn_types', section: 'learning', type: 'multi', title_key: 'expansion.q_learn_types', options: [
    { value: 'deep_books', label_key: 'expansion.opt_deep_books' },
    { value: 'structured_courses', label_key: 'expansion.opt_structured_courses' },
    { value: 'academic_papers', label_key: 'expansion.opt_academic_papers' },
    { value: 'long_form_video', label_key: 'expansion.opt_long_form_video' },
    { value: 'podcasts', label_key: 'expansion.opt_podcasts' },
    { value: 'short_form_content', label_key: 'expansion.opt_short_form_content' },
  ]},
  { id: 'learn_retention', section: 'learning', type: 'single', title_key: 'expansion.q_retention', options: [
    { value: 'easily', label_key: 'expansion.opt_easily' },
    { value: 'partially', label_key: 'expansion.opt_partially' },
    { value: 'rarely', label_key: 'expansion.opt_rarely' },
  ]},
  { id: 'learn_implementation', section: 'learning', type: 'single', title_key: 'expansion.q_implementation', options: [
    { value: 'consistently', label_key: 'expansion.opt_consistently' },
    { value: 'sometimes', label_key: 'expansion.opt_sometimes' },
    { value: 'rarely', label_key: 'expansion.opt_rarely' },
  ]},
  { id: 'learn_synthesis', section: 'learning', type: 'single', title_key: 'expansion.q_synthesis', options: [
    { value: 'weekly', label_key: 'expansion.opt_weekly' },
    { value: 'monthly', label_key: 'expansion.opt_monthly' },
    { value: 'never', label_key: 'expansion.opt_never' },
  ]},

  // Section 2 — Creative Output & Iteration
  { id: 'create_types', section: 'creative', type: 'multi', title_key: 'expansion.q_create_types', options: [
    { value: 'writing', label_key: 'expansion.opt_writing' },
    { value: 'video', label_key: 'expansion.opt_video' },
    { value: 'art', label_key: 'expansion.opt_art' },
    { value: 'music', label_key: 'expansion.opt_music' },
    { value: 'coding', label_key: 'expansion.opt_coding' },
    { value: 'product_building', label_key: 'expansion.opt_product_building' },
    { value: 'business_creation', label_key: 'expansion.opt_business_creation' },
    { value: 'none', label_key: 'expansion.opt_none' },
  ]},
  { id: 'create_weekly', section: 'creative', type: 'numeric', title_key: 'expansion.q_create_weekly', placeholder: 'expansion.ph_pieces' },
  { id: 'create_exposure', section: 'creative', type: 'single', title_key: 'expansion.q_exposure', options: [
    { value: 'publish_publicly', label_key: 'expansion.opt_publish_publicly' },
    { value: 'private_only', label_key: 'expansion.opt_private_only' },
    { value: 'none', label_key: 'expansion.opt_none_exposure' },
  ]},
  { id: 'create_iteration', section: 'creative', type: 'single', title_key: 'expansion.q_iteration', options: [
    { value: 'structured_iterations', label_key: 'expansion.opt_structured_iterations' },
    { value: 'occasional_edits', label_key: 'expansion.opt_occasional_edits' },
    { value: 'rarely_refine', label_key: 'expansion.opt_rarely_refine' },
  ]},
  { id: 'create_ideas', section: 'creative', type: 'single', title_key: 'expansion.q_ideas', options: [
    { value: 'abundant_ideas_daily', label_key: 'expansion.opt_abundant' },
    { value: 'moderate', label_key: 'expansion.opt_moderate' },
    { value: 'blocked_often', label_key: 'expansion.opt_blocked' },
  ]},

  // Section 3 — Language Complexity
  { id: 'lang_active', section: 'language', type: 'multi', title_key: 'expansion.q_lang_active', options: [
    { value: 'hebrew', label_key: 'expansion.opt_hebrew' },
    { value: 'english', label_key: 'expansion.opt_english' },
    { value: 'arabic', label_key: 'expansion.opt_arabic' },
    { value: 'russian', label_key: 'expansion.opt_russian' },
    { value: 'french', label_key: 'expansion.opt_french' },
    { value: 'spanish', label_key: 'expansion.opt_spanish' },
    { value: 'other', label_key: 'expansion.opt_other_lang' },
  ]},
  { id: 'lang_fluency', section: 'language', type: 'single', title_key: 'expansion.q_fluency', options: [
    { value: 'basic', label_key: 'expansion.opt_basic' },
    { value: 'conversational', label_key: 'expansion.opt_conversational' },
    { value: 'fluent', label_key: 'expansion.opt_fluent' },
    { value: 'near_native', label_key: 'expansion.opt_near_native' },
  ]},
  { id: 'lang_complex', section: 'language', type: 'single', title_key: 'expansion.q_complex_content', options: [
    { value: 'regularly', label_key: 'expansion.opt_regularly' },
    { value: 'sometimes', label_key: 'expansion.opt_sometimes' },
    { value: 'rarely', label_key: 'expansion.opt_rarely' },
  ]},
  { id: 'lang_think', section: 'language', type: 'single', title_key: 'expansion.q_think_second', options: [
    { value: 'often', label_key: 'expansion.opt_often' },
    { value: 'occasionally', label_key: 'expansion.opt_occasionally' },
    { value: 'never', label_key: 'expansion.opt_never' },
  ]},
  { id: 'lang_switch', section: 'language', type: 'single', title_key: 'expansion.q_switch_lang', options: [
    { value: 'comfortably', label_key: 'expansion.opt_comfortably' },
    { value: 'sometimes', label_key: 'expansion.opt_sometimes' },
    { value: 'never', label_key: 'expansion.opt_never' },
  ]},

  // Section 4 — Philosophical & Systems Thinking
  { id: 'phil_beliefs', section: 'philosophical', type: 'single', title_key: 'expansion.q_beliefs', options: [
    { value: 'frequently', label_key: 'expansion.opt_frequently' },
    { value: 'sometimes', label_key: 'expansion.opt_sometimes' },
    { value: 'rarely', label_key: 'expansion.opt_rarely' },
  ]},
  { id: 'phil_reading', section: 'philosophical', type: 'single', title_key: 'expansion.q_phil_reading', options: [
    { value: 'weekly', label_key: 'expansion.opt_weekly' },
    { value: 'monthly', label_key: 'expansion.opt_monthly' },
    { value: 'rarely', label_key: 'expansion.opt_rarely' },
  ]},
  { id: 'phil_opposing', section: 'philosophical', type: 'single', title_key: 'expansion.q_opposing', options: [
    { value: 'yes', label_key: 'expansion.opt_yes' },
    { value: 'partially', label_key: 'expansion.opt_partially' },
    { value: 'no', label_key: 'expansion.opt_no' },
  ]},
  { id: 'phil_journal', section: 'philosophical', type: 'single', title_key: 'expansion.q_journaling', options: [
    { value: 'daily', label_key: 'expansion.opt_daily' },
    { value: 'weekly', label_key: 'expansion.opt_weekly' },
    { value: 'rarely', label_key: 'expansion.opt_rarely' },
  ]},
  { id: 'phil_systems', section: 'philosophical', type: 'single', title_key: 'expansion.q_systems', options: [
    { value: 'often', label_key: 'expansion.opt_often' },
    { value: 'occasionally', label_key: 'expansion.opt_occasionally' },
    { value: 'not_consciously', label_key: 'expansion.opt_not_consciously' },
  ]},
];

export default function ExpansionAssess() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { saveAssessment } = useExpansionCoach();

  const [phase, setPhase] = useState<'intro' | 'flow' | 'saving'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [direction, setDirection] = useState(1);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;

  const totalQ = QUESTIONS.length;
  const currentQ = QUESTIONS[currentIdx];
  const pct = Math.round(((currentIdx + 1) / totalQ) * 100);
  const currentSectionMeta = currentQ ? SECTION_META.find(s => s.id === currentQ.section) : null;
  const isSubStart = currentIdx === 0 || QUESTIONS[currentIdx - 1]?.section !== currentQ?.section;

  const buildStructuredAnswers = useCallback((): ExpansionIntakeAnswers => {
    const a = answers;
    return {
      learning: {
        hours_per_week: a.learn_hours != null ? parseFloat(a.learn_hours) : undefined,
        learning_types: a.learn_types ?? [],
        retention: a.learn_retention ?? '',
        implementation: a.learn_implementation ?? '',
        synthesis: a.learn_synthesis ?? '',
      },
      creative: {
        output_types: a.create_types ?? [],
        pieces_per_week: a.create_weekly != null ? parseFloat(a.create_weekly) : undefined,
        public_exposure: a.create_exposure ?? '',
        iteration_cycle: a.create_iteration ?? '',
        idea_generation: a.create_ideas ?? '',
      },
      language: {
        active_languages: a.lang_active ?? [],
        non_native_fluency: a.lang_fluency ?? '',
        complex_content_non_native: a.lang_complex ?? '',
        think_in_second_language: a.lang_think ?? '',
        switch_languages: a.lang_switch ?? '',
      },
      philosophical: {
        question_beliefs: a.phil_beliefs ?? '',
        read_philosophy: a.phil_reading ?? '',
        hold_opposing_views: a.phil_opposing ?? '',
        journaling_frequency: a.phil_journal ?? '',
        systems_thinking: a.phil_systems ?? '',
      },
    };
  }, [answers]);

  const handleNext = useCallback(async () => {
    setDirection(1);
    if (currentIdx < totalQ - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setPhase('saving');
      try {
        const structured = buildStructuredAnswers();
        const result = buildExpansionAssessment(structured);
        await saveAssessment(result);
        navigate('/life/expansion/results');
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

  const setAnswer = useCallback((qId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }, []);

  const toggleMulti = useCallback((qId: string, val: string) => {
    setAnswers(prev => {
      const current: string[] = prev[qId] ?? [];
      if (val === 'none') return { ...prev, [qId]: ['none'] };
      const filtered = current.filter(v => v !== 'none');
      return { ...prev, [qId]: filtered.includes(val) ? filtered.filter(v => v !== val) : [...filtered, val] };
    });
  }, []);

  if (phase === 'intro') {
    const chips = ['expansion.chip_learning', 'expansion.chip_creative', 'expansion.chip_language', 'expansion.chip_philosophy'];
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Brain className="w-14 h-14 text-indigo-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-foreground mb-2">{t('expansion.introTitle')}</h1>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{t('expansion.introSubtitle')}</p>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {chips.map(c => (
                <Badge key={c} variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30">{t(c)}</Badge>
              ))}
            </div>
            <Button onClick={() => setPhase('flow')} className="bg-indigo-600 hover:bg-indigo-700" size="lg">
              {t('expansion.begin')} <ForwardIcon className="w-4 h-4 ms-1" />
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
          <Brain className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="ms-2 text-sm text-muted-foreground">{t('common.saving')}</span>
        </div>
      </PageShell>
    );
  }

  const isLast = currentIdx === totalQ - 1;
  const currentVal = answers[currentQ.id];
  const canProceed =
    currentQ.type === 'multi' ? (currentVal as string[] ?? []).length > 0
    : currentQ.type === 'numeric' ? true
    : !!currentVal;

  return (
    <PageShell>
      <div className="space-y-5 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {currentSectionMeta && <span className="text-lg">{currentSectionMeta.emoji}</span>}
              <div>
                <p className="text-xs text-muted-foreground">{currentSectionMeta ? t(currentSectionMeta.label_key) : ''}</p>
                <span className="text-xs text-muted-foreground">{currentIdx + 1}/{totalQ}</span>
              </div>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden" dir="ltr">
            <motion.div className="h-full rounded-full bg-indigo-500" initial={false}
              animate={{ width: `${pct}%` }} transition={{ duration: 0.3, ease: 'easeOut' }} />
          </div>
        </div>

        {isSubStart && currentSectionMeta && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-center">
            <span className="text-lg me-2">{currentSectionMeta.emoji}</span>
            <span className="text-sm font-semibold text-foreground">{t(currentSectionMeta.label_key)}</span>
          </motion.div>
        )}

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
                      ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}>
                  <span className="text-sm font-medium text-foreground">{t(opt.label_key)}</span>
                  {currentVal === opt.value && <Check className="w-4 h-4 text-indigo-500 shrink-0" />}
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
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                        : 'border-border bg-card hover:bg-muted/50'
                    )}>
                    <span className="text-sm font-medium text-foreground">{t(opt.label_key)}</span>
                    {selected && <Check className="w-4 h-4 text-indigo-500 shrink-0" />}
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
            </div>
          </motion.div>
        </AnimatePresence>

        <Button onClick={handleNext} disabled={!canProceed && currentQ.type !== 'numeric'}
          className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
          {isLast ? t('expansion.computeResults') : t('common.next')}
          <ForwardIcon className="w-4 h-4 ms-1" />
        </Button>

        {currentQ.type === 'numeric' && !isLast && (
          <button type="button" onClick={handleNext}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
            {t('common.skip') ?? 'Skip'}
          </button>
        )}
      </div>
    </PageShell>
  );
}
