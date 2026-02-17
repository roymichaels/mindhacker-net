/**
 * Mind Pillar Quest Spec
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.mind.answers' };

export const mindQuestSpec: FlowSpec = {
  id: 'quest-mind',
  title_he: 'מנטלי ורגשי',
  title_en: 'Mind & Emotions',
  steps: [{
    id: 1,
    title_he: 'מנטלי',
    title_en: 'Mind',
    renderer: 'card',
    miniSteps: [
      {
        id: 'meditation_practice',
        title_he: 'האם אתה מתרגל מדיטציה?',
        title_en: 'Do you practice meditation?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'daily', label_he: 'כל יום', label_en: 'Daily', icon: '🧘' },
          { value: 'sometimes', label_he: 'לפעמים', label_en: 'Sometimes', icon: '🙏' },
          { value: 'tried', label_he: 'ניסיתי פעם', label_en: 'Tried once', icon: '🤔' },
          { value: 'never', label_he: 'אף פעם', label_en: 'Never', icon: '🆕' },
        ],
      },
      {
        id: 'stress_coping',
        title_he: 'איך אתה מתמודד עם לחץ?',
        title_en: 'How do you cope with stress?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
        options: [
          { value: 'exercise', label_he: 'פעילות גופנית', label_en: 'Exercise', icon: '🏃' },
          { value: 'talk', label_he: 'שיחה עם מישהו', label_en: 'Talking to someone', icon: '💬' },
          { value: 'nature', label_he: 'טבע', label_en: 'Nature', icon: '🌿' },
          { value: 'music', label_he: 'מוזיקה', label_en: 'Music', icon: '🎵' },
          { value: 'food', label_he: 'אוכל', label_en: 'Food', icon: '🍫' },
          { value: 'avoidance', label_he: 'הימנעות', label_en: 'Avoidance', icon: '😶' },
          { value: 'breathing', label_he: 'נשימות', label_en: 'Breathing', icon: '🌬️' },
        ],
      },
      {
        id: 'therapy_experience',
        title_he: 'האם יש לך ניסיון עם טיפול/אימון?',
        title_en: 'Have you had therapy or coaching?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'current', label_he: 'כרגע בטיפול', label_en: 'Currently in therapy', icon: '🛋️' },
          { value: 'past', label_he: 'בעבר', label_en: 'In the past', icon: '📝' },
          { value: 'interested', label_he: 'מעוניין', label_en: 'Interested', icon: '🤔' },
          { value: 'never', label_he: 'לא', label_en: 'No', icon: '❌' },
        ],
      },
      {
        id: 'decision_style',
        title_he: 'איך אתה מקבל החלטות?',
        title_en: 'How do you make decisions?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'gut', label_he: 'תחושת בטן', label_en: 'Gut feeling', icon: '🎯' },
          { value: 'analysis', label_he: 'ניתוח מעמיק', label_en: 'Deep analysis', icon: '📊' },
          { value: 'advice', label_he: 'מבקש עצות', label_en: 'Seeking advice', icon: '👥' },
          { value: 'avoid', label_he: 'נוטה לדחות', label_en: 'Tend to postpone', icon: '⏳' },
        ],
      },
      {
        id: 'failure_response',
        title_he: 'מה קורה לך כשאתה נכשל?',
        title_en: 'How do you respond to failure?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'learn', label_he: 'לומד ומתקדם', label_en: 'Learn and move on', icon: '📈' },
          { value: 'self-critical', label_he: 'ביקורת עצמית', label_en: 'Self-critical', icon: '😞' },
          { value: 'give-up', label_he: 'נוטה לוותר', label_en: 'Tend to give up', icon: '🏳️' },
          { value: 'try-harder', label_he: 'מנסה יותר חזק', label_en: 'Try harder', icon: '💪' },
        ],
      },
      {
        id: 'emotional_awareness',
        title_he: 'כמה אתה מודע לרגשות שלך?',
        title_en: 'How emotionally aware are you?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'very', label_he: 'מאוד מודע', label_en: 'Very aware', icon: '🔮' },
          { value: 'somewhat', label_he: 'במידה מסוימת', label_en: 'Somewhat', icon: '🙂' },
          { value: 'learning', label_he: 'לומד להכיר', label_en: 'Learning', icon: '🌱' },
          { value: 'disconnected', label_he: 'מנותק', label_en: 'Disconnected', icon: '😶' },
        ],
      },
    ],
  }],
};

registerFlow(mindQuestSpec);
