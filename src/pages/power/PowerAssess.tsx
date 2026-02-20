/**
 * @tab Life > Power > Assess
 * Multi-step assessment wizard:
 * Step 1: Goal/track selection
 * Step 2+: Dynamic modules per selected track
 * Final: Compute & save
 */
import { useState, useMemo } from 'react';
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

const TRACK_META: { id: PowerTrackId; icon: typeof Dumbbell; color: string }[] = [
  { id: 'gym_strength', icon: Dumbbell, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  { id: 'calisthenics_conditioning', icon: Target, color: 'text-orange-500 bg-orange-500/10 border-orange-500/30' },
  { id: 'calisthenics_skills', icon: Shield, color: 'text-violet-500 bg-violet-500/10 border-violet-500/30' },
  { id: 'explosive_power', icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  { id: 'general_athleticism', icon: Activity, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
];

const REP_SCHEMES: RepScheme[] = ['1rm', '5rm', '8_12rm'];

export default function PowerAssess() {
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();
  const { getDomain, upsertDomain } = useLifeDomains();

  // Steps: 'select' → then one step per selected track → 'submit'
  const [selectedTracks, setSelectedTracks] = useState<PowerTrackId[]>([]);
  const [currentStep, setCurrentStep] = useState(0); // 0 = track selection
  const [saving, setSaving] = useState(false);

  // Bodyweight (shared across modules)
  const [bodyweight, setBodyweight] = useState<number | undefined>();

  // Module inputs
  const [gymInput, setGymInput] = useState<GymStrengthInput>({ repScheme: '1rm' });
  const [calCondInput, setCalCondInput] = useState<CalConditioningInput>({ weightedCalisthenics: false });
  const [calSkillInput, setCalSkillInput] = useState<CalSkillsInput>({
    handstand: 0, planche: 0, frontLever: 0, backLever: 0, humanFlag: 0,
  });
  const [explosiveInput, setExplosiveInput] = useState<ExplosivePowerInput>({});

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;

  // Resolve which actual modules to show based on selection
  const activeModules = useMemo(() => {
    const mods: PowerTrackId[] = [];
    if (selectedTracks.includes('gym_strength') || selectedTracks.includes('general_athleticism')) mods.push('gym_strength');
    if (selectedTracks.includes('calisthenics_conditioning') || selectedTracks.includes('general_athleticism')) mods.push('calisthenics_conditioning');
    if (selectedTracks.includes('calisthenics_skills')) mods.push('calisthenics_skills');
    if (selectedTracks.includes('explosive_power') || selectedTracks.includes('general_athleticism')) mods.push('explosive_power');
    // Deduplicate
    return [...new Set(mods)];
  }, [selectedTracks]);

  const totalSteps = 1 + activeModules.length + 1; // select + modules + bodyweight
  // Step 0 = select, Step 1 = bodyweight, Step 2..N = modules

  const toggleTrack = (id: PowerTrackId) => {
    setSelectedTracks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

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

  const numField = (label: string, value: number | undefined, onChange: (v: number | undefined) => void, placeholder?: string) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input
        type="number" inputMode="decimal" placeholder={placeholder ?? '—'}
        value={value ?? ''} dir="ltr"
        onChange={e => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
        className="text-start"
      />
    </div>
  );

  // ─── Step 0: Track Selection ───
  if (currentStep === 0) {
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

          <Button onClick={() => setCurrentStep(1)} disabled={selectedTracks.length === 0}
            className="w-full bg-red-600 hover:bg-red-700" size="lg">
            {t('common.next')} <ForwardIcon className="w-4 h-4 ms-1" />
          </Button>
        </div>
      </PageShell>
    );
  }

  // ─── Step 1: Bodyweight ───
  if (currentStep === 1) {
    return (
      <PageShell>
        <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <StepHeader step={1} total={totalSteps} label={t('power.bodyweightStep')} onBack={() => setCurrentStep(0)} isRTL={isRTL} />
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            {numField(t('power.bodyweight'), bodyweight, setBodyweight, 'kg')}
            <p className="text-xs text-muted-foreground">{t('power.bodyweightNote')}</p>
          </div>
          <Button onClick={() => setCurrentStep(2)} className="w-full bg-red-600 hover:bg-red-700" size="lg">
            {t('power.saveAndContinue')} <ForwardIcon className="w-4 h-4 ms-1" />
          </Button>
        </div>
      </PageShell>
    );
  }

  // ─── Steps 2+: Module forms ───
  const moduleIndex = currentStep - 2;
  const currentModule = activeModules[moduleIndex];
  const isLastModule = moduleIndex === activeModules.length - 1;

  const goNext = () => {
    if (isLastModule) handleSubmit();
    else setCurrentStep(currentStep + 1);
  };

  const renderModuleForm = () => {
    switch (currentModule) {
      case 'gym_strength':
        return <GymStrengthForm input={gymInput} setInput={setGymInput} numField={numField} t={t} isRTL={isRTL} />;
      case 'calisthenics_conditioning':
        return <CalConditioningForm input={calCondInput} setInput={setCalCondInput} numField={numField} t={t} />;
      case 'calisthenics_skills':
        return <CalSkillsForm input={calSkillInput} setInput={setCalSkillInput} t={t} language={language} />;
      case 'explosive_power':
        return <ExplosivePowerForm input={explosiveInput} setInput={setExplosiveInput} numField={numField} t={t} />;
      default:
        return null;
    }
  };

  if (currentModule) {
    return (
      <PageShell>
        <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <StepHeader
            step={currentStep}
            total={totalSteps}
            label={t(`power.track_${currentModule}`)}
            onBack={() => setCurrentStep(currentStep - 1)}
            isRTL={isRTL}
          />
          {renderModuleForm()}
          <Button onClick={goNext} disabled={saving} className="w-full bg-red-600 hover:bg-red-700" size="lg">
            {saving ? t('common.saving') : isLastModule ? t('power.computeResults') : t('power.saveAndContinue')}
            {!saving && <ForwardIcon className="w-4 h-4 ms-1" />}
          </Button>
        </div>
      </PageShell>
    );
  }

  return null;
}

/* ─── Step Header with progress ─── */
function StepHeader({ step, total, label, onBack, isRTL }: { step: number; total: number; label: string; onBack: () => void; isRTL: boolean }) {
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const pct = Math.round((step / (total - 1)) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <BackIcon className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground flex-1">{label}</h1>
        <span className="text-xs text-muted-foreground">{step}/{total - 1}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden" dir="ltr">
        <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ─── Gym Strength Form ─── */
function GymStrengthForm({ input, setInput, numField, t, isRTL }: {
  input: GymStrengthInput; setInput: React.Dispatch<React.SetStateAction<GymStrengthInput>>;
  numField: (l: string, v: number | undefined, fn: (v: number | undefined) => void, p?: string) => JSX.Element;
  t: (k: string) => string; isRTL: boolean;
}) {
  const setLift = (key: 'squat' | 'deadlift' | 'bench' | 'ohp', field: 'weight' | 'reps', val: number | undefined) => {
    setInput(prev => {
      const existing = prev[key] ?? { weight: 0, reps: 1 };
      return { ...prev, [key]: { ...existing, [field]: val ?? 0 } };
    });
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Dumbbell className="w-4 h-4 text-red-500" />
        <h3 className="font-bold text-sm text-foreground">{t('power.track_gym_strength')}</h3>
      </div>

      {/* Rep scheme */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">{t('power.howMeasure')}</label>
        <div className="flex flex-wrap gap-1.5">
          {REP_SCHEMES.map(rs => (
            <button key={rs} type="button" onClick={() => setInput(prev => ({ ...prev, repScheme: rs }))}
              className={cn('px-3 py-1.5 text-xs rounded-lg border transition-colors',
                input.repScheme === rs ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:bg-muted'
              )}>
              {t(`power.rep_${rs}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Lifts */}
      {(['squat', 'deadlift', 'bench', 'ohp'] as const).map(lift => (
        <div key={lift} className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{t(`power.lift_${lift}`)}</label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" inputMode="decimal" placeholder={t('power.weight')} dir="ltr"
              value={input[lift]?.weight || ''} className="text-start"
              onChange={e => setLift(lift, 'weight', e.target.value === '' ? undefined : parseFloat(e.target.value))} />
            <Input type="number" inputMode="numeric" placeholder={t('power.reps')} dir="ltr"
              value={input[lift]?.reps || ''} className="text-start"
              onChange={e => setLift(lift, 'reps', e.target.value === '' ? undefined : parseInt(e.target.value))} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Calisthenics Conditioning Form ─── */
function CalConditioningForm({ input, setInput, numField, t }: {
  input: CalConditioningInput; setInput: React.Dispatch<React.SetStateAction<CalConditioningInput>>;
  numField: (l: string, v: number | undefined, fn: (v: number | undefined) => void, p?: string) => JSX.Element;
  t: (k: string) => string;
}) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-orange-500" />
        <h3 className="font-bold text-sm text-foreground">{t('power.track_calisthenics_conditioning')}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{t('power.calCondNote')}</p>
      {numField(t('power.maxPushups'), input.maxPushups, v => setInput(p => ({ ...p, maxPushups: v })))}
      {numField(t('power.maxPullups'), input.maxPullups, v => setInput(p => ({ ...p, maxPullups: v })))}
      {numField(t('power.maxDips'), input.maxDips, v => setInput(p => ({ ...p, maxDips: v })))}
      {numField(t('power.maxBwSquats'), input.maxBwSquats, v => setInput(p => ({ ...p, maxBwSquats: v })))}

      {/* Weighted toggle */}
      <div className="pt-2 border-t border-border">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={input.weightedCalisthenics}
            onChange={e => setInput(p => ({ ...p, weightedCalisthenics: e.target.checked }))}
            className="rounded border-border" />
          <span className="text-xs text-foreground">{t('power.weightedCal')}</span>
        </label>
        {input.weightedCalisthenics && (
          <div className="mt-2 space-y-2 ps-4">
            <div className="grid grid-cols-2 gap-2">
              {numField(t('power.weightedPullupWeight'), input.weightedPullupWeight, v => setInput(p => ({ ...p, weightedPullupWeight: v })), 'kg')}
              {numField(t('power.weightedPullupReps'), input.weightedPullupReps, v => setInput(p => ({ ...p, weightedPullupReps: v })))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {numField(t('power.weightedDipWeight'), input.weightedDipWeight, v => setInput(p => ({ ...p, weightedDipWeight: v })), 'kg')}
              {numField(t('power.weightedDipReps'), input.weightedDipReps, v => setInput(p => ({ ...p, weightedDipReps: v })))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Calisthenics Skills Form (Ladder) ─── */
function CalSkillsForm({ input, setInput, t, language }: {
  input: CalSkillsInput; setInput: React.Dispatch<React.SetStateAction<CalSkillsInput>>;
  t: (k: string) => string; language: string;
}) {
  const skills: { key: SkillName; field: keyof CalSkillsInput }[] = [
    { key: 'handstand', field: 'handstand' },
    { key: 'planche', field: 'planche' },
    { key: 'frontLever', field: 'frontLever' },
    { key: 'backLever', field: 'backLever' },
    { key: 'humanFlag', field: 'humanFlag' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-violet-500" />
        <h3 className="font-bold text-sm text-foreground">{t('power.track_calisthenics_skills')}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{t('power.skillsNote')}</p>

      {skills.map(skill => {
        const ladder = SKILL_LADDERS[skill.key];
        const currentLevel = input[skill.field];

        return (
          <div key={skill.key} className="p-3 rounded-xl border border-border bg-card space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">{t(`power.skill_${skill.key}`)}</p>
              <button type="button" onClick={() => setInput(prev => ({ ...prev, [skill.field]: 0 }))}
                className={cn('text-[10px] px-2 py-0.5 rounded-full border transition-colors',
                  currentLevel === 0 ? 'bg-muted text-foreground border-border' : 'text-muted-foreground border-transparent hover:bg-muted'
                )}>
                {t('power.notTraining')}
              </button>
            </div>
            <div className="space-y-1">
              {ladder.map(step => (
                <button key={step.level} type="button"
                  onClick={() => setInput(prev => ({ ...prev, [skill.field]: step.level }))}
                  className={cn(
                    'w-full text-start px-3 py-2 rounded-lg border text-xs transition-all flex items-center justify-between',
                    currentLevel === step.level
                      ? 'bg-violet-500/10 border-violet-500/40 text-foreground font-medium'
                      : 'border-border text-muted-foreground hover:bg-muted/50'
                  )}>
                  <span>{t(`power.ladder_${step.key}`)}</span>
                  {currentLevel === step.level && <Check className="w-3.5 h-3.5 text-violet-500" />}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Explosive Power Form ─── */
function ExplosivePowerForm({ input, setInput, numField, t }: {
  input: ExplosivePowerInput; setInput: React.Dispatch<React.SetStateAction<ExplosivePowerInput>>;
  numField: (l: string, v: number | undefined, fn: (v: number | undefined) => void, p?: string) => JSX.Element;
  t: (k: string) => string;
}) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-500" />
        <h3 className="font-bold text-sm text-foreground">{t('power.track_explosive_power')}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{t('power.explosiveNote')}</p>
      {numField(t('power.verticalJump'), input.verticalJumpCm, v => setInput(p => ({ ...p, verticalJumpCm: v })), 'cm')}
      {numField(t('power.broadJump'), input.broadJumpCm, v => setInput(p => ({ ...p, broadJumpCm: v })), 'cm')}
      {numField(t('power.sprint20m'), input.sprint20mSeconds, v => setInput(p => ({ ...p, sprint20mSeconds: v })), t('power.seconds'))}
      {numField(t('power.sprint40m'), input.sprint40mSeconds, v => setInput(p => ({ ...p, sprint40mSeconds: v })), t('power.seconds'))}
    </div>
  );
}
