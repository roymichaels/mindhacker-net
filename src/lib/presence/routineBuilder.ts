/**
 * @module lib/presence/routineBuilder
 * @purpose Generates structured daily routines from top levers.
 */

import type { RoutineIntensity, RoutineItem, ActiveRoutine, LeverRecommendation } from './types';
import { getLeverById } from './levers';

const INTENSITY_LIMITS: Record<RoutineIntensity, number> = {
  minimal: 5,
  standard: 12,
  full: 20,
};

export function buildRoutine(
  topLevers: LeverRecommendation[],
  intensity: RoutineIntensity = 'standard',
): ActiveRoutine {
  const maxMinutes = INTENSITY_LIMITS[intensity];
  const items: RoutineItem[] = [];
  let totalMinutes = 0;

  // Always include posture + skincare in morning if available
  const priorityOrder = [
    'forward_head_correction', 'chin_tuck_drills', 'rounded_shoulders_fix',
    'skincare_basics', 'fit_checklist', 'facial_depuff', 'eyebrow_grooming',
    'presence_stance', 'tongue_posture', 'nasal_breathing',
    'brushing_flossing', 'breath_hygiene', 'pelvic_alignment',
    'sleep_window', 'morning_light', 'acne_routine', 'skin_triggers',
  ];

  // Collect lever IDs from recommendations
  const leverIds = topLevers.map(l => l.leverId);
  // Add priority items that weren't in top levers
  for (const pid of priorityOrder) {
    if (!leverIds.includes(pid)) leverIds.push(pid);
  }

  for (const leverId of leverIds) {
    if (totalMinutes >= maxMinutes) break;

    const lever = getLeverById(leverId);
    if (!lever || !lever.routineBlock) continue;

    const dur = lever.routineDuration ?? 3;
    if (totalMinutes + dur > maxMinutes && dur > 0) continue;

    items.push({
      id: `routine_${leverId}`,
      leverId,
      title: lever.title,
      block: lever.routineBlock,
      duration_min: dur,
      instructions: lever.instructions[0] || '',
    });

    totalMinutes += dur;
  }

  return {
    intensity,
    levers: items.map(i => i.leverId),
    items,
  };
}

/** Group routine items by block */
export function groupByBlock(items: RoutineItem[]): Record<'morning' | 'daytime' | 'evening', RoutineItem[]> {
  return {
    morning: items.filter(i => i.block === 'morning'),
    daytime: items.filter(i => i.block === 'daytime'),
    evening: items.filter(i => i.block === 'evening'),
  };
}
