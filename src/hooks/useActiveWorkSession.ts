/**
 * useActiveWorkSession — lightweight hook to check if user has an active (running) work session.
 */
import { useTodayWorkSessions } from '@/hooks/useWorkSessions';

export function useActiveWorkSession() {
  const { data: sessions = [] } = useTodayWorkSessions();
  const active = sessions.find(s => !s.ended_at) || null;
  return {
    isWorking: !!active,
    activeSession: active,
    isDeepWork: active?.is_deep_work ?? false,
  };
}
