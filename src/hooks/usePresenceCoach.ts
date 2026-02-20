/**
 * @module hooks/usePresenceCoach
 * @purpose Read/write Presence Coach data from life_domains table (domain_id = 'presence').
 */

import { useLifeDomains } from './useLifeDomains';
import { useMemo, useCallback } from 'react';
import type {
  PresenceDomainConfig,
  PresenceAssessmentResult,
  ActiveRoutine,
  RoutineLog,
  PresencePreferences,
} from '@/lib/presence/types';

export function usePresenceCoach() {
  const { getDomain, upsertDomain, isLoading } = useLifeDomains();

  const domainRow = getDomain('presence');
  const config: PresenceDomainConfig = useMemo(
    () => (domainRow?.domain_config as PresenceDomainConfig) ?? {},
    [domainRow],
  );

  const saveConfig = useCallback(
    async (patch: Partial<PresenceDomainConfig>) => {
      const merged = { ...config, ...patch };
      await upsertDomain.mutateAsync({
        domainId: 'presence',
        config: merged as Record<string, any>,
        status: merged.latest_assessment ? 'configured' : undefined,
      });
    },
    [config, upsertDomain],
  );

  const saveAssessment = useCallback(
    async (result: PresenceAssessmentResult, prefs: PresencePreferences) => {
      const history = [...(config.history ?? [])];
      if (config.latest_assessment) history.unshift(config.latest_assessment);
      await saveConfig({
        latest_assessment: result,
        history,
        preferences: prefs,
      });
    },
    [config, saveConfig],
  );

  const saveRoutine = useCallback(
    async (routine: ActiveRoutine) => {
      await saveConfig({ active_routine: routine });
    },
    [saveConfig],
  );

  const logRoutineCompletion = useCallback(
    async (completedItems: string[]) => {
      const total = config.active_routine?.items.length ?? 1;
      const log: RoutineLog = {
        date: new Date().toISOString().slice(0, 10),
        completed_items: completedItems,
        completion_rate: Math.round((completedItems.length / total) * 100),
      };
      const logs = [...(config.routine_logs ?? [])];
      // Replace if same date
      const idx = logs.findIndex(l => l.date === log.date);
      if (idx >= 0) logs[idx] = log; else logs.push(log);
      await saveConfig({ routine_logs: logs });
    },
    [config, saveConfig],
  );

  const setReassessCadence = useCallback(
    async (cadence: 7 | 14 | 30) => {
      const next = new Date();
      next.setDate(next.getDate() + cadence);
      await saveConfig({ reassess_cadence: cadence, next_reassess: next.toISOString() });
    },
    [saveConfig],
  );

  return {
    config,
    isLoading,
    isSaving: upsertDomain.isPending,
    saveAssessment,
    saveRoutine,
    logRoutineCompletion,
    setReassessCadence,
    saveConfig,
  };
}
