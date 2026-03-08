/**
 * Centralized ego state label/icon map.
 * Import this instead of duplicating inline mappings.
 */

export const EGO_STATE_ICONS: Record<string, string> = {
  warrior: '⚔️',
  guardian: '🛡️',
  creator: '🎨',
  seeker: '🔍',
  sage: '🧙',
};

export const EGO_STATE_LABELS: Record<string, { en: string; he: string }> = {
  warrior: { en: 'Warrior', he: 'לוחם' },
  guardian: { en: 'Guardian', he: 'שומר' },
  creator: { en: 'Creator', he: 'יוצר' },
  seeker: { en: 'Seeker', he: 'מחפש' },
  sage: { en: 'Sage', he: 'חכם' },
};

export function getEgoStateIcon(state: string): string {
  return EGO_STATE_ICONS[state?.toLowerCase()] || '🛡️';
}

export function getEgoStateLabel(state: string, language: 'he' | 'en'): string {
  const key = state?.toLowerCase();
  const labels = EGO_STATE_LABELS[key];
  if (!labels) return state || '';
  return language === 'he' ? labels.he : labels.en;
}
