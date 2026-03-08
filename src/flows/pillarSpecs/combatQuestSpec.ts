/**
 * Combat Pillar Quest Spec
 * Collects martial arts, training mode, sparring habits to generate combat practices.
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.combat.answers' };

export const combatQuestSpec: FlowSpec = {
  id: 'quest-combat',
  title_he: 'לחימה ועוצמה',
  title_en: 'Combat & Resilience',
  steps: [{
    id: 1,
    title_he: 'לחימה',
    title_en: 'Combat',
    renderer: 'card',
    miniSteps: [
      {
        id: 'combat_experience',
        title_he: 'מה הניסיון שלך באומנויות לחימה?',
        title_en: 'What is your martial arts experience?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'active', label_he: 'מתאמן באופן פעיל', label_en: 'Actively training', icon: '🥋' },
          { value: 'past', label_he: 'התאמנתי בעבר', label_en: 'Trained in the past', icon: '📜' },
          { value: 'interested', label_he: 'מתעניין להתחיל', label_en: 'Interested to start', icon: '🔥' },
          { value: 'none', label_he: 'אין ניסיון', label_en: 'No experience', icon: '🆕' },
        ],
      },
      {
        id: 'combat_disciplines',
        title_he: 'אילו דיסציפלינות מעניינות אותך?',
        title_en: 'Which disciplines interest you?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
        options: [
          { value: 'boxing', label_he: 'אגרוף', label_en: 'Boxing', icon: '🥊' },
          { value: 'muay_thai', label_he: 'מואי טאי', label_en: 'Muay Thai', icon: '🦵' },
          { value: 'bjj', label_he: 'ג׳יו ג׳יטסו ברזילאי', label_en: 'BJJ', icon: '🤼' },
          { value: 'mma', label_he: 'MMA', label_en: 'MMA', icon: '🥋' },
          { value: 'krav_maga', label_he: 'קרב מגע', label_en: 'Krav Maga', icon: '⚔️' },
          { value: 'karate', label_he: 'קראטה', label_en: 'Karate', icon: '🥋' },
          { value: 'wrestling', label_he: 'היאבקות', label_en: 'Wrestling', icon: '💪' },
          { value: 'taekwondo', label_he: 'טאקוונדו', label_en: 'Taekwondo', icon: '🦶' },
          { value: 'judo', label_he: 'ג׳ודו', label_en: 'Judo', icon: '🥋' },
          { value: 'functional', label_he: 'אימון פונקציונלי / קרוספיט', label_en: 'Functional / CrossFit', icon: '🏋️' },
        ],
      },
      {
        id: 'combat_frequency',
        title_he: 'כמה פעמים בשבוע אתה רוצה להתאמן?',
        title_en: 'How many times per week do you want to train?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: '1-2', label_he: '1-2 פעמים', label_en: '1-2 times', icon: '🏃' },
          { value: '3-4', label_he: '3-4 פעמים', label_en: '3-4 times', icon: '💪' },
          { value: '5-6', label_he: '5-6 פעמים', label_en: '5-6 times', icon: '🔥' },
          { value: 'daily', label_he: 'כל יום', label_en: 'Every day', icon: '⚡' },
        ],
      },
      {
        id: 'combat_training_mode',
        title_he: 'איך אתה מעדיף להתאמן?',
        title_en: 'How do you prefer to train?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'gym', label_he: 'חדר כושר / מועדון', label_en: 'Gym / Club', icon: '🏢' },
          { value: 'solo', label_he: 'אימון עצמאי', label_en: 'Solo training', icon: '🧘' },
          { value: 'hybrid', label_he: 'שילוב', label_en: 'Hybrid', icon: '🔄' },
          { value: 'outdoor', label_he: 'בחוץ / פארק', label_en: 'Outdoor / Park', icon: '🌿' },
        ],
      },
      {
        id: 'combat_conditioning',
        title_he: 'אילו תרגולי הכנה מעניינים אותך?',
        title_en: 'Which conditioning practices interest you?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1 },
        dbPath: DB,
        options: [
          { value: 'shadowboxing', label_he: 'שאדו בוקסינג', label_en: 'Shadow boxing', icon: '🥊' },
          { value: 'heavy_bag', label_he: 'שק אגרוף', label_en: 'Heavy bag', icon: '🎯' },
          { value: 'jump_rope', label_he: 'קפיצה בחבל', label_en: 'Jump rope', icon: '🪢' },
          { value: 'mobility', label_he: 'גמישות וניידות', label_en: 'Mobility & Flexibility', icon: '🤸' },
          { value: 'strength', label_he: 'אימון כוח', label_en: 'Strength training', icon: '🏋️' },
          { value: 'cardio', label_he: 'סיבולת לב-ריאה', label_en: 'Cardio endurance', icon: '❤️' },
          { value: 'cold_exposure', label_he: 'חשיפה לקור', label_en: 'Cold exposure', icon: '🧊' },
        ],
      },
      {
        id: 'combat_goal',
        title_he: 'מה המטרה העיקרית שלך בתחום הלחימה?',
        title_en: 'What is your main combat goal?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'self_defense', label_he: 'הגנה עצמית', label_en: 'Self-defense', icon: '🛡️' },
          { value: 'fitness', label_he: 'כושר גופני', label_en: 'Physical fitness', icon: '💪' },
          { value: 'confidence', label_he: 'ביטחון עצמי', label_en: 'Confidence', icon: '🔥' },
          { value: 'discipline', label_he: 'משמעת ומיקוד', label_en: 'Discipline & Focus', icon: '🎯' },
          { value: 'compete', label_he: 'תחרות', label_en: 'Competition', icon: '🏆' },
        ],
      },
    ],
  }],
};

registerFlow(combatQuestSpec);
