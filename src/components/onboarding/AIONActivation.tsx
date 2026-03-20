/**
 * AIONActivation — AION discovery flow shown during onboarding.
 * 4 steps: Message → Naming → Silent Alignment → First Interaction.
 * AION is discovered, not configured.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { AURORA_ORB_PROFILE } from '@/components/aurora/AuroraHoloOrb';
import { cn } from '@/lib/utils';

interface AIONActivationProps {
  onComplete: () => void;
}

const STEPS = 4;

export function AIONActivation({ onComplete }: AIONActivationProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [aionName, setAionName] = useState('AION');
  const [saving, setSaving] = useState(false);

  const saveAndComplete = useCallback(async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({
          aion_name: aionName.trim() || 'AION',
          aion_activated: true,
        } as any)
        .eq('id', user.id);
    } catch (e) {
      console.warn('[AION] Save failed:', e);
    } finally {
      setSaving(false);
      onComplete();
    }
  }, [user?.id, aionName, onComplete]);

  const next = () => {
    if (step < STEPS - 1) {
      setStep(s => s + 1);
    } else {
      saveAndComplete();
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <StepContainer key="s0">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl animate-pulse" />
                <StandaloneMorphOrb size={120} profile={AURORA_ORB_PROFILE} geometryFamily="octa" level={100} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-center text-foreground leading-relaxed max-w-md whitespace-pre-line">
              {isHe
                ? 'זה אתה — בלי רעש.\nגרסה שלך שכבר עברה את הדרך.'
                : 'This is you — without noise.\nA version of you that already made it.'}
            </p>
            <Button onClick={next} size="lg" className="mt-10 px-10 py-6 rounded-2xl text-base font-black">
              {isHe ? 'המשך' : 'Continue'}
            </Button>
          </StepContainer>
        )}

        {step === 1 && (
          <StepContainer key="s1">
            <h2 className="text-2xl font-black text-center text-foreground mb-3">
              {isHe ? 'תן שם לגרסה שלך' : 'Name your future self'}
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-8 max-w-sm">
              {isHe
                ? 'זה לא בוט. זה לא עוזר. זה אתה — בגרסה הכי חדה.'
                : "This isn't a bot. It isn't an assistant. It's you — at your sharpest."}
            </p>
            <Input
              value={aionName}
              onChange={e => setAionName(e.target.value)}
              placeholder="AION"
              className="text-center text-xl font-bold max-w-xs h-14 rounded-xl border-primary/30 focus:border-primary"
              maxLength={20}
            />
            <Button onClick={next} size="lg" className="mt-8 px-10 py-6 rounded-2xl text-base font-black" disabled={!aionName.trim()}>
              {isHe ? 'המשך' : 'Continue'}
            </Button>
          </StepContainer>
        )}

        {step === 2 && (
          <StepContainer key="s2">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-primary/15 blur-3xl" />
                <StandaloneMorphOrb size={140} profile={AURORA_ORB_PROFILE} geometryFamily="octa" level={100} />
              </div>
            </div>
            <p className="text-lg text-center text-muted-foreground max-w-sm leading-relaxed whitespace-pre-line">
              {isHe
                ? `${aionName || 'AION'} לומד אותך.\nמהמטרות שלך. מהדפוסים שלך.\nמכל צעד שתעשה.`
                : `${aionName || 'AION'} learns from you.\nFrom your goals. Your patterns.\nEvery step you take.`}
            </p>
            <div className="flex items-center gap-2 mt-6">
              <div className="h-1 w-8 rounded-full bg-primary/60 animate-pulse" />
              <div className="h-1 w-6 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="h-1 w-4 rounded-full bg-primary/15 animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
            <Button onClick={next} size="lg" className="mt-8 px-10 py-6 rounded-2xl text-base font-black">
              {isHe ? 'המשך' : 'Continue'}
            </Button>
          </StepContainer>
        )}

        {step === 3 && (
          <StepContainer key="s3">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl" />
                <StandaloneMorphOrb size={100} profile={AURORA_ORB_PROFILE} geometryFamily="octa" level={100} />
              </div>
            </div>
            <div className="bg-muted/30 border border-border/30 rounded-2xl px-5 py-4 max-w-sm">
              <p className="text-xs font-semibold text-primary/70 mb-1.5">{aionName || 'AION'}</p>
              <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
                {isHe
                  ? 'אני אתה.\nרק בלי הרעש.\nבוא נתחיל לזוז.'
                  : "I'm you.\nJust without the noise.\nLet's move."}
              </p>
            </div>
            <Button
              onClick={next}
              size="lg"
              disabled={saving}
              className="mt-8 px-10 py-6 rounded-2xl text-base font-black"
            >
              {saving
                ? (isHe ? 'מפעיל...' : 'Activating...')
                : (isHe ? 'הפעל את ' + (aionName || 'AION') : `Activate ${aionName || 'AION'}`)}
            </Button>
          </StepContainer>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 flex items-center gap-2">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-full transition-all duration-500',
              i === step ? 'w-6 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-muted-foreground/25'
            )}
          />
        ))}
      </div>
    </div>
  );
}

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center"
    >
      {children}
    </motion.div>
  );
}