/**
 * Pillar Quest Specs — Registry & Metadata
 */
import './healthQuestSpec';
import './mindQuestSpec';
import './relationshipsQuestSpec';
import './careerQuestSpec';
import './moneyQuestSpec';
import './creativityQuestSpec';
import './socialQuestSpec';
import './spiritualityQuestSpec';

export { healthQuestSpec } from './healthQuestSpec';
export { mindQuestSpec } from './mindQuestSpec';
export { relationshipsQuestSpec } from './relationshipsQuestSpec';
export { careerQuestSpec } from './careerQuestSpec';
export { moneyQuestSpec } from './moneyQuestSpec';
export { creativityQuestSpec } from './creativityQuestSpec';
export { socialQuestSpec } from './socialQuestSpec';
export { spiritualityQuestSpec } from './spiritualityQuestSpec';

export interface PillarQuestMeta {
  id: string;
  specId: string;
  icon: string;
  title_he: string;
  title_en: string;
  color: string; // tailwind color token
}

export const PILLAR_QUESTS: PillarQuestMeta[] = [
  { id: 'consciousness', specId: 'quest-consciousness', icon: '🔮', title_he: 'תודעה', title_en: 'Consciousness', color: 'text-blue-500' },
  { id: 'health', specId: 'quest-health', icon: '💪', title_he: 'בריאות וכושר', title_en: 'Health & Fitness', color: 'text-red-500' },
  { id: 'mind', specId: 'quest-mind', icon: '🧠', title_he: 'מנטלי ורגשי', title_en: 'Mind & Emotions', color: 'text-purple-500' },
  { id: 'relationships', specId: 'quest-relationships', icon: '❤️', title_he: 'מערכות יחסים', title_en: 'Relationships', color: 'text-pink-500' },
  { id: 'career', specId: 'quest-career', icon: '💼', title_he: 'קריירה ועבודה', title_en: 'Career & Work', color: 'text-amber-500' },
  { id: 'money', specId: 'quest-money', icon: '💰', title_he: 'כסף ופיננסים', title_en: 'Money & Finances', color: 'text-emerald-500' },
  { id: 'creativity', specId: 'quest-creativity', icon: '🎨', title_he: 'יצירתיות ותחביבים', title_en: 'Creativity & Hobbies', color: 'text-cyan-500' },
  { id: 'social', specId: 'quest-social', icon: '👥', title_he: 'חברתי וקהילה', title_en: 'Social & Community', color: 'text-blue-500' },
  { id: 'spirituality', specId: 'quest-spirituality', icon: '✨', title_he: 'רוחניות ומשמעות', title_en: 'Spirituality & Meaning', color: 'text-violet-500' },
];
