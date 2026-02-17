/**
 * Centralized Feedback Messages & Toast Utilities
 * 
 * Provides standardized, bilingual (Hebrew/English) feedback messages
 * for consistent user communication across the application.
 */

import { toast } from 'sonner';

type Language = 'he' | 'en';

interface FeedbackMessage {
  he: string;
  en: string;
}

/**
 * Centralized feedback message catalog
 */
export const FEEDBACK = {
  SUCCESS: {
    SAVED: { he: '✓ נשמר בהצלחה', en: '✓ Saved successfully' },
    CREATED: { he: '✓ נוצר בהצלחה', en: '✓ Created successfully' },
    UPDATED: { he: '✓ עודכן בהצלחה', en: '✓ Updated successfully' },
    DELETED: { he: '✓ נמחק בהצלחה', en: '✓ Deleted successfully' },
    COPIED: { he: '📋 הועתק ללוח', en: '📋 Copied to clipboard' },
    
    // Tasks & Habits
    TASK_COMPLETED: { he: '✅ המשימה הושלמה!', en: '✅ Task completed!' },
    HABIT_LOGGED: { he: '🔥 הרגל נרשם!', en: '🔥 Habit logged!' },
    CHECKLIST_CREATED: { he: '📋 רשימה נוצרה', en: '📋 Checklist created' },
    REMINDER_SET: { he: '⏰ תזכורת נקבעה', en: '⏰ Reminder set' },
    
    // Gamification
    XP_EARNED: { he: '✨ קיבלת XP!', en: '✨ XP earned!' },
    LEVEL_UP: { he: '🎉 עלית רמה!', en: '🎉 Level up!' },
    ACHIEVEMENT_UNLOCKED: { he: '🏆 הישג נפתח!', en: '🏆 Achievement unlocked!' },
    ENERGY_EARNED: { he: '⚡ קיבלת אנרגיה!', en: '⚡ Energy earned!' },
    
    // Sessions
    SESSION_COMPLETE: { he: '🧘 הסשן הושלם!', en: '🧘 Session complete!' },
    SESSION_SAVED: { he: '💾 הסשן נשמר', en: '💾 Session saved' },
    
    // Auth
    LOGGED_IN: { he: '👋 ברוך הבא!', en: '👋 Welcome!' },
    LOGGED_OUT: { he: '👋 להתראות!', en: '👋 Goodbye!' },
    
    // Journey
    STEP_COMPLETED: { he: '🎯 שלב הושלם!', en: '🎯 Step completed!' },
    JOURNEY_COMPLETE: { he: '🌟 המסע הושלם!', en: '🌟 Journey complete!' },
  },
  
  ERROR: {
    GENERIC: { he: 'משהו השתבש', en: 'Something went wrong' },
    NETWORK: { he: 'שגיאת רשת', en: 'Network error' },
    UNAUTHORIZED: { he: 'אין הרשאה', en: 'Unauthorized' },
    NOT_FOUND: { he: 'לא נמצא', en: 'Not found' },
    VALIDATION: { he: 'נתונים לא תקינים', en: 'Invalid data' },
    TIMEOUT: { he: 'הזמן הקצוב עבר', en: 'Request timed out' },
    
    // Specific
    SAVE_FAILED: { he: 'השמירה נכשלה', en: 'Save failed' },
    LOAD_FAILED: { he: 'הטעינה נכשלה', en: 'Load failed' },
    DELETE_FAILED: { he: 'המחיקה נכשלה', en: 'Delete failed' },
    NOT_ENOUGH_ENERGY: { he: 'אין מספיק אנרגיה', en: 'Not enough energy' },
    SESSION_EXPIRED: { he: 'החיבור פג תוקף', en: 'Session expired' },
    
    // Voice
    TTS_FAILED: { he: 'ההקראה נכשלה', en: 'Text-to-speech failed' },
    MIC_NOT_ALLOWED: { he: 'אין גישה למיקרופון', en: 'Microphone not allowed' },
  },
  
  INFO: {
    LOADING: { he: 'טוען...', en: 'Loading...' },
    PROCESSING: { he: 'מעבד...', en: 'Processing...' },
    GENERATING: { he: 'יוצר...', en: 'Generating...' },
    SAVING: { he: 'שומר...', en: 'Saving...' },
    SYNCING: { he: 'מסנכרן...', en: 'Syncing...' },
    
    // Voice
    LISTENING: { he: '🎤 מקשיב...', en: '🎤 Listening...' },
    SPEAKING: { he: '🔊 מדבר...', en: '🔊 Speaking...' },
    PREPARING_VOICE: { he: '🎵 מכין קול...', en: '🎵 Preparing voice...' },
  },
  
  WARNING: {
    UNSAVED_CHANGES: { he: 'יש שינויים שלא נשמרו', en: 'You have unsaved changes' },
    LOW_ENERGY: { he: 'האנרגיה נמוכה', en: 'Low on energy' },
    RATE_LIMITED: { he: 'נא להמתין לפני ניסיון נוסף', en: 'Please wait before trying again' },
  },
} as const;

/**
 * Get the current language from localStorage or default to Hebrew
 */
const getCurrentLanguage = (): Language => {
  try {
    const stored = localStorage.getItem('language');
    return stored === 'en' ? 'en' : 'he';
  } catch {
    return 'he';
  }
};

/**
 * Show a success toast with the appropriate language
 */
export const showSuccess = (
  key: keyof typeof FEEDBACK.SUCCESS,
  description?: string
): void => {
  const lang = getCurrentLanguage();
  const msg = FEEDBACK.SUCCESS[key];
  toast.success(msg[lang], description ? { description } : undefined);
};

/**
 * Show an error toast with the appropriate language
 */
export const showError = (
  key: keyof typeof FEEDBACK.ERROR,
  description?: string
): void => {
  const lang = getCurrentLanguage();
  const msg = FEEDBACK.ERROR[key];
  toast.error(msg[lang], description ? { description } : undefined);
};

/**
 * Show an info toast with the appropriate language
 */
export const showInfo = (
  key: keyof typeof FEEDBACK.INFO,
  description?: string
): void => {
  const lang = getCurrentLanguage();
  const msg = FEEDBACK.INFO[key];
  toast.info(msg[lang], description ? { description } : undefined);
};

/**
 * Show a warning toast with the appropriate language
 */
export const showWarning = (
  key: keyof typeof FEEDBACK.WARNING,
  description?: string
): void => {
  const lang = getCurrentLanguage();
  const msg = FEEDBACK.WARNING[key];
  toast.warning(msg[lang], description ? { description } : undefined);
};

/**
 * Show a custom toast message
 */
export const showCustom = (
  message: FeedbackMessage,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  description?: string
): void => {
  const lang = getCurrentLanguage();
  const toastFn = type === 'success' ? toast.success 
    : type === 'error' ? toast.error 
    : type === 'warning' ? toast.warning 
    : toast.info;
  toastFn(message[lang], description ? { description } : undefined);
};

/**
 * Show XP earned toast with amount
 */
export const showXpEarned = (amount: number): void => {
  const lang = getCurrentLanguage();
  const msg = lang === 'he' ? `✨ +${amount} XP!` : `✨ +${amount} XP!`;
  toast.success(msg);
};

/**
 * Show energy earned toast with amount
 */
export const showEnergyEarned = (amount: number): void => {
  const lang = getCurrentLanguage();
  const msg = lang === 'he' ? `⚡ +${amount} אנרגיה!` : `⚡ +${amount} Energy!`;
  toast.success(msg);
};

/** @deprecated Use showEnergyEarned */
export const showTokensEarned = showEnergyEarned;

/**
 * Show level up toast with new level
 */
export const showLevelUp = (newLevel: number): void => {
  const lang = getCurrentLanguage();
  const msg = lang === 'he' 
    ? `🎉 עלית לרמה ${newLevel}!` 
    : `🎉 You're now level ${newLevel}!`;
  toast.success(msg);
};
