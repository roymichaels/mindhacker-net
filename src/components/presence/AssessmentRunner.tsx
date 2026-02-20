/**
 * @tab Life
 * @purpose Multi-step questionnaire runner for Presence Coach assessment.
 * @data Collects PresencePreferences then emits onComplete.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { AssessmentMode, PresencePreferences, Gender, StylePreference, PresenceGoal } from '@/lib/presence/types';

interface AssessmentRunnerProps {
  mode: AssessmentMode;
  onComplete: (prefs: PresencePreferences) => void;
  onCancel: () => void;
}

const AGE_BRACKETS = ['18-24', '25-29', '30-34', '35-39', '40-49', '50+'];
const BODY_FAT_RANGES = [
  { value: 'under_10', label: 'Under 10%' },
  { value: '10_14', label: '10-14%' },
  { value: '15_19', label: '15-19%' },
  { value: '20_24', label: '20-24%' },
  { value: '25_29', label: '25-29%' },
  { value: '30_plus', label: '30%+' },
];
const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (< 3k steps)' },
  { value: 'light', label: 'Light (3-5k steps)' },
  { value: 'moderate', label: 'Moderate (5-8k steps)' },
  { value: 'active', label: 'Active (8-12k steps)' },
  { value: 'very_active', label: 'Very Active (12k+ steps)' },
];
const STYLE_OPTIONS: { value: StylePreference; label: string }[] = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'classic', label: 'Classic' },
  { value: 'street', label: 'Street' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'formal', label: 'Formal' },
];
const GOAL_OPTIONS: { value: PresenceGoal; label: string }[] = [
  { value: 'jawline', label: 'Jawline Definition' },
  { value: 'skin', label: 'Skin Clarity' },
  { value: 'hair', label: 'Hair Quality' },
  { value: 'leanness', label: 'Body Leanness' },
  { value: 'style', label: 'Style Upgrade' },
  { value: 'posture', label: 'Posture Confidence' },
  { value: 'grooming', label: 'Grooming' },
];
const SKINCARE_OPTIONS = [
  { value: 'none', label: 'None / Minimal' },
  { value: 'basic', label: 'Basic (cleanser + moisturizer)' },
  { value: 'full', label: 'Full (cleanser + serum + SPF + PM)' },
];
const HAIR_LENGTH_OPTIONS = ['buzz', 'short', 'medium', 'long'];

type Step = 'gender' | 'age' | 'body' | 'activity' | 'style' | 'grooming' | 'posture' | 'goals';
const STEPS: Step[] = ['gender', 'age', 'body', 'activity', 'style', 'grooming', 'posture', 'goals'];

export default function AssessmentRunner({ mode, onComplete, onCancel }: AssessmentRunnerProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [gender, setGender] = useState<Gender>('male');
  const [ageBracket, setAgeBracket] = useState('25-29');
  const [bodyFat, setBodyFat] = useState('15_19');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [stylePref, setStylePref] = useState<StylePreference>('minimal');
  const [hasBeard, setHasBeard] = useState(false);
  const [hairLength, setHairLength] = useState('medium');
  const [skincareRoutine, setSkincareRoutine] = useState('none');
  const [neckForward, setNeckForward] = useState(false);
  const [roundedShoulders, setRoundedShoulders] = useState(false);
  const [lowBackPain, setLowBackPain] = useState(false);
  const [goals, setGoals] = useState<PresenceGoal[]>([]);

  const currentStep = STEPS[stepIdx];

  const toggleGoal = (g: PresenceGoal) => {
    setGoals(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : prev.length < 2 ? [...prev, g] : prev,
    );
  };

  const handleFinish = () => {
    const prefs: PresencePreferences = {
      gender,
      age_bracket: ageBracket,
      body_fat_range: bodyFat,
      activity_level: activityLevel,
      style_preference: stylePref,
      grooming_baseline: { has_beard: hasBeard, hair_length: hairLength, skincare_routine: skincareRoutine },
      posture_self_check: { neck_forward: neckForward, rounded_shoulders: roundedShoulders, low_back_pain: lowBackPain },
      goals,
    };
    onComplete(prefs);
  };

  const isLast = stepIdx === STEPS.length - 1;

  const OptionButton = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
        selected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/30'
      }`}
    >
      {children}
    </button>
  );

  const ToggleButton = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 w-full p-3 rounded-xl border text-sm transition-colors ${
        checked ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-border bg-card text-foreground'
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'border-red-500 bg-red-500' : 'border-muted-foreground'}`}>
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      {label}
    </button>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < stepIdx ? 'bg-primary' : i === stepIdx ? 'bg-primary/60' : 'bg-muted'}`} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center uppercase tracking-wider">
        Step {stepIdx + 1} of {STEPS.length}
      </p>

      {/* Steps */}
      {currentStep === 'gender' && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground text-center">Gender</h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {(['male', 'female', 'other'] as Gender[]).map(g => (
              <OptionButton key={g} selected={gender === g} onClick={() => setGender(g)}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </OptionButton>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'age' && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground text-center">Age Bracket</h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {AGE_BRACKETS.map(a => (
              <OptionButton key={a} selected={ageBracket === a} onClick={() => setAgeBracket(a)}>{a}</OptionButton>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'body' && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground text-center">Body Fat Estimate</h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {BODY_FAT_RANGES.map(b => (
              <OptionButton key={b.value} selected={bodyFat === b.value} onClick={() => setBodyFat(b.value)}>{b.label}</OptionButton>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'activity' && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground text-center">Activity Level</h3>
          <div className="flex flex-col gap-2">
            {ACTIVITY_LEVELS.map(a => (
              <OptionButton key={a.value} selected={activityLevel === a.value} onClick={() => setActivityLevel(a.value)}>{a.label}</OptionButton>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'style' && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground text-center">Style Preference</h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {STYLE_OPTIONS.map(s => (
              <OptionButton key={s.value} selected={stylePref === s.value} onClick={() => setStylePref(s.value)}>{s.label}</OptionButton>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'grooming' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground text-center">Grooming Baseline</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Beard / Facial Hair?</p>
              <div className="flex gap-2">
                <OptionButton selected={hasBeard} onClick={() => setHasBeard(true)}>Yes</OptionButton>
                <OptionButton selected={!hasBeard} onClick={() => setHasBeard(false)}>No</OptionButton>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Hair Length</p>
              <div className="flex gap-2 flex-wrap">
                {HAIR_LENGTH_OPTIONS.map(h => (
                  <OptionButton key={h} selected={hairLength === h} onClick={() => setHairLength(h)}>
                    {h.charAt(0).toUpperCase() + h.slice(1)}
                  </OptionButton>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Skincare Routine</p>
              <div className="flex flex-col gap-2">
                {SKINCARE_OPTIONS.map(s => (
                  <OptionButton key={s.value} selected={skincareRoutine === s.value} onClick={() => setSkincareRoutine(s.value)}>{s.label}</OptionButton>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'posture' && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground text-center">Posture Self-Check</h3>
          <p className="text-xs text-muted-foreground text-center">Select any that apply:</p>
          <div className="space-y-2">
            <ToggleButton checked={neckForward} onChange={setNeckForward} label="Neck tends to push forward" />
            <ToggleButton checked={roundedShoulders} onChange={setRoundedShoulders} label="Shoulders tend to round forward" />
            <ToggleButton checked={lowBackPain} onChange={setLowBackPain} label="Low back discomfort / tightness" />
          </div>
        </div>
      )}

      {currentStep === 'goals' && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground text-center">Top 2 Goals</h3>
          <p className="text-xs text-muted-foreground text-center">Choose up to 2 priorities:</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {GOAL_OPTIONS.map(g => (
              <OptionButton key={g.value} selected={goals.includes(g.value)} onClick={() => toggleGoal(g.value)}>
                {g.label}
              </OptionButton>
            ))}
          </div>
          {goals.length === 0 && <p className="text-xs text-amber-500 text-center">Select at least 1 goal</p>}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2 pt-2">
        {stepIdx > 0 ? (
          <Button variant="outline" onClick={() => setStepIdx(s => s - 1)} className="flex-1">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        ) : (
          <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        )}
        {isLast ? (
          <Button onClick={handleFinish} disabled={goals.length === 0} className="flex-1">
            Generate Score <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => setStepIdx(s => s + 1)} className="flex-1">
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      <p className="text-[11px] text-center text-muted-foreground">
        This is an estimate. Not medical advice. Lighting and angle affect results.
      </p>
    </div>
  );
}
