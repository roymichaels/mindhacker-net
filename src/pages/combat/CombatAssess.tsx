/**
 * @page CombatAssess (/life/combat/assess)
 * Hybrid warrior capability intake — multi-section guided flow.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useCombatCoach } from '@/hooks/useCombatCoach';
import { buildCombatAssessment } from '@/lib/combat/scoring';
import { cn } from '@/lib/utils';
import type {
  CombatIntakeAnswers, WarriorMode, CombatDiscipline, ProfileAnswers,
  RealityAnswers, ShadowAnswers, LiveAnswers, GrapplingAnswers,
  ReactionAnswers, ConditioningAnswers, DurabilityAnswers,
} from '@/lib/combat/types';
import { GRAPPLING_DISCIPLINES } from '@/lib/combat/types';
import {
  ArrowLeft, ArrowRight, Swords, ChevronRight, ChevronLeft,
  Zap, Shield, Target, Flame, Brain, Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SectionId = 'intro' | 'profile' | 'reality' | 'shadow' | 'live' | 'grappling' | 'reaction' | 'conditioning' | 'durability';

const SECTION_ICONS: Record<string, any> = {
  profile: Target,
  reality: Activity,
  shadow: Zap,
  live: Flame,
  grappling: Shield,
  reaction: Brain,
  conditioning: Flame,
  durability: Shield,
};

export default function CombatAssess() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { saveAssessment, saveDraft, config } = useCombatCoach();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;

  const [answers, setAnswers] = useState<CombatIntakeAnswers>(
    () => (config.draft_answers as CombatIntakeAnswers) ?? {}
  );
  const [currentSection, setCurrentSection] = useState<SectionId>('intro');
  const [isSaving, setIsSaving] = useState(false);

  const mode = answers.profile?.warrior_mode;
  const disciplines = answers.profile?.disciplines ?? [];
  const hasGrappling = disciplines.some(d => GRAPPLING_DISCIPLINES.includes(d));
  const showLive = mode === 'gym' || mode === 'hybrid';

  const sections: SectionId[] = (() => {
    const s: SectionId[] = ['intro', 'profile', 'reality', 'shadow'];
    if (showLive) s.push('live');
    if (hasGrappling) s.push('grappling');
    s.push('reaction', 'conditioning', 'durability');
    return s;
  })();

  
  const currentIdx = sections.indexOf(currentSection);
  const totalSections = sections.filter(s => s !== 'intro').length;
  const progressIdx = Math.max(0, currentIdx - 1);

  const patch = (key: keyof CombatIntakeAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: { ...(prev[key] as any ?? {}), ...value } }));
  };

  const goNext = async () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < sections.length) {
      setCurrentSection(sections[nextIdx]);
      // Debounced draft save
      try { await saveDraft(answers); } catch { /* silent */ }
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) setCurrentSection(sections[currentIdx - 1]);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const result = buildCombatAssessment(answers);
      await saveAssessment(result);
      navigate('/life/combat/results');
    } catch {
      setIsSaving(false);
    }
  };

  const isLast = currentIdx === sections.length - 1;

  return (
    <PageShell>
      <div className="space-y-4 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => currentIdx === 0 ? navigate('/life/combat') : goPrev()}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Swords className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-lg font-bold text-foreground">{t('combat.title')}</h1>
          </div>
          {currentSection !== 'intro' && (
            <Badge variant="secondary" className="text-xs">
              {progressIdx + 1}/{totalSections}
            </Badge>
          )}
        </div>

        {/* Progress bar */}
        {currentSection !== 'intro' && (
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${((progressIdx + 1) / totalSections) * 100}%` }} />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={currentSection}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentSection === 'intro' && <IntroSection t={t} onBegin={goNext} ForwardIcon={ForwardIcon} />}
            {currentSection === 'profile' && <ProfileSection t={t} answers={answers} patch={patch} onNext={goNext} />}
            {currentSection === 'reality' && <RealitySection t={t} answers={answers} patch={patch} onNext={goNext} isRTL={isRTL} />}
            {currentSection === 'shadow' && <ShadowSection t={t} answers={answers} patch={patch} onNext={goNext} />}
            {currentSection === 'live' && <LiveSection t={t} answers={answers} patch={patch} onNext={goNext} />}
            {currentSection === 'grappling' && <GrapplingSection t={t} answers={answers} patch={patch} onNext={goNext} />}
            {currentSection === 'reaction' && <ReactionSection t={t} answers={answers} patch={patch} onNext={goNext} />}
            {currentSection === 'conditioning' && <ConditioningSection t={t} answers={answers} patch={patch} onNext={goNext} />}
            {currentSection === 'durability' && (
              <DurabilitySection t={t} answers={answers} patch={patch}
                onSubmit={handleSubmit} isSaving={isSaving} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </PageShell>
  );
}

/* ─── Shared UI helpers ─── */

function SectionHeader({ icon: Icon, titleKey, t }: { icon: any; titleKey: string; t: (k: string) => string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-primary" />
      <h2 className="text-base font-bold text-foreground">{t(titleKey)}</h2>
    </div>
  );
}

function OptionButton({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-lg border text-sm font-medium transition-all text-start",
        selected
          ? "bg-primary/15 border-primary/50 text-primary"
          : "bg-background border-border/50 text-foreground hover:bg-muted/50"
      )}
    >
      {label}
    </button>
  );
}

function MultiSelectChips({ options, selected, onToggle, t }: {
  options: { id: string; labelKey: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  t: (k: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          onClick={() => onToggle(o.id)}
          className={cn(
            "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
            selected.includes(o.id)
              ? "bg-primary/15 border-primary/50 text-primary"
              : "bg-background border-border/50 text-muted-foreground hover:bg-muted/50"
          )}
        >
          {t(o.labelKey)}
        </button>
      ))}
    </div>
  );
}

function QuestionLabel({ text }: { text: string }) {
  return <p className="text-sm font-medium text-foreground mb-2">{text}</p>;
}

function NumericInput({ value, onChange, placeholder }: { value?: number; onChange: (v: number | undefined) => void; placeholder?: string }) {
  return (
    <Input
      type="number"
      inputMode="numeric"
      min={0}
      value={value ?? ''}
      onChange={e => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
      placeholder={placeholder}
      className="max-w-[120px]"
    />
  );
}

/* ─── Intro ─── */

function IntroSection({ t, onBegin, ForwardIcon }: { t: (k: string) => string; onBegin: () => void; ForwardIcon: any }) {
  return (
    <Card className="p-6 text-center border-border/40 bg-gradient-to-b from-muted/20 to-transparent">
      <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-xl font-black text-foreground mb-2">{t('combat.introTitle')}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t('combat.introSubtitle')}</p>
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {['combat.chip_striking', 'combat.chip_grappling', 'combat.chip_reaction', 'combat.chip_conditioning', 'combat.chip_durability', 'combat.chip_tactical'].map(k => (
          <Badge key={k} variant="secondary" className="text-xs">{t(k)}</Badge>
        ))}
      </div>
      <Button size="lg" onClick={onBegin}>
        {t('combat.beginScan')} <ForwardIcon className="w-4 h-4 ms-1" />
      </Button>
    </Card>
  );
}

/* ─── Profile (Step 0) ─── */

function ProfileSection({ t, answers, patch, onNext }: { t: (k: string) => string; answers: CombatIntakeAnswers; patch: any; onNext: () => void }) {
  const mode = answers.profile?.warrior_mode;
  const disciplines = answers.profile?.disciplines ?? [];
  const years = answers.profile?.years_training;

  const modes: { id: WarriorMode; labelKey: string; descKey: string }[] = [
    { id: 'solo', labelKey: 'combat.mode_solo', descKey: 'combat.mode_solo_desc' },
    { id: 'gym', labelKey: 'combat.mode_gym', descKey: 'combat.mode_gym_desc' },
    { id: 'hybrid', labelKey: 'combat.mode_hybrid', descKey: 'combat.mode_hybrid_desc' },
    { id: 'tactical', labelKey: 'combat.mode_tactical', descKey: 'combat.mode_tactical_desc' },
  ];

  const allDisciplines: { id: CombatDiscipline; labelKey: string }[] = [
    { id: 'boxing', labelKey: 'combat.disc_boxing' },
    { id: 'muay_thai', labelKey: 'combat.disc_muay_thai' },
    { id: 'kickboxing', labelKey: 'combat.disc_kickboxing' },
    { id: 'bjj', labelKey: 'combat.disc_bjj' },
    { id: 'wrestling', labelKey: 'combat.disc_wrestling' },
    { id: 'judo', labelKey: 'combat.disc_judo' },
    { id: 'krav_maga', labelKey: 'combat.disc_krav_maga' },
    { id: 'kung_fu', labelKey: 'combat.disc_kung_fu' },
    { id: 'military_training', labelKey: 'combat.disc_military_training' },
    { id: 'mma', labelKey: 'combat.disc_mma' },
    { id: 'none', labelKey: 'combat.disc_none' },
  ];

  const toggleDiscipline = (d: CombatDiscipline) => {
    if (d === 'none') {
      patch('profile', { ...answers.profile, disciplines: ['none'] });
    } else {
      const current = disciplines.filter(x => x !== 'none');
      const next = current.includes(d) ? current.filter(x => x !== d) : [...current, d];
      patch('profile', { ...answers.profile, disciplines: next });
    }
  };

  const yearsOptions = [
    { id: 'none', labelKey: 'combat.opt_years_none' },
    { id: '<1', labelKey: 'combat.opt_years_lt1' },
    { id: '1_3', labelKey: 'combat.opt_years_1_3' },
    { id: '3_5', labelKey: 'combat.opt_years_3_5' },
    { id: '5_plus', labelKey: 'combat.opt_years_5_plus' },
  ];

  const canContinue = !!mode && disciplines.length > 0;

  return (
    <Card className="p-5 border-border/40">
      <SectionHeader icon={Target} titleKey="combat.sec_profile" t={t} />

      {/* Warrior mode */}
      <QuestionLabel text={t('combat.q_warrior_mode')} />
      <div className="space-y-2 mb-5">
        {modes.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => patch('profile', { ...answers.profile, warrior_mode: m.id })}
            className={cn(
              "w-full text-start p-3 rounded-lg border transition-all",
              mode === m.id
                ? "bg-primary/15 border-primary/50"
                : "bg-background border-border/50 hover:bg-muted/50"
            )}
          >
            <p className={cn("text-sm font-medium", mode === m.id ? "text-primary" : "text-foreground")}>{t(m.labelKey)}</p>
            <p className="text-xs text-muted-foreground">{t(m.descKey)}</p>
          </button>
        ))}
      </div>

      {/* Disciplines */}
      <QuestionLabel text={t('combat.q_disciplines')} />
      <div className="flex flex-wrap gap-2 mb-5">
        {allDisciplines.map(d => (
          <button
            key={d.id}
            type="button"
            onClick={() => toggleDiscipline(d.id)}
            className={cn(
              "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
              disciplines.includes(d.id)
                ? "bg-primary/15 border-primary/50 text-primary"
                : "bg-background border-border/50 text-muted-foreground hover:bg-muted/50"
            )}
          >
            {t(d.labelKey)}
          </button>
        ))}
      </div>

      {/* Years of training */}
      <QuestionLabel text={t('combat.q_years_training')} />
      <div className="grid grid-cols-2 gap-2 mb-4">
        {yearsOptions.map(y => (
          <OptionButton key={y.id} selected={years === y.id} label={t(y.labelKey)}
            onClick={() => patch('profile', { ...answers.profile, years_training: y.id })} />
        ))}
      </div>

      <Button className="w-full mt-4" onClick={onNext} disabled={!canContinue}>
        {t('common.next')}
      </Button>
    </Card>
  );
}

/* ─── Reality (Section 1) ─── */

function RealitySection({ t, answers, patch, onNext, isRTL }: { t: (k: string) => string; answers: CombatIntakeAnswers; patch: any; onNext: () => void; isRTL: boolean }) {
  const r = answers.reality ?? {};
  const showSparring = answers.profile?.warrior_mode !== 'solo' && (r.solo_vs_live_pct ?? 100) < 100;

  return (
    <Card className="p-5 border-border/40">
      <SectionHeader icon={Activity} titleKey="combat.sec_reality" t={t} />

      <div className="space-y-5">
        <div>
          <QuestionLabel text={t('combat.q_sessions_week')} />
          <NumericInput value={r.sessions_per_week} onChange={v => patch('reality', { ...r, sessions_per_week: v })} />
        </div>
        <div>
          <QuestionLabel text={t('combat.q_sessions_30d')} />
          <NumericInput value={r.sessions_last_30} onChange={v => patch('reality', { ...r, sessions_last_30: v })} />
        </div>
        <div>
          <QuestionLabel text={t('combat.q_solo_vs_live')} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{t('combat.live_label')}</span>
            <Slider
              value={[r.solo_vs_live_pct ?? 100]}
              onValueChange={([v]) => patch('reality', { ...r, solo_vs_live_pct: v })}
              min={0} max={100} step={5}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">{t('combat.solo_label')}</span>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">{r.solo_vs_live_pct ?? 100}% {t('combat.solo_label')}</p>
        </div>

        {showSparring && (
          <div>
            <QuestionLabel text={t('combat.q_sparring_depth')} />
            <div className="grid grid-cols-2 gap-2">
              {['weekly', 'biweekly', 'monthly', 'rarely'].map(o => (
                <OptionButton key={o} selected={r.sparring_depth_freq === o}
                  label={t(`combat.opt_${o}`)} onClick={() => patch('reality', { ...r, sparring_depth_freq: o })} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Button className="w-full mt-4" onClick={onNext}>{t('common.next')}</Button>
    </Card>
  );
}

/* ─── Shadow / Solo Engine (Section 2) ─── */

function ShadowSection({ t, answers, patch, onNext }: { t: (k: string) => string; answers: CombatIntakeAnswers; patch: any; onNext: () => void }) {
  const sh = answers.shadow ?? {};
  const format = sh.shadow_format;

  return (
    <Card className="p-5 border-border/40">
      <SectionHeader icon={Zap} titleKey="combat.sec_shadow" t={t} />

      <div className="space-y-5">
        <div>
          <QuestionLabel text={t('combat.q_shadow_format')} />
          <div className="grid grid-cols-3 gap-2">
            {['structured', 'continuous', 'mixed'].map(o => (
              <OptionButton key={o} selected={format === o} label={t(`combat.opt_${o}`)}
                onClick={() => patch('shadow', { ...sh, shadow_format: o })} />
            ))}
          </div>
        </div>

        {format === 'structured' && (
          <>
            <div>
              <QuestionLabel text={t('combat.q_round_length')} />
              <div className="flex gap-2">
                {['2min', '3min', '5min'].map(o => (
                  <OptionButton key={o} selected={sh.round_length === o} label={o}
                    onClick={() => patch('shadow', { ...sh, round_length: o })} />
                ))}
              </div>
            </div>
            <div>
              <QuestionLabel text={t('combat.q_rest_length')} />
              <div className="flex gap-2">
                {['0:30', '1:00', '2:00'].map(o => (
                  <OptionButton key={o} selected={sh.rest_length === o} label={o}
                    onClick={() => patch('shadow', { ...sh, rest_length: o })} />
                ))}
              </div>
            </div>
            <div>
              <QuestionLabel text={t('combat.q_rounds_per_session')} />
              <NumericInput value={sh.rounds_per_session} onChange={v => patch('shadow', { ...sh, rounds_per_session: v })} />
            </div>
            <div>
              <QuestionLabel text={t('combat.q_rpe_last_2')} />
              <div className="flex items-center gap-3">
                <Slider value={[sh.rpe_last_2 ?? 5]} onValueChange={([v]) => patch('shadow', { ...sh, rpe_last_2: v })}
                  min={1} max={10} step={1} className="flex-1" />
                <span className="text-sm font-bold text-foreground w-6 text-center">{sh.rpe_last_2 ?? 5}</span>
              </div>
            </div>
            <div>
              <QuestionLabel text={t('combat.q_tech_complexity')} />
              <div className="grid grid-cols-2 gap-2">
                {['basic', '3_4_combo', 'angles_defense', 'fluid_freestyle'].map(o => (
                  <OptionButton key={o} selected={sh.tech_complexity_fatigue === o}
                    label={t(`combat.opt_${o}`)} onClick={() => patch('shadow', { ...sh, tech_complexity_fatigue: o })} />
                ))}
              </div>
            </div>
          </>
        )}

        {format === 'continuous' && (
          <>
            <div>
              <QuestionLabel text={t('combat.q_minutes_degrade')} />
              <NumericInput value={sh.minutes_before_degrade} onChange={v => patch('shadow', { ...sh, minutes_before_degrade: v })} />
            </div>
            <div>
              <QuestionLabel text={t('combat.q_continuous_rpe')} />
              <div className="flex items-center gap-3">
                <Slider value={[sh.continuous_rpe ?? 5]} onValueChange={([v]) => patch('shadow', { ...sh, continuous_rpe: v })}
                  min={1} max={10} step={1} className="flex-1" />
                <span className="text-sm font-bold text-foreground w-6 text-center">{sh.continuous_rpe ?? 5}</span>
              </div>
            </div>
            <div>
              <QuestionLabel text={t('combat.q_continuous_complexity')} />
              <div className="grid grid-cols-2 gap-2">
                {['basic', '3_4_combo', 'angles_defense', 'fluid_freestyle'].map(o => (
                  <OptionButton key={o} selected={sh.continuous_complexity === o}
                    label={t(`combat.opt_${o}`)} onClick={() => patch('shadow', { ...sh, continuous_complexity: o })} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Common shadow questions */}
        <div className="space-y-3 pt-2 border-t border-border/30">
          {[
            { key: 'uses_bands', qKey: 'combat.q_bands' },
            { key: 'films_self', qKey: 'combat.q_films' },
            { key: 'trains_defense_shadow', qKey: 'combat.q_defense_shadow' },
          ].map(({ key, qKey }) => (
            <div key={key} className="flex items-center justify-between">
              <p className="text-sm text-foreground">{t(qKey)}</p>
              <div className="flex gap-2">
                <OptionButton selected={(sh as any)[key] === true} label={t('common.yes')}
                  onClick={() => patch('shadow', { ...sh, [key]: true })} />
                <OptionButton selected={(sh as any)[key] === false} label={t('common.no')}
                  onClick={() => patch('shadow', { ...sh, [key]: false })} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full mt-4" onClick={onNext}>{t('common.next')}</Button>
    </Card>
  );
}

/* ─── Live Experience (Section 3) ─── */

function LiveSection({ t, answers, patch, onNext }: { t: (k: string) => string; answers: CombatIntakeAnswers; patch: any; onNext: () => void }) {
  const l = answers.live ?? {};

  return (
    <Card className="p-5 border-border/40">
      <SectionHeader icon={Flame} titleKey="combat.sec_live" t={t} />
      <p className="text-xs text-muted-foreground mb-4 italic">{t('combat.live_definition')}</p>

      <div className="space-y-5">
        <div>
          <QuestionLabel text={t('combat.q_sparring_30d')} />
          <NumericInput value={l.sparring_sessions_30d} onChange={v => patch('live', { ...l, sparring_sessions_30d: v })} />
        </div>
        <div>
          <QuestionLabel text={t('combat.q_intensity')} />
          <div className="grid grid-cols-3 gap-2">
            {['light', 'moderate', 'hard'].map(o => (
              <OptionButton key={o} selected={l.intensity_level === o}
                label={t(`combat.opt_${o}`)} onClick={() => patch('live', { ...l, intensity_level: o })} />
            ))}
          </div>
        </div>
        <div>
          <QuestionLabel text={t('combat.q_panic')} />
          <div className="grid grid-cols-3 gap-2">
            {['rarely', 'sometimes', 'often'].map(o => (
              <OptionButton key={o} selected={l.panic_under_pressure === o}
                label={t(`combat.opt_${o}`)} onClick={() => patch('live', { ...l, panic_under_pressure: o })} />
            ))}
          </div>
        </div>
        <div>
          <QuestionLabel text={t('combat.q_breath_rounds')} />
          <div className="grid grid-cols-3 gap-2">
            {['controlled', 'partially', 'lose_control'].map(o => (
              <OptionButton key={o} selected={l.breath_through_rounds === o}
                label={t(`combat.opt_${o}`)} onClick={() => patch('live', { ...l, breath_through_rounds: o })} />
            ))}
          </div>
        </div>
      </div>

      <Button className="w-full mt-4" onClick={onNext}>{t('common.next')}</Button>
    </Card>
  );
}

/* ─── Grappling (Section 4) ─── */

function GrapplingSection({ t, answers, patch, onNext }: { t: (k: string) => string; answers: CombatIntakeAnswers; patch: any; onNext: () => void }) {
  const g = answers.grappling ?? {};

  return (
    <Card className="p-5 border-border/40">
      <SectionHeader icon={Shield} titleKey="combat.sec_grappling" t={t} />

      <div className="space-y-5">
        <div>
          <QuestionLabel text={t('combat.q_lifetime_rolling')} />
          <div className="grid grid-cols-2 gap-2">
            {['0', '1_10', '10_50', '50_200', '200_plus'].map(o => (
              <OptionButton key={o} selected={g.lifetime_rolling_hours === o}
                label={t(`combat.opt_rolling_${o}`)} onClick={() => patch('grappling', { ...g, lifetime_rolling_hours: o })} />
            ))}
          </div>
        </div>
        <div>
          <QuestionLabel text={t('combat.q_rolling_freq')} />
          <div className="grid grid-cols-2 gap-2">
            {['none', 'monthly', 'weekly', '2x_weekly'].map(o => (
              <OptionButton key={o} selected={g.rolling_freq_12mo === o}
                label={t(`combat.opt_${o}`)} onClick={() => patch('grappling', { ...g, rolling_freq_12mo: o })} />
            ))}
          </div>
        </div>
        <div>
          <QuestionLabel text={t('combat.q_mount_escape')} />
          <div className="grid grid-cols-3 gap-2">
            {['yes', 'sometimes', 'no'].map(o => (
              <OptionButton key={o} selected={g.escape_mount === o}
                label={t(`common.${o === 'sometimes' ? 'yes' : o}`) || t(`combat.opt_${o}`)}
                onClick={() => patch('grappling', { ...g, escape_mount: o })} />
            ))}
          </div>
        </div>
        <div>
          <QuestionLabel text={t('combat.q_sprawl')} />
          <div className="grid grid-cols-3 gap-2">
            {['yes', 'sometimes', 'no'].map(o => (
              <OptionButton key={o} selected={g.sprawl_instinct === o}
                label={t(`combat.opt_${o}`)}
                onClick={() => patch('grappling', { ...g, sprawl_instinct: o })} />
            ))}
          </div>
        </div>
      </div>

      <Button className="w-full mt-4" onClick={onNext}>{t('common.next')}</Button>
    </Card>
  );
}

/* ─── Reaction (Section 5) ─── */

function ReactionSection({ t, answers, patch, onNext }: { t: (k: string) => string; answers: CombatIntakeAnswers; patch: any; onNext: () => void }) {
  const r = answers.reaction ?? {};

  return (
    <Card className="p-5 border-border/40">
      <SectionHeader icon={Brain} titleKey="combat.sec_reaction" t={t} />

      <div className="space-y-5">
        <div>
          <QuestionLabel text={t('combat.q_surprise')} />
          <div className="grid grid-cols-3 gap-2">
            {['composed', 'tense', 'freeze'].map(o => (
              <OptionButton key={o} selected={r.surprise_response === o}
                label={t(`combat.opt_${o}`)} onClick={() => patch('reaction', { ...r, surprise_response: o })} />
            ))}
          </div>
        </div>
        <div>
          <QuestionLabel text={t('combat.q_drill_freq')} />
          <div className="grid grid-cols-2 gap-2">
            {['0', '1_2', '3_4', '5_plus'].map(o => (
              <OptionButton key={o} selected={r.reaction_drill_freq === o}
                label={t(`combat.opt_drill_${o}`)} onClick={() => patch('reaction', { ...r, reaction_drill_freq: o })} />
            ))}
          </div>
        </div>
        <div>
          <QuestionLabel text={t('combat.q_scans')} />
          <div className="grid grid-cols-3 gap-2">
            {['yes_always', 'sometimes', 'rarely'].map(o => (
              <OptionButton key={o} selected={r.scans_environment === o}
                label={t(`combat.opt_${o}`)} onClick={() => patch('reaction', { ...r, scans_environment: o })} />
            ))}
          </div>
        </div>
      </div>

      <Button className="w-full mt-4" onClick={onNext}>{t('common.next')}</Button>
    </Card>
  );
}

/* ─── Conditioning (Section 6) ─── */

function ConditioningSection({ t, answers, patch, onNext }: { t: (k: string) => string; answers: CombatIntakeAnswers; patch: any; onNext: () => void }) {
  const c = answers.conditioning ?? {};

  return (
    <Card className="p-5 border-border/40">
      <SectionHeader icon={Flame} titleKey="combat.sec_conditioning" t={t} />

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <QuestionLabel text={t('combat.q_pushups')} />
            <NumericInput value={c.max_pushups} onChange={v => patch('conditioning', { ...c, max_pushups: v })} />
          </div>
          <div>
            <QuestionLabel text={t('combat.q_pullups')} />
            <NumericInput value={c.max_pullups} onChange={v => patch('conditioning', { ...c, max_pullups: v })} />
          </div>
          <div>
            <QuestionLabel text={t('combat.q_squats')} />
            <NumericInput value={c.max_air_squats} onChange={v => patch('conditioning', { ...c, max_air_squats: v })} />
          </div>
        </div>
        <div>
          <QuestionLabel text={t('combat.q_six_rounds')} />
          <div className="grid grid-cols-3 gap-2">
            {['yes', 'barely', 'no'].map(o => (
              <OptionButton key={o} selected={c.six_rounds_shadow === o}
                label={t(`combat.opt_${o}`)} onClick={() => patch('conditioning', { ...c, six_rounds_shadow: o })} />
            ))}
          </div>
        </div>
        <div>
          <QuestionLabel text={t('combat.q_sprint')} />
          <div className="grid grid-cols-2 gap-2">
            {['explosive', 'moderate', 'slow', 'unknown'].map(o => (
              <OptionButton key={o} selected={c.sprint_capacity === o}
                label={t(`combat.opt_${o}`)} onClick={() => patch('conditioning', { ...c, sprint_capacity: o })} />
            ))}
          </div>
        </div>
      </div>

      <Button className="w-full mt-4" onClick={onNext}>{t('common.next')}</Button>
    </Card>
  );
}

/* ─── Durability (Section 7 — last) ─── */

function DurabilitySection({ t, answers, patch, onSubmit, isSaving }: {
  t: (k: string) => string; answers: CombatIntakeAnswers; patch: any;
  onSubmit: () => void; isSaving: boolean;
}) {
  const d = answers.durability ?? {};
  const flags = d.injury_flags ?? [];

  const toggleFlag = (f: string) => {
    if (f === 'none') {
      patch('durability', { ...d, injury_flags: ['none'] });
    } else {
      const next = flags.includes(f) ? flags.filter(x => x !== f) : [...flags.filter(x => x !== 'none'), f];
      patch('durability', { ...d, injury_flags: next });
    }
  };

  return (
    <Card className="p-5 border-border/40">
      <SectionHeader icon={Shield} titleKey="combat.sec_durability" t={t} />

      <div className="space-y-5">
        <div>
          <QuestionLabel text={t('combat.q_impact_cond')} />
          <div className="grid grid-cols-3 gap-2">
            {['shin', 'knuckle', 'none'].map(o => (
              <OptionButton key={o} selected={d.impact_conditioning === o}
                label={t(`combat.opt_${o}`)} onClick={() => patch('durability', { ...d, impact_conditioning: o })} />
            ))}
          </div>
        </div>
        <div>
          <QuestionLabel text={t('combat.q_injury_flags')} />
          <div className="flex flex-wrap gap-2">
            {['wrist', 'shoulder', 'knee', 'back', 'none'].map(f => (
              <button key={f} type="button" onClick={() => toggleFlag(f)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                  flags.includes(f)
                    ? "bg-primary/15 border-primary/50 text-primary"
                    : "bg-background border-border/50 text-muted-foreground hover:bg-muted/50"
                )}>
                {t(`combat.opt_injury_${f}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button className="w-full mt-4" onClick={onSubmit} disabled={isSaving}>
        {isSaving ? t('common.loading') : t('combat.submitAssessment')}
      </Button>
    </Card>
  );
}
