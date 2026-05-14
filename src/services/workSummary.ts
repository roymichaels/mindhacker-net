/**
 * Work summary service — Phase 2 Batch 3 (read-only adapter).
 */
import { getTodaySessions, getTodayWorkScore } from '@/services/workSessions';

export async function summarizeWorkToday(userId: string): Promise<{
  text: string;
  totalMinutes: number;
  deepWorkMinutes: number;
  sessions: number;
  active: boolean;
}> {
  if (!userId) return { text: 'אין משתמש.', totalMinutes: 0, deepWorkMinutes: 0, sessions: 0, active: false };
  const [sessions, score] = await Promise.all([
    getTodaySessions(userId).catch(() => []),
    getTodayWorkScore(userId).catch(() => null),
  ]);
  const total = score?.total_minutes ?? 0;
  const deep = score?.deep_work_minutes ?? 0;
  const active = sessions.some((s) => !s.ended_at);
  const text = sessions.length
    ? `היום: ${total} דק' (${deep} עומק) · ${sessions.length} סשנים${active ? ' · סשן פעיל כעת' : ''}`
    : 'עוד לא היו סשנים היום.';
  return { text, totalMinutes: total, deepWorkMinutes: deep, sessions: sessions.length, active };
}

export interface PreviewWorkSession {
  text: string;
  title: string;
  isDeepWork: boolean;
}

export function previewStartSession(input: { title?: string; isDeepWork?: boolean }): PreviewWorkSession {
  const title = (input.title ?? 'סשן עבודה').slice(0, 80);
  return {
    text: `מוכן להתחיל "${title}"${input.isDeepWork ? ' · עבודה עמוקה' : ''}.`,
    title,
    isDeepWork: !!input.isDeepWork,
  };
}