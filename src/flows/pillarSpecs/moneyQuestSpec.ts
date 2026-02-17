/**
 * Money Pillar Quest Spec
 */
import type { FlowSpec } from '@/lib/flow/types';
import { registerFlow } from '@/lib/flow/flowSpec';

const DB = { table: 'launchpad_progress', column: 'step_2_profile_data', jsonPath: 'pillar_quests.money.answers' };

export const moneyQuestSpec: FlowSpec = {
  id: 'quest-money',
  title_he: 'כסף ופיננסים',
  title_en: 'Money & Finances',
  steps: [{
    id: 1,
    title_he: 'כסף',
    title_en: 'Money',
    renderer: 'card',
    miniSteps: [
      {
        id: 'financial_comfort',
        title_he: 'איך אתה מרגיש כלכלית?',
        title_en: 'How do you feel financially?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'comfortable', label_he: 'בנוח', label_en: 'Comfortable', icon: '😌' },
          { value: 'okay', label_he: 'סביר', label_en: 'Okay', icon: '🙂' },
          { value: 'tight', label_he: 'צפוף', label_en: 'Tight', icon: '😬' },
          { value: 'stressed', label_he: 'לחוץ', label_en: 'Stressed', icon: '😰' },
        ],
      },
      {
        id: 'savings_habits',
        title_he: 'האם אתה חוסך באופן קבוע?',
        title_en: 'Do you save regularly?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'consistent', label_he: 'כן, באופן עקבי', label_en: 'Yes, consistently', icon: '🐷' },
          { value: 'sometimes', label_he: 'לפעמים', label_en: 'Sometimes', icon: '🤷' },
          { value: 'rarely', label_he: 'לעיתים רחוקות', label_en: 'Rarely', icon: '😕' },
          { value: 'never', label_he: 'לא', label_en: 'No', icon: '❌' },
        ],
      },
      {
        id: 'spending_awareness',
        title_he: 'כמה אתה מודע להוצאות שלך?',
        title_en: 'How aware are you of your spending?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'tracked', label_he: 'עוקב אחרי כל שקל', label_en: 'Track every penny', icon: '📊' },
          { value: 'general', label_he: 'ידע כללי', label_en: 'General idea', icon: '🙂' },
          { value: 'vague', label_he: 'לא ממש יודע', label_en: 'Not really sure', icon: '🤔' },
          { value: 'no-idea', label_he: 'אין לי מושג', label_en: 'No idea', icon: '😶' },
        ],
      },
      {
        id: 'financial_goals',
        title_he: 'מה המטרות הכלכליות שלך?',
        title_en: 'What are your financial goals?',
        inputType: 'multi_select',
        validation: { required: true, minSelected: 1, maxSelected: 3 },
        dbPath: DB,
        options: [
          { value: 'emergency-fund', label_he: 'קרן חירום', label_en: 'Emergency fund', icon: '🛡️' },
          { value: 'debt-free', label_he: 'חיים ללא חובות', label_en: 'Debt-free', icon: '🆓' },
          { value: 'invest', label_he: 'להתחיל להשקיע', label_en: 'Start investing', icon: '📈' },
          { value: 'income-growth', label_he: 'הגדלת הכנסה', label_en: 'Income growth', icon: '💰' },
          { value: 'passive-income', label_he: 'הכנסה פסיבית', label_en: 'Passive income', icon: '🏖️' },
          { value: 'retirement', label_he: 'חיסכון לפנסיה', label_en: 'Retirement savings', icon: '🏦' },
        ],
      },
      {
        id: 'money_mindset',
        title_he: 'מה האמונה העיקרית שלך לגבי כסף?',
        title_en: 'What is your core belief about money?',
        inputType: 'single_select',
        validation: { required: true },
        dbPath: DB,
        options: [
          { value: 'tool', label_he: 'כלי לחופש', label_en: 'Tool for freedom', icon: '🦅' },
          { value: 'security', label_he: 'ביטחון', label_en: 'Security', icon: '🛡️' },
          { value: 'stress', label_he: 'מקור ללחץ', label_en: 'Source of stress', icon: '😰' },
          { value: 'complicated', label_he: 'יחס מסובך', label_en: 'Complicated', icon: '🤷' },
        ],
      },
    ],
  }],
};

registerFlow(moneyQuestSpec);
