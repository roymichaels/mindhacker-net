// Default fallback data for launchpad summary when AI fails

export interface SummaryData {
  consciousness_analysis: {
    current_state: string;
    dominant_patterns: string[];
    blind_spots: string[];
    strengths: string[];
    growth_edges: string[];
  };
  life_direction: {
    core_aspiration: string;
    clarity_score: number;
    vision_summary: string;
  };
  identity_profile: {
    dominant_traits: string[];
    suggested_ego_state: string;
    values_hierarchy: string[];
    identity_title: {
      title: string;
      title_en: string;
      icon: string;
    };
  };
  behavioral_insights: {
    habits_to_transform: string[];
    habits_to_cultivate: string[];
    resistance_patterns: string[];
  };
  career_path: {
    current_status: string;
    aspiration: string;
    key_steps: string[];
  };
  transformation_potential: {
    readiness_score: number;
    primary_focus: string;
    secondary_focus: string;
  };
}

export interface WeekData {
  number: number;
  title: string;
  description: string;
  tasks: string[];
  goal: string;
  challenge: string;
  hypnosis_recommendation: string;
}

export interface MonthData {
  number: number;
  title: string;
  title_he: string;
  focus: string;
  milestone: string;
  weeks: WeekData[];
}

export interface PlanData {
  months: MonthData[];
}

export interface LaunchpadData {
  welcomeQuiz: any;
  personalProfile: any;
  lifestyleRoutine: any;
  identityBuilding: any;
  growthDeepDive: any;
  firstChat: any;
  firstChatTranscript: any;
  introspection: any;
  lifePlan: any;
  focusAreas: any;
  selectedFocusAreas: any;
  firstWeek: any;
  firstWeekActions: any;
  finalNotes: string | null;
}

const DEFAULT_WEEKS_MONTH_1: WeekData[] = [
  { number: 1, title: 'שבוע 1: התחלה חזקה', description: 'בניית שגרת בוקר ותרגול השתקפות יומי', tasks: ['קום בשעה קבועה', 'מדיטציה בוקר 10 דק', 'השתקפות ערב 5 דק', 'הגדר 3 עדיפויות יומיות', 'עקוב אחרי הרגלים'], goal: 'השלם שגרת בוקר 5/7 ימים', challenge: 'בלי טלפון בשעה הראשונה אחרי קימה', hypnosis_recommendation: 'סשן מוטיבציה ובהירות' },
  { number: 2, title: 'שבוע 2: בניית מומנטום', description: 'הוסף פעילות גופנית וחזק הרגלים', tasks: ['המשך שגרת בוקר', 'הוסף 20 דק אימון', 'תכנן יעדים שבועיים ביום ראשון', 'סקור התקדמות יומית', 'התחבר עם שותף אחריות'], goal: 'התאמן 4 פעמים השבוע', challenge: 'השלם משימה קשה ראשונה בכל יום', hypnosis_recommendation: 'סשן אנרגיה וחיוניות' },
  { number: 3, title: 'שבוע 3: העמקת תרגול', description: 'העמק מיינדפולנס והוסף זמן למידה', tasks: ['הארך מדיטציה ל-15 דק', 'הוסף 30 דק למידה יומית', 'תרגל יומן הכרת תודה', 'סקור והתאם הרגלים', 'הכן ארוחות לשבוע'], goal: 'השלם שגרה מלאה 6/7 ימים', challenge: 'ערב ללא מסכים', hypnosis_recommendation: 'סשן מיקוד וריכוז' },
  { number: 4, title: 'שבוע 4: אינטגרציה', description: 'שלב הרגלים והתכונן לשלב הבא', tasks: ['הערך התקדמות הרגלים', 'זהה מה עובד', 'התאם שגרה לפי הצורך', 'תכנן מיקוד חודש 2', 'חגוג הצלחות'], goal: 'כל 3 הרגלי ליבה מבוססים', challenge: 'שתף התקדמות עם מישהו', hypnosis_recommendation: 'סשן בניית ביטחון' },
];

const DEFAULT_WEEKS_MONTH_2: WeekData[] = [
  { number: 5, title: 'שבוע 5: בהירות קריירה', description: 'הגדר יעדי קריירה וצעדי פעולה', tasks: ['כתוב חזון קריירה', 'חקור הזדמנויות', 'זהה פערי מיומנויות', 'תכנן נתיב למידה', 'פנה לנטוורקינג'], goal: 'תוכנית פעולה קריירה מוכנה', challenge: 'פנה למנטור או מומחה', hypnosis_recommendation: 'ויזואליזציית הצלחה בקריירה' },
  { number: 6, title: 'שבוע 6: בניית מיומנויות', description: 'התמקד בפיתוח מיומנויות מפתח', tasks: ['התחל קורס אונליין', 'תרגל שעה יומית', 'תעד למידה', 'יישם בפרויקט קטן', 'בקש משוב'], goal: '7 שעות למידה ממוקדת', challenge: 'למד מישהו משהו שלמדת', hypnosis_recommendation: 'סשן האצת למידה' },
  { number: 7, title: 'שבוע 7: יישום', description: 'יישם מיומנויות בפרויקטים אמיתיים', tasks: ['התחל פרויקט אישי', 'תרום לקהילה', 'בנה חלק בתיק עבודות', 'קבל משוב חיצוני', 'שפר ותקן'], goal: 'השלם אבן דרך אחת בפרויקט', challenge: 'הצג עבודה לאחרים', hypnosis_recommendation: 'סשן יצירתיות וזרימה' },
  { number: 8, title: 'שבוע 8: הרחבה', description: 'הרחב רשת והזדמנויות', tasks: ['השתתף באירוע או וובינר', 'התחבר ל-5 אנשים חדשים', 'שתף מומחיות אונליין', 'חקור הזדמנויות', 'עדכן נוכחות מקצועית'], goal: 'הרחב רשת ב-5 קשרים', challenge: 'שיתוף פומבי של עבודה או תובנות', hypnosis_recommendation: 'סשן ביטחון חברתי' },
];

const DEFAULT_WEEKS_MONTH_3: WeekData[] = [
  { number: 9, title: 'שבוע 9: האצה', description: 'הגבר קצב ושאיפות', tasks: ['הצב יעדים גדולים יותר', 'הגדל זמן עבודה ממוקדת', 'התמודד עם אתגר גדול', 'חזק נקודות חולשה', 'חגוג התקדמות'], goal: 'השלם אבן דרך גדולה', challenge: 'עשה משהו שמפחיד אותך', hypnosis_recommendation: 'סשן פריצת מחסומים' },
  { number: 10, title: 'שבוע 10: אופטימיזציה', description: 'ייעל מערכות ושגרות', tasks: ['ביקורת שימוש בזמן', 'הסר בזבזני זמן', 'אוטומט משימות חוזרות', 'האצל היכן שאפשר', 'התמקד בהשפעה גבוהה'], goal: 'חסוך 5 שעות דרך ייעול', challenge: 'אמור לא ל-3 בקשות בעדיפות נמוכה', hypnosis_recommendation: 'סשן יעילות ופרודוקטיביות' },
  { number: 11, title: 'שבוע 11: מאסטרי', description: 'העמק מומחיות והשפעה', tasks: ['צור תוכן בעל ערך', 'עזור לאחרים עם מומחיותך', 'תעד את המסע שלך', 'תכנן שלב הבא', 'חזק הרגלי מפתח'], goal: 'שתף מומחיות עם 10 אנשים', challenge: 'הנחה סשן או סדנה', hypnosis_recommendation: 'סשן מאסטרי ומצוינות' },
  { number: 12, title: 'שבוע 12: חגיגה', description: 'סקור מסע ותכנן פרק הבא', tasks: ['השלם סקירת 90 יום', 'תעד כל ההישגים', 'תכנן 90 ימים הבאים', 'חגוג טרנספורמציה', 'הצב יעדים שאפתניים חדשים'], goal: 'סקירה ותוכנית חדשה מוכנות', challenge: 'שתף סיפור טרנספורמציה מלא', hypnosis_recommendation: 'סשן אינטגרציה וחגיגה' },
];

export function getDefaultSummaryAndPlan(data: LaunchpadData): {
  summary: SummaryData;
  plan: PlanData;
  scores: { consciousness: number; readiness: number; clarity: number };
} {
  const traits = data.identityBuilding?.traits?.map((t: any) => t.content).slice(0, 3) || [];
  const values = data.identityBuilding?.values?.map((v: any) => v.content).slice(0, 3) || [];
  const lifeDirection = data.lifePlan?.direction?.content || 'בניית חיים משמעותיים';

  return {
    summary: {
      consciousness_analysis: {
        current_state: 'על בסיס המידע שסיפקת, אתה נמצא ברגע מפנה במסע החיים שלך. עשית את הצעד החשוב של התבוננות פנימית והתחייבות לצמיחה.',
        dominant_patterns: ['מכוון שיפור עצמי', 'חשיבה מכוונת יעדים'],
        blind_spots: ['ייתכן שצריך לעבוד על עקביות', 'איזון בין שאפתנות לטיפול עצמי'],
        strengths: traits.length > 0 ? traits : ['מודעות עצמית', 'נכונות לצמוח'],
        growth_edges: ['משמעת יומית', 'חוסן רגשי'],
      },
      life_direction: {
        core_aspiration: lifeDirection,
        clarity_score: data.lifePlan?.direction?.clarity_score || 60,
        vision_summary: 'אתה עובד לקראת חיים של משמעות והגשמה, עם מיקוד בצמיחה אישית והישגים משמעותיים.',
      },
      identity_profile: {
        dominant_traits: traits.length > 0 ? traits : ['נחוש', 'מהורהר', 'צומח'],
        suggested_ego_state: 'guardian',
        values_hierarchy: values.length > 0 ? values : ['צמיחה', 'אותנטיות', 'הצלחה'],
        identity_title: {
          title: 'מעצב מודע',
          title_en: 'Conscious Shaper',
          icon: '🎯',
        },
      },
      behavioral_insights: {
        habits_to_transform: ['דחיינות', 'ספק עצמי'],
        habits_to_cultivate: ['שגרת בוקר', 'השתקפות יומית', 'פעולה עקבית'],
        resistance_patterns: ['פחד מכישלון', 'פרפקציוניזם'],
      },
      career_path: {
        current_status: 'בשלב מעבר או צמיחה',
        aspiration: 'עצמאות והשפעה גדולה יותר',
        key_steps: ['הגדר יעדים ברורים', 'בנה מיומנויות מפתח', 'פעל בעקביות'],
      },
      transformation_potential: {
        readiness_score: 75,
        primary_focus: 'ביסוס הרגלים יומיים',
        secondary_focus: 'פיתוח קריירה',
      },
    },
    plan: {
      months: [
        { number: 1, title: 'Foundations', title_he: 'יסודות', focus: 'בניית הרגלי ליבה ושגרות', milestone: '3 הרגלים חדשים מבוססים', weeks: DEFAULT_WEEKS_MONTH_1 },
        { number: 2, title: 'Building', title_he: 'בנייה', focus: 'מיקוד קריירה ופיתוח מיומנויות', milestone: 'צעד קריירה ראשון הושלם', weeks: DEFAULT_WEEKS_MONTH_2 },
        { number: 3, title: 'Momentum', title_he: 'תנופה', focus: 'סקייל והצלחה בת קיימא', milestone: 'תוכנית טרנספורמציה הוכחה', weeks: DEFAULT_WEEKS_MONTH_3 },
      ],
    },
    scores: {
      consciousness: 70,
      readiness: 75,
      clarity: data.lifePlan?.direction?.clarity_score || 65,
    },
  };
}
