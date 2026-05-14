/**
 * useNextStep — canonical trajectory aggregator.
 *
 * Phase 4C deliverable: collapses the seven scattered "what's next" hooks
 * (useFocusQueue, useDailyPriorities, useNextMission, useUpcomingMilestones,
 * useTodayExecution, useTodaysHabits, useMissionsRoadmap) into a SINGLE
 * AION-voiced inference over the `action_items` SSOT.
 *
 * Pure aggregator — no new tables, no new RPCs, no business-logic rewrite.
 * Thin delegation to existing hooks; consumers that want a single answer
 * call this instead of stitching together their own.
 *
 * Returns an AION observation, not an instruction:
 *   { kind, item, observation, confidence, suggestedManifestation }
 *
 * Existing hooks remain callable for surfaces that need raw lists
 * (focus queue UI, priority editor). New surfaces should prefer this.
 */
import { useMemo } from 'react';
import { useFocusQueue, type FocusQueueItem } from '@/hooks/useFocusQueue';
import { useDailyPriorities } from '@/hooks/useDailyPriorities';
import { aionPresence } from '@/copy/aionPresence';
import type { ArtifactKind } from '@/lib/aion/artifactBus';

export type NextStepKind =
  | 'priority-needed'    // user hasn't set today's priorities
  | 'focus-item'         // a queued focus task is ready
  | 'rest'               // nothing pressing; AION suggests pause
  | 'unknown';

export interface NextStep {
  kind: NextStepKind;
  item: FocusQueueItem | null;
  /** AION-voiced observation (not an instruction). Bilingual. */
  observation: { en: string; he: string };
  /** 0..1 — how confident the inference is. */
  confidence: number;
  /** Which artifact AION would manifest if asked to act on this. */
  suggestedManifestation: ArtifactKind | null;
  isLoading: boolean;
}

export function useNextStep(): NextStep {
  const focus = useFocusQueue();
  const priorities = useDailyPriorities();

  return useMemo<NextStep>(() => {
    const isLoading = focus.isLoading || priorities.isLoading;

    if (isLoading) {
      return {
        kind: 'unknown',
        item: null,
        observation: aionPresence.composeRhythm,
        confidence: 0,
        suggestedManifestation: null,
        isLoading: true,
      };
    }

    // Priorities not yet declared — AION nudges the rhythm-setting moment.
    if (!priorities.filledToday) {
      return {
        kind: 'priority-needed',
        item: null,
        observation: {
          en: 'I notice the day has no shape yet.',
          he: 'אני שם לב שעדיין אין צורה ליום.',
        },
        confidence: 0.7,
        suggestedManifestation: 'today-list',
        isLoading: false,
      };
    }

    // A focus item is queued and ready.
    if (focus.nextItem) {
      return {
        kind: 'focus-item',
        item: focus.nextItem,
        observation: {
          en: 'This thread keeps surfacing — now feels right.',
          he: 'החוט הזה ממשיך לעלות — עכשיו מרגיש נכון.',
        },
        confidence: 0.85,
        suggestedManifestation: 'today-list',
        isLoading: false,
      };
    }

    // Nothing pressing — AION suggests presence over action.
    return {
      kind: 'rest',
      item: null,
      observation: {
        en: 'Nothing is pulling at you right now. Stay with that.',
        he: 'שום דבר לא מושך אותך כרגע. הישאר עם זה.',
      },
      confidence: 0.6,
      suggestedManifestation: null,
      isLoading: false,
    };
  }, [focus.isLoading, focus.nextItem, priorities.isLoading, priorities.filledToday]);
}

export default useNextStep;