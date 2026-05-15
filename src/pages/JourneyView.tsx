/**
 * JourneyView — the new Journey realm.
 *
 * One next step, three ambient trajectory lines. No tabs, no plan grid,
 * no "Generate" CTA. The plan exists; AION manifests it. If nothing is
 * ready, the user is guided back to chat — the only generator is conversation.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useTodayExecution } from '@/hooks/useTodayExecution';
import NextStepCard from '@/components/journey/NextStepCard';
import TrajectoryLines from '@/components/journey/TrajectoryLines';
import StrategyContextEcho from '@/components/journey/StrategyContextEcho';
import CanonicalAionModel from '@/components/orb/CanonicalAionModel';
import { useNextStep } from '@/services/trajectory/useNextStep';
import { aionPresence } from '@/copy/aionPresence';
import { useDiagnosticsFlag } from '@/diagnostics/useDiagnosticsFlag';
import { ViewIdentityScope } from '@/viewIdentity';

export default function JourneyView() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const today = useTodayExecution() as any;
  const nextStep = useNextStep();
  const diag = useDiagnosticsFlag();

  const phase: number | undefined = today?.phase;
  const totalActions: number | undefined = today?.totalActions;
  const completedActions: number | undefined = today?.completedActions;
  const toggleActionComplete: ((id: string, done: boolean) => Promise<void> | void) | undefined =
    today?.toggleActionComplete;

  const next = nextStep.item;
  const observation = isHe ? nextStep.observation.he : nextStep.observation.en;

  const lines = useMemo(() => {
    const out: Array<{ label: string; text: string }> = [];
    if (typeof phase === 'number' && phase > 0) {
      out.push({
        label: isHe ? 'מסלול' : 'Trajectory',
        text: isHe ? `שלב ${phase}` : `Phase ${phase}`,
      });
    }
    if (typeof totalActions === 'number' && totalActions > 0) {
      const remaining = Math.max(0, totalActions - (completedActions ?? 0));
      if (remaining > 0) {
        out.push({
          label: isHe ? 'קצב' : 'Rhythm',
          text: isHe
            ? `${remaining} צעדים פתוחים`
            : `${remaining} steps still open`,
        });
      } else {
        out.push({
          label: isHe ? 'קצב' : 'Rhythm',
          text: isHe ? 'הלולאה נסגרה — נוח' : 'Loop closed — rest',
        });
      }
    }
    return out;
  }, [phase, totalActions, completedActions, isHe]);

  const handleStart = () => {
    const id = (next as any)?.id || (next as any)?.sourceId || (next as any)?.milestoneId;
    if (id && toggleActionComplete) {
      try {
        void toggleActionComplete(id, true);
      } catch {
        // silent — UX, not data integrity
      }
    }
    navigate('/');
  };

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y"
      data-shellv2-layer="chat"
      data-shellv2-route="journey"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4.5rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8rem)',
      }}
    >
      <ViewIdentityScope id="journey" />
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5">
        <StrategyContextEcho />
        <CanonicalAionModel size={160} ariaLabel="AION" />
        <p className="mt-4 text-[13px] italic text-foreground/65 text-center text-balance px-4 leading-relaxed">
          {observation}
        </p>
        {diag && (
          <p className="mt-1 text-[10px] text-muted-foreground/60">
            kind: {nextStep.kind} · confidence: {nextStep.confidence.toFixed(2)}
          </p>
        )}

        <div className="mt-8 w-full">
          {next ? (
            <NextStepCard
              title={(next as any).title}
              titleEn={(next as any).titleEn}
              onStart={handleStart}
            />
          ) : (
            <EmptyPresence />
          )}
        </div>

        <TrajectoryLines lines={lines} />
      </div>
    </main>
  );
}

function EmptyPresence() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="mx-auto w-full max-w-md text-center"
    >
      <p className="text-[14px] leading-relaxed text-foreground/55">
        {isHe
          ? 'AION עדיין מקשיב לתנועה הבאה.'
          : 'AION is still listening for the next movement.'}
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-white/[0.06] px-5 py-2 text-[13px] text-foreground/80 transition-colors"
      >
        {isHe ? 'דבר עם AION' : 'Talk to AION'}
      </button>
    </div>
  );
}