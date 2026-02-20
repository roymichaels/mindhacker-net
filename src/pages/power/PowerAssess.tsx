/**
 * @tab Life > Power > Assess
 * One-question-per-screen micro-flow assessment:
 * Step 0: Track selection
 * Step 1: Bodyweight
 * Step 2+: Individual questions per selected track modules
 * Final: Compute & save
 */
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { cn } from '@/lib/utils';
import {
  Dumbbell, ArrowLeft, ArrowRight, ChevronRight, ChevronLeft,
  Zap, Target, Shield, Activity, Check,
} from 'lucide-react';
import type {
  PowerTrackId, GymStrengthInput, CalConditioningInput,
  CalSkillsInput, ExplosivePowerInput, RepScheme, PowerDomainConfig,
} from '@/lib/power/types';
import { SKILL_LADDERS, type SkillName } from '@/lib/power/ladders';
import {
  scoreGymStrength, scoreCalConditioning, scoreCalSkills,
  scoreExplosivePower, buildPowerAssessment,
} from '@/lib/power/scoring';
import type { ModuleScore } from '@/lib/power/types';
import { motion, AnimatePresence } from 'framer-motion';

const TRACK_META: { id: PowerTrackId; icon: typeof Dumbbell; color: string }[] = [
  { id: 'gym_strength', icon: Dumbbell, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  { id: 'calisthenics_conditioning', icon: Target, color: 'text-orange-500 bg-orange-500/10 border-orange-500/30' },
  { id: 'calisthenics_skills', icon: Shield, color: 'text-violet-500 bg-violet-500/10 border-violet-500/30' },
  { id: 'explosive_power', icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  { id: 'general_athleticism', icon: Activity, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
];

const REP_SCHEMES: RepScheme[] = ['1rm', '5rm', '8_12rm'];

/* ─── Micro-step definition for one-question-per-screen ─── */
interface MicroStep {
  id: string;
  module: string;
  type: 'rep_scheme' | 'lift' | 'number' | 'skill_ladder' | 'checkbox';
  liftKey?: 'squat' | 'deadlift' | 'bench' | 'ohp';
  numberKey?: string;
  skillKey?: SkillName;
  skillField?: keyof CalSkillsInput;
  placeholder?: string;
}

export default function PowerAssess() {
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();
  const { getDomain, upsertDomain } = useLifeDomains();

  const [selectedTracks, setSelectedTracks] = useState<PowerTrackId[]>([]);
  const [phase, setPhase] = useState<'select' | 'flow'>('select');
  const [microIndex, setMicroIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(1);

  const [bodyweight, setBodyweight] = useState<number | undefined>();
  const [gymInput, setGymInput] = useState<GymStrengthInput>({ repScheme: '1rm' });
  const [calCondInput, setCalCondInput] = useState<CalConditioningInput>({ weightedCalisthenics: false });
  const [calSkillInput, setCalSkillInput] = useState<CalSkillsInput>({
    handstand: 0, hspu: 0, planche: 0, frontLever: 0, backLever: 0, humanFlag: 0,
    muscleUp: 0, ringMuscleUp: 0, pistolSquat: 0, shrimpSquat: 0, nordicCurl: 0,
    vSit: 0, dragonFlag: 0, bridge: 0, elbowLever: 0,
  });
  const [explosiveInput, setExplosiveInput] = useState<ExplosivePowerInput>({});

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;

  const activeModules = useMemo(() => {
    const mods: PowerTrackId[] = [];
    if (selectedTracks.includes('gym_strength') || selectedTracks.includes('general_athleticism')) mods.push('gym_strength');
    if (selectedTracks.includes('calisthenics_conditioning') || selectedTracks.includes('general_athleticism')) mods.push('calisthenics_conditioning');
    if (selectedTracks.includes('calisthenics_skills')) mods.push('calisthenics_skills');
    if (selectedTracks.includes('explosive_power') || selectedTracks.includes('general_athleticism')) mods.push('explosive_power');
    return [...new Set(mods)];
  }, [selectedTracks]);

  // Build flat micro-steps array
  const microSteps = useMemo<MicroStep[]>(() => {
    const steps: MicroStep[] = [];
    // Bodyweight
    steps.push({ id: 'bodyweight', module: 'general', type: 'number', numberKey: 'bodyweight', placeholder: 'kg' });

    for (const mod of activeModules) {
      if (mod === 'gym_strength') {
        steps.push({ id: 'rep_scheme', module: 'gym_strength', type: 'rep_scheme' });
        for (const lift of ['squat', 'deadlift', 'bench', 'ohp'] as const) {
          steps.push({ id: `lift_${lift}`, module: 'gym_strength', type: 'lift', liftKey: lift });
        }
      }
      if (mod === 'calisthenics_conditioning') {
        for (const key of ['maxPushups', 'maxPullups', 'maxDips', 'maxBwSquats'] as const) {
          steps.push({ id: `cal_${key}`, module: 'calisthenics_conditioning', type: 'number', numberKey: key });
        }
        steps.push({ id: 'cal_weighted', module: 'calisthenics_conditioning', type: 'checkbox' });
      }
      if (mod === 'calisthenics_skills') {
        const skills: { key: SkillName; field: keyof CalSkillsInput }[] = [
          { key: 'handstand', field: 'handstand' }, { key: 'hspu', field: 'hspu' },
          { key: 'planche', field: 'planche' }, { key: 'frontLever', field: 'frontLever' },
          { key: 'backLever', field: 'backLever' }, { key: 'humanFlag', field: 'humanFlag' },
          { key: 'muscleUp', field: 'muscleUp' }, { key: 'ringMuscleUp', field: 'ringMuscleUp' },
          { key: 'pistolSquat', field: 'pistolSquat' }, { key: 'shrimpSquat', field: 'shrimpSquat' },
          { key: 'nordicCurl', field: 'nordicCurl' }, { key: 'vSit', field: 'vSit' },
          { key: 'dragonFlag', field: 'dragonFlag' }, { key: 'bridge', field: 'bridge' },
          { key: 'elbowLever', field: 'elbowLever' },
        ];
        for (const s of skills) {
          steps.push({ id: `skill_${s.key}`, module: 'calisthenics_skills', type: 'skill_ladder', skillKey: s.key, skillField: s.field });
        }
      }
      if (mod === 'explosive_power') {
        steps.push({ id: 'exp_verticalJump', module: 'explosive_power', type: 'number', numberKey: 'verticalJumpCm', placeholder: 'cm' });
        steps.push({ id: 'exp_broadJump', module: 'explosive_power', type: 'number', numberKey: 'broadJumpCm', placeholder: 'cm' });
        steps.push({ id: 'exp_sprint20m', module: 'explosive_power', type: 'number', numberKey: 'sprint20mSeconds', placeholder: t('power.seconds') });
        steps.push({ id: 'exp_sprint40m', module: 'explosive_power', type: 'number', numberKey: 'sprint40mSeconds', placeholder: t('power.seconds') });
      }
    }
    return steps;
  }, [activeModules, t]);

  const totalMicro = microSteps.length;
  const pct = totalMicro > 0 ? Math.round(((microIndex + 1) / totalMicro) * 100) : 0;

  const toggleTrack = (id: PowerTrackId) => {
    setSelectedTracks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const goNext = useCallback(() => {
    setDirection(1);
    if (microIndex < totalMicro - 1) {
      setMicroIndex(i => i + 1);
    } else {
      handleSubmit();
    }
  }, [microIndex, totalMicro]);

  const goBack = useCallback(() => {
    setDirection(-1);
    if (microIndex > 0) setMicroIndex(i => i - 1);
    else setPhase('select');
  }, [microIndex]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const scores: ModuleScore[] = [];
      const gymWithBw = { ...gymInput, bodyweight };

      if (activeModules.includes('gym_strength')) scores.push(scoreGymStrength(gymWithBw));
      if (activeModules.includes('calisthenics_conditioning')) scores.push(scoreCalConditioning(calCondInput));
      if (activeModules.includes('calisthenics_skills')) scores.push(scoreCalSkills(calSkillInput));
      if (activeModules.includes('explosive_power')) scores.push(scoreExplosivePower(explosiveInput));

      const assessment = buildPowerAssessment(selectedTracks, scores);
      const row = getDomain('power');
      const existing = (row?.domain_config ?? {}) as unknown as PowerDomainConfig;
      const history = [...(existing.history ?? [])];
      if (existing.latest) history.push(existing.latest);

      const newConfig: PowerDomainConfig = {
        latest: assessment,
        history,
        completed: existing.completed ?? false,
        completed_at: existing.completed_at ?? null,
      };

      await upsertDomain.mutateAsync({
        domainId: 'power',
        config: newConfig as unknown as Record<string, any>,
        status: 'configured',
      });

      navigate('/life/power/results');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Phase: Track Selection ───
  if (phase === 'select') {
    return (
      <PageShell>
        <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/life/power')}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">{t('power.selectTitle')}</h1>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {TRACK_META.map(track => {
              const Icon = track.icon;
              const isSelected = selectedTracks.includes(track.id);
              return (
                <button
                  key={track.id} type="button" onClick={() => toggleTrack(track.id)}
                  className={cn(
                    'p-4 rounded-xl border text-start transition-all',
                    isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', track.color.split(' ').slice(1).join(' '))}>
                      <Icon className={cn('w-5 h-5', track.color.split(' ')[0])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-foreground">{t(`power.track_${track.id}`)}</p>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{t(`power.track_${track.id}_desc`)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <Button onClick={() => { setPhase('flow'); setMicroIndex(0); }} disabled={selectedTracks.length === 0}
            className="w-full bg-red-600 hover:bg-red-700" size="lg">
            {t('common.next')} <ForwardIcon className="w-4 h-4 ms-1" />
          </Button>
        </div>
      </PageShell>
    );
  }

  // ─── Phase: Micro-flow (one question per screen) ───
  const step = microSteps[microIndex];
  if (!step) return null;

  const isLast = microIndex === totalMicro - 1;

  // Get module label
  const getModuleLabel = (mod: string) => {
    if (mod === 'general') return t('power.bodyweightStep');
    return t(`power.track_${mod}`);
  };

  // Get question title
  const getTitle = (s: MicroStep) => {
    if (s.id === 'bodyweight') return t('power.bodyweight');
    if (s.type === 'rep_scheme') return t('power.howMeasure');
    if (s.type === 'lift' && s.liftKey) return t(`power.lift_${s.liftKey}`);
    if (s.type === 'skill_ladder' && s.skillKey) return t(`power.skill_${s.skillKey}`);
    if (s.type === 'checkbox') return t('power.weightedCal');
    if (s.numberKey === 'maxPushups') return t('power.maxPushups');
    if (s.numberKey === 'maxPullups') return t('power.maxPullups');
    if (s.numberKey === 'maxDips') return t('power.maxDips');
    if (s.numberKey === 'maxBwSquats') return t('power.maxBwSquats');
    if (s.numberKey === 'verticalJumpCm') return t('power.verticalJump');
    if (s.numberKey === 'broadJumpCm') return t('power.broadJump');
    if (s.numberKey === 'sprint20mSeconds') return t('power.sprint20m');
    if (s.numberKey === 'sprint40mSeconds') return t('power.sprint40m');
    return '';
  };

  const renderMicroStep = (s: MicroStep) => {
    switch (s.type) {
      case 'number': {
        if (s.id === 'bodyweight') {
          return (
            <div className="space-y-3">
              <Input type="number" inputMode="decimal" placeholder={s.placeholder ?? '—'}
                value={bodyweight ?? ''} dir="ltr" autoFocus
                onChange={e => setBodyweight(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                className="text-start text-lg h-12" />
              <p className="text-xs text-muted-foreground">{t('power.bodyweightNote')}</p>
            </div>
          );
        }
        // Cal conditioning numbers
        if (s.module === 'calisthenics_conditioning' && s.numberKey) {
          const key = s.numberKey as keyof CalConditioningInput;
          return (
            <Input type="number" inputMode="numeric" placeholder="—"
              value={calCondInput[key] as number ?? ''} dir="ltr" autoFocus
              onChange={e => setCalCondInput(p => ({ ...p, [key]: e.target.value === '' ? undefined : parseInt(e.target.value) }))}
              className="text-start text-lg h-12" />
          );
        }
        // Explosive numbers
        if (s.module === 'explosive_power' && s.numberKey) {
          const key = s.numberKey as keyof ExplosivePowerInput;
          return (
            <Input type="number" inputMode="decimal" placeholder={s.placeholder ?? '—'}
              value={explosiveInput[key] ?? ''} dir="ltr" autoFocus
              onChange={e => setExplosiveInput(p => ({ ...p, [key]: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
              className="text-start text-lg h-12" />
          );
        }
        return null;
      }

      case 'rep_scheme':
        return (
          <div className="grid grid-cols-1 gap-2">
            {REP_SCHEMES.map(rs => (
              <button key={rs} type="button" onClick={() => { setGymInput(prev => ({ ...prev, repScheme: rs })); }}
                className={cn(
                  'p-4 rounded-xl border text-start transition-all flex items-center justify-between',
                  gymInput.repScheme === rs ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:bg-muted/50'
                )}>
                <span className="font-medium text-sm text-foreground">{t(`power.rep_${rs}`)}</span>
                {gymInput.repScheme === rs && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        );

      case 'lift': {
        const lift = s.liftKey!;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-5 h-5 text-red-500" />
              <span className="text-xs text-muted-foreground">{t(`power.rep_${gymInput.repScheme}`)}</span>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">{t('power.weight')} (kg)</label>
              <Input type="number" inputMode="decimal" placeholder="kg" dir="ltr" autoFocus
                value={gymInput[lift]?.weight || ''}
                onChange={e => {
                  const v = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  setGymInput(prev => ({ ...prev, [lift]: { ...(prev[lift] ?? { weight: 0, reps: 1 }), weight: v } }));
                }}
                className="text-start text-lg h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">{t('power.reps')}</label>
              <Input type="number" inputMode="numeric" placeholder="—" dir="ltr"
                value={gymInput[lift]?.reps || ''}
                onChange={e => {
                  const v = e.target.value === '' ? 1 : parseInt(e.target.value);
                  setGymInput(prev => ({ ...prev, [lift]: { ...(prev[lift] ?? { weight: 0, reps: 1 }), reps: v } }));
                }}
                className="text-start text-lg h-12" />
            </div>
          </div>
        );
      }

      case 'skill_ladder': {
        const ladder = SKILL_LADDERS[s.skillKey!];
        const currentLevel = calSkillInput[s.skillField!];
        return (
          <div className="space-y-2">
            <button type="button" onClick={() => setCalSkillInput(prev => ({ ...prev, [s.skillField!]: 0 }))}
              className={cn('text-xs px-3 py-1.5 rounded-full border transition-colors mb-2',
                currentLevel === 0 ? 'bg-muted text-foreground border-border' : 'text-muted-foreground border-transparent hover:bg-muted'
              )}>
              {t('power.notTraining')}
            </button>
            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
              {ladder.map(lStep => (
                <button key={lStep.level} type="button"
                  onClick={() => setCalSkillInput(prev => ({ ...prev, [s.skillField!]: lStep.level }))}
                  className={cn(
                    'w-full text-start px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between',
                    currentLevel === lStep.level
                      ? 'bg-violet-500/10 border-violet-500/40 text-foreground font-medium'
                      : 'border-border text-muted-foreground hover:bg-muted/50'
                  )}>
                  <span>{t(`power.ladder_${lStep.key}`)}</span>
                  {currentLevel === lStep.level && <Check className="w-4 h-4 text-violet-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 'checkbox': {
        return (
          <div className="space-y-4">
            <button type="button"
              onClick={() => setCalCondInput(p => ({ ...p, weightedCalisthenics: !p.weightedCalisthenics }))}
              className={cn(
                'w-full p-4 rounded-xl border text-start transition-all flex items-center justify-between',
                calCondInput.weightedCalisthenics ? 'border-primary bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card hover:bg-muted/50'
              )}>
              <span className="text-sm font-medium text-foreground">{t('power.weightedCal')}</span>
              {calCondInput.weightedCalisthenics && <Check className="w-4 h-4 text-primary" />}
            </button>

            {calCondInput.weightedCalisthenics && (
              <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t('power.weightedPullupWeight')}</label>
                  <Input type="number" inputMode="decimal" placeholder="kg" dir="ltr"
                    value={calCondInput.weightedPullupWeight ?? ''} className="text-start"
                    onChange={e => setCalCondInput(p => ({ ...p, weightedPullupWeight: e.target.value === '' ? undefined : parseFloat(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t('power.weightedPullupReps')}</label>
                  <Input type="number" inputMode="numeric" placeholder="—" dir="ltr"
                    value={calCondInput.weightedPullupReps ?? ''} className="text-start"
                    onChange={e => setCalCondInput(p => ({ ...p, weightedPullupReps: e.target.value === '' ? undefined : parseInt(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t('power.weightedDipWeight')}</label>
                  <Input type="number" inputMode="decimal" placeholder="kg" dir="ltr"
                    value={calCondInput.weightedDipWeight ?? ''} className="text-start"
                    onChange={e => setCalCondInput(p => ({ ...p, weightedDipWeight: e.target.value === '' ? undefined : parseFloat(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">{t('power.weightedDipReps')}</label>
                  <Input type="number" inputMode="numeric" placeholder="—" dir="ltr"
                    value={calCondInput.weightedDipReps ?? ''} className="text-start"
                    onChange={e => setCalCondInput(p => ({ ...p, weightedDipReps: e.target.value === '' ? undefined : parseInt(e.target.value) }))} />
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{getModuleLabel(step.module)}</p>
              <span className="text-xs text-muted-foreground">{microIndex + 1}/{totalMicro}</span>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden" dir="ltr">
            <motion.div
              className="h-full rounded-full bg-red-500"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-lg font-bold text-foreground mb-4">{getTitle(step)}</h2>
            <div className="p-4 rounded-xl border border-border bg-card">
              {renderMicroStep(step)}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next */}
        <Button onClick={goNext} disabled={saving}
          className="w-full bg-red-600 hover:bg-red-700" size="lg">
          {saving ? t('common.saving') : isLast ? t('power.computeResults') : t('common.next')}
          {!saving && <ForwardIcon className="w-4 h-4 ms-1" />}
        </Button>

        {/* Skip option for optional fields */}
        {(step.type === 'number' || step.type === 'skill_ladder') && !isLast && (
          <button type="button" onClick={goNext}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
            {t('common.skip') ?? 'Skip'}
          </button>
        )}
      </div>
    </PageShell>
  );
}
