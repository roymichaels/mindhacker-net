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
import { AionOrb } from '@/components/aion/ui';

export default function JourneyView() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const today = useTodayExecution() as any;

  const queue = (today?.queue ?? []) as Array<any>;
  const completedIds: Set<string> = today?.completedIds ?? new Set();
  const phase: number | undefined = today?.phase;
  const totalActions: number | undefined = today?.totalActions;
  const completedActions: number | undefined = today?.completedActions;
  const toggleActionComplete: ((id: string, done: boolean) => Promise<void> | void) | undefined =
    today?.toggleActionComplete;

  const next = useMemo(() => {
    return queue.find((it) => {
      const id = it?.sourceId || it?.milestoneId || it?.id;
      return id && !completedIds.has(id) && !it.completed;
    });
  }, [queue, completedIds]);

  const lines = useMemo(() => {
    const out: Array<{ label: string; text: string }> = [];
    if (typeof phase === 'number' && phase > 0) {
      out.push({
        label: isHe ? 'שלב נוכחי' : 'Current phase',
        text: isHe ? `שלב ${phase}` : `Phase ${phase}`,
      });
    }
    if (typeof totalActions === 'number' && totalActions > 0) {
      const remaining = Math.max(0, totalActions - (completedActions ?? 0));
      if (remaining > 0) {
        out.push({
          label: isHe ? 'מומנטום' : 'Momentum',
          text: isHe
            ? `${remaining} פעולות פתוחות היום`
            : `${remaining} open actions today`,
        });
      } else {
        out.push({
          label: isHe ? 'מומנטום' : 'Momentum',
          text: isHe ? 'היום הסתיים — נוח' : 'Day complete — rest',
        });
      }
    }
    return out;
  }, [phase, totalActions, completedActions, isHe]);

  const handleStart = () => {
    const id = next?.sourceId || next?.milestoneId;
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
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5">
        <AionOrb size="md" />
        <div className="mt-3 aion-text-hero text-[12px] tracking-[0.32em] uppercase text-foreground/55">
          {isHe ? 'היום' : 'Today'}
        </div>

        <div className="mt-10 w-full">
          {next ? (
            <NextStepCard
              title={next.title}
              titleEn={next.titleEn}
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
          ? 'AION עדיין מקשיב. דבר איתו — הצעד הבא יופיע מתוך השיחה.'
          : 'AION is still listening. Speak to it — your next step will emerge from the conversation.'}
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground/[0.04] hover:bg-foreground/[0.08] border border-white/[0.06] px-5 py-2 text-[13px] text-foreground/80 transition-colors"
      >
        {isHe ? 'פתח את AION' : 'Open AION'}
      </button>
    </div>
  );
}