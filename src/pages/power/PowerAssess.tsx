/**
 * @tab Life > Power > Assess
 * Multi-step: 1) Select capability modules 2) Dynamic input forms 3) Compute & save
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { cn } from '@/lib/utils';
import {
  Dumbbell,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Zap,
  Shield,
  Target,
  Flame,
  Anchor,
  Check,
} from 'lucide-react';
import type {
  PowerModuleId,
  MaxStrengthInput,
  RelativeBodyweightInput,
  StaticSkillInput,
  ExplosivePowerInput,
  StructuralStrengthInput,
  PlancheTier,
  FrontLeverTier,
  PowerDomainConfig,
} from '@/lib/power/types';
import {
  scoreMaxStrength,
  scoreRelativeBodyweight,
  scoreStaticSkill,
  scoreExplosivePower,
  scoreStructuralStrength,
  buildPowerAssessment,
} from '@/lib/power/scoring';
import type { ModuleScore } from '@/lib/power/types';

const MODULE_META: { id: PowerModuleId; icon: typeof Dumbbell; colorClass: string }[] = [
  { id: 'max_strength', icon: Dumbbell, colorClass: 'text-red-500 bg-red-500/10 border-red-500/30' },
  { id: 'relative_bodyweight', icon: Target, colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/30' },
  { id: 'static_skill_strength', icon: Shield, colorClass: 'text-violet-500 bg-violet-500/10 border-violet-500/30' },
  { id: 'explosive_power', icon: Zap, colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  { id: 'structural_strength', icon: Anchor, colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
];

const PLANCHE_TIERS: PlancheTier[] = ['none', 'tuck', 'adv_tuck', 'straddle', 'half_lay', 'full'];
const FRONT_LEVER_TIERS: FrontLeverTier[] = ['none', 'tuck', 'adv_tuck', 'straddle', 'half_lay', 'full'];

export default function PowerAssess() {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  const { getDomain, upsertDomain } = useLifeDomains();

  const [step, setStep] = useState<'select' | 'input'>('select');
  const [selected, setSelected] = useState<PowerModuleId[]>([]);
  const [saving, setSaving] = useState(false);

  // Input states
  const [maxStrength, setMaxStrength] = useState<MaxStrengthInput>({ bodyweight: 0 });
  const [relBody, setRelBody] = useState<RelativeBodyweightInput>({});
  const [staticSkill, setStaticSkill] = useState<StaticSkillInput>({ plancheProgression: 'none', frontLeverProgression: 'none' });
  const [explosive, setExplosive] = useState<ExplosivePowerInput>({});
  const [structural, setStructural] = useState<StructuralStrengthInput>({});

  const BackIcon = isRTL ? ChevronRight : ArrowLeft;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const toggleModule = (id: PowerModuleId) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const scores: ModuleScore[] = [];
      if (selected.includes('max_strength')) scores.push(scoreMaxStrength(maxStrength));
      if (selected.includes('relative_bodyweight')) scores.push(scoreRelativeBodyweight(relBody));
      if (selected.includes('static_skill_strength')) scores.push(scoreStaticSkill(staticSkill));
      if (selected.includes('explosive_power')) scores.push(scoreExplosivePower(explosive));
      if (selected.includes('structural_strength')) scores.push(scoreStructuralStrength(structural));

      const assessment = buildPowerAssessment(selected, scores);

      const row = getDomain('power');
      const existing = (row?.domain_config ?? {}) as unknown as PowerDomainConfig;
      const history = [...(existing.history ?? [])];
      if (existing.latest_assessment) history.push(existing.latest_assessment);

      const newConfig: PowerDomainConfig = {
        selected_modules: selected,
        latest_assessment: assessment,
        history,
        completed: true,
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
        type="number"
        inputMode="decimal"
        placeholder={placeholder ?? '—'}
        value={value ?? ''}
        onChange={e => {
          const v = e.target.value;
          onChange(v === '' ? undefined : parseFloat(v));
        }}
        className="text-start"
        dir="ltr"
      />
    </div>
  );

  const tierSelect = (label: string, tiers: string[], value: string, onChange: (v: string) => void) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {tiers.map(tier => (
          <button
            key={tier}
            type="button"
            onClick={() => onChange(tier)}
            className={cn(
              'px-2.5 py-1 text-xs rounded-lg border transition-colors',
              value === tier
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:bg-muted'
            )}
          >
            {t(`power.tier_${tier}`)}
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Selection screen ───
  if (step === 'select') {
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
            {MODULE_META.map(mod => {
              const Icon = mod.icon;
              const isSelected = selected.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={cn(
                    'p-4 rounded-xl border text-start transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', mod.colorClass.split(' ').slice(1).join(' '))}>
                      <Icon className={cn('w-5 h-5', mod.colorClass.split(' ')[0])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-foreground">{t(`power.mod_${mod.id}`)}</p>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{t(`power.mod_${mod.id}_desc`)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            onClick={() => setStep('input')}
            disabled={selected.length === 0}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            {t('common.next')} <ChevronIcon className="w-4 h-4 ms-1" />
          </Button>
        </div>
      </PageShell>
    );
  }

  // ─── Input screen ───
  return (
    <PageShell>
      <div className="space-y-6 pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep('select')}>
            <BackIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('power.enterData')}</h1>
        </div>

        {/* Max Strength */}
        {selected.includes('max_strength') && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-sm text-foreground">{t('power.mod_max_strength')}</h3>
            </div>
            {numField(t('power.bodyweight'), maxStrength.bodyweight || undefined, v => setMaxStrength(p => ({ ...p, bodyweight: v ?? 0 })), 'kg')}
            {numField(t('power.bench1rm'), maxStrength.bench1rm, v => setMaxStrength(p => ({ ...p, bench1rm: v })), 'kg')}
            {numField(t('power.squat1rm'), maxStrength.squat1rm, v => setMaxStrength(p => ({ ...p, squat1rm: v })), 'kg')}
            {numField(t('power.deadlift1rm'), maxStrength.deadlift1rm, v => setMaxStrength(p => ({ ...p, deadlift1rm: v })), 'kg')}
          </div>
        )}

        {/* Relative Bodyweight */}
        {selected.includes('relative_bodyweight') && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-sm text-foreground">{t('power.mod_relative_bodyweight')}</h3>
            </div>
            {numField(t('power.maxPushups'), relBody.maxPushups, v => setRelBody(p => ({ ...p, maxPushups: v })))}
            {numField(t('power.maxPullups'), relBody.maxPullups, v => setRelBody(p => ({ ...p, maxPullups: v })))}
            {numField(t('power.maxDips'), relBody.maxDips, v => setRelBody(p => ({ ...p, maxDips: v })))}
            {numField(t('power.lSitHold'), relBody.lSitHoldSeconds, v => setRelBody(p => ({ ...p, lSitHoldSeconds: v })), t('power.seconds'))}
          </div>
        )}

        {/* Static Skill */}
        {selected.includes('static_skill_strength') && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-500" />
              <h3 className="font-bold text-sm text-foreground">{t('power.mod_static_skill_strength')}</h3>
            </div>
            {tierSelect(t('power.plancheProgression'), PLANCHE_TIERS, staticSkill.plancheProgression, v => setStaticSkill(p => ({ ...p, plancheProgression: v as PlancheTier })))}
            {tierSelect(t('power.frontLeverProgression'), FRONT_LEVER_TIERS, staticSkill.frontLeverProgression, v => setStaticSkill(p => ({ ...p, frontLeverProgression: v as FrontLeverTier })))}
            {numField(t('power.handstandHold'), staticSkill.handstandHoldSeconds, v => setStaticSkill(p => ({ ...p, handstandHoldSeconds: v })), t('power.seconds'))}
          </div>
        )}

        {/* Explosive Power */}
        {selected.includes('explosive_power') && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-foreground">{t('power.mod_explosive_power')}</h3>
            </div>
            {numField(t('power.sprint30m'), explosive.sprint30mSeconds, v => setExplosive(p => ({ ...p, sprint30mSeconds: v })), t('power.seconds'))}
            {numField(t('power.verticalJump'), explosive.verticalJumpCm, v => setExplosive(p => ({ ...p, verticalJumpCm: v })), 'cm')}
            {numField(t('power.broadJump'), explosive.broadJumpCm, v => setExplosive(p => ({ ...p, broadJumpCm: v })), 'cm')}
            {numField(t('power.clapPushups'), explosive.clapPushups, v => setExplosive(p => ({ ...p, clapPushups: v })))}
          </div>
        )}

        {/* Structural Strength */}
        {selected.includes('structural_strength') && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-foreground">{t('power.mod_structural_strength')}</h3>
            </div>
            {numField(t('power.deadHang'), structural.deadHangSeconds, v => setStructural(p => ({ ...p, deadHangSeconds: v })), t('power.seconds'))}
            {numField(t('power.sidePlank'), structural.sidePlankSeconds, v => setStructural(p => ({ ...p, sidePlankSeconds: v })), t('power.seconds'))}
            {numField(t('power.singleLegBalance'), structural.singleLegBalanceSeconds, v => setStructural(p => ({ ...p, singleLegBalanceSeconds: v })), t('power.seconds'))}
            {numField(t('power.deepSquatHold'), structural.deepSquatHoldSeconds, v => setStructural(p => ({ ...p, deepSquatHoldSeconds: v })), t('power.seconds'))}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-red-600 hover:bg-red-700"
          size="lg"
        >
          {saving ? t('common.saving') : t('power.computeResults')}
        </Button>
      </div>
    </PageShell>
  );
}
