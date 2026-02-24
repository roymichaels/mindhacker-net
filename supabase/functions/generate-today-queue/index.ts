import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";

/**
 * generate-today-queue v2
 * 
 * Now reads from the 90-day strategy (life_plans.plan_data.strategy)
 * to produce assessment-informed, concrete daily tasks like
 * "Combat Workout — Shadowboxing 3 Rounds", "Strength Training — Upper Body", etc.
 * 
 * Falls back to smart templates if no strategy exists yet.
 */

// ─── Pillar metadata ──────────────────────────────────────────
const BODY_PILLARS = ['vitality', 'power', 'combat'];
const MIND_PILLARS = ['focus', 'consciousness', 'expansion'];
const ARENA_PILLARS = ['wealth', 'influence', 'relationships', 'business', 'projects', 'play'];

function getHub(pillar: string): 'core' | 'arena' {
  return ARENA_PILLARS.includes(pillar) ? 'arena' : 'core';
}

// ─── Tier limits ──────────────────────────────────────────────
function getMaxActions(tier: string): number {
  switch (tier) {
    case "mastery":
    case "consistency": return 9;  // Apex
    case "structure": return 7;    // Plus
    default: return 5;             // Free
  }
}

// ─── Intensity multiplier for the day ─────────────────────────
function getDayIntensity(): { label: string; multiplier: number } {
  const dow = new Date().getDay(); // 0=Sun
  // Pattern: Sun=recovery, Mon=high, Tue=medium, Wed=high, Thu=medium, Fri=light, Sat=medium
  const pattern: Record<number, { label: string; multiplier: number }> = {
    0: { label: 'recovery', multiplier: 0.5 },
    1: { label: 'high', multiplier: 1.2 },
    2: { label: 'medium', multiplier: 1.0 },
    3: { label: 'high', multiplier: 1.2 },
    4: { label: 'medium', multiplier: 1.0 },
    5: { label: 'light', multiplier: 0.7 },
    6: { label: 'medium', multiplier: 1.0 },
  };
  return pattern[dow] || { label: 'medium', multiplier: 1.0 };
}

// ─── Fallback templates (used when no strategy exists) ────────
interface FallbackAction {
  pillar: string;
  action_en: string;
  action_he: string;
  duration_min: number;
  block_type: string;
  urgency: number;
}

const FALLBACK_ACTIONS: FallbackAction[] = [
  { pillar: 'vitality', action_en: 'Morning Sunlight Walk — 10 min', action_he: 'הליכת אור בוקר — 10 דקות', duration_min: 10, block_type: 'body', urgency: 9 },
  { pillar: 'vitality', action_en: 'Evening Shutdown Protocol', action_he: 'פרוטוקול כיבוי ערב', duration_min: 15, block_type: 'body', urgency: 7 },
  { pillar: 'power', action_en: 'Strength Training — Compound Lifts', action_he: 'אימון כוח — הרמות מורכבות', duration_min: 40, block_type: 'body', urgency: 7 },
  { pillar: 'combat', action_en: 'Combat Workout — Shadowboxing 3 Rounds', action_he: 'אימון לחימה — 3 סיבובי צללים', duration_min: 20, block_type: 'body', urgency: 6 },
  { pillar: 'combat', action_en: 'Footwork & Defense Drills', action_he: 'תרגילי דריכה והגנה', duration_min: 15, block_type: 'body', urgency: 5 },
  { pillar: 'focus', action_en: 'Deep Work Block — 45 min', action_he: 'בלוק עבודה עמוקה — 45 דקות', duration_min: 45, block_type: 'mind', urgency: 8 },
  { pillar: 'focus', action_en: 'Focus Breathwork — 5 min', action_he: 'נשימות מיקוד — 5 דקות', duration_min: 5, block_type: 'mind', urgency: 7 },
  { pillar: 'consciousness', action_en: 'Meditation & Self-Awareness — 15 min', action_he: 'מדיטציה ומודעות עצמית — 15 דקות', duration_min: 15, block_type: 'mind', urgency: 6 },
  { pillar: 'consciousness', action_en: 'Evening Reflection Journal', action_he: 'יומן רפלקציה ערבי', duration_min: 10, block_type: 'mind', urgency: 5 },
  { pillar: 'expansion', action_en: 'Learning Block — Read / Study', action_he: 'בלוק למידה — קריאה / לימוד', duration_min: 30, block_type: 'mind', urgency: 5 },
  { pillar: 'presence', action_en: 'Posture & Style Audit', action_he: 'בדיקת יציבה וסגנון', duration_min: 10, block_type: 'mind', urgency: 4 },
  { pillar: 'wealth', action_en: 'Revenue Action — Invoice / Outreach / Pricing', action_he: 'פעולת הכנסה — חשבונית / פנייה / תמחור', duration_min: 25, block_type: 'arena', urgency: 7 },
  { pillar: 'business', action_en: 'Business Strategy Step', action_he: 'צעד אסטרטגיה עסקית', duration_min: 30, block_type: 'arena', urgency: 6 },
  { pillar: 'projects', action_en: 'Project Execution — Next Task', action_he: 'ביצוע פרויקט — משימה הבאה', duration_min: 25, block_type: 'arena', urgency: 6 },
  { pillar: 'influence', action_en: 'Content Creation / Outreach', action_he: 'יצירת תוכן / הפצה', duration_min: 20, block_type: 'arena', urgency: 4 },
  { pillar: 'relationships', action_en: 'Meaningful Connection — Reach Out', action_he: 'קשר משמעותי — יצירת קשר', duration_min: 15, block_type: 'arena', urgency: 4 },
  { pillar: 'play', action_en: 'Play Session — Movement / Nature / Adventure', action_he: 'זמן משחק — תנועה / טבע / הרפתקה', duration_min: 30, block_type: 'arena', urgency: 3 },
];

// ─── Execution step templates ─────────────────────────────────
interface ExecStep { label: string; detail?: string; durationSec: number; }

function generateExecutionSteps(actionType: string, pillar: string, durationMin: number, isHe: boolean): ExecStep[] {
  const combined = `${actionType} ${pillar}`.toLowerCase();
  
  const templates: Record<string, () => ExecStep[]> = {
    shadowboxing_session: () => isHe ? [
      { label: "חימום — קפיצות + סיבובי מפרקים", durationSec: 120 },
      { label: "סיבוב 1 — ג׳אב-קרוס, קצב נמוך", detail: "התמקד בטכניקה נקייה", durationSec: 180 },
      { label: "סיבוב 2 — קומבינציות + תנועה", detail: "הוסף ווים ואפרקאטים", durationSec: 180 },
      { label: "סיבוב 3 — אינטנסיביות מקסימלית", detail: "דמיין יריב. תלחם.", durationSec: 180 },
      { label: "שחרור ונשימה — 2 דקות", durationSec: 120 },
    ] : [
      { label: "Warm-up — jump rope + joint circles", durationSec: 120 },
      { label: "Round 1 — Jab-cross, slow tempo", detail: "Focus on clean technique", durationSec: 180 },
      { label: "Round 2 — Combinations + movement", detail: "Add hooks and uppercuts", durationSec: 180 },
      { label: "Round 3 — Max intensity", detail: "Visualize opponent. Fight.", durationSec: 180 },
      { label: "Cooldown & breathwork — 2 min", durationSec: 120 },
    ],
    deep_work_block: () => isHe ? [
      { label: "הגדר כוונה — מה בדיוק תעשה?", durationSec: 60 },
      { label: "סגור הסחות — טלפון במצב טיסה", durationSec: 30 },
      { label: "בלוק עבודה עמוקה — 40 דקות רצופות", detail: "אל תעצור. אל תבדוק הודעות.", durationSec: 2400 },
      { label: "סיכום — מה הושג? מה הצעד הבא?", durationSec: 120 },
    ] : [
      { label: "Set intention — what exactly will you do?", durationSec: 60 },
      { label: "Remove distractions — phone on airplane mode", durationSec: 30 },
      { label: "Deep work block — 40 unbroken minutes", detail: "Don't stop. Don't check messages.", durationSec: 2400 },
      { label: "Recap — what was achieved? What's next?", durationSec: 120 },
    ],
    strength_session: () => isHe ? [
      { label: "חימום דינמי — 3 דקות", durationSec: 180 },
      { label: "סט 1 — שכיבות סמיכה / פול-אפ", detail: "3 סטים × מקסימום חזרות", durationSec: 300 },
      { label: "סט 2 — סקוואט / לאנג'ים", detail: "3 סטים × 12 חזרות", durationSec: 300 },
      { label: "סט 3 — פלאנק + ליבה", detail: "3 × 30 שניות", durationSec: 180 },
      { label: "מתיחות — 3 דקות", durationSec: 180 },
    ] : [
      { label: "Dynamic warm-up — 3 min", durationSec: 180 },
      { label: "Set 1 — Push-ups / Pull-ups", detail: "3 sets × max reps", durationSec: 300 },
      { label: "Set 2 — Squats / Lunges", detail: "3 sets × 12 reps", durationSec: 300 },
      { label: "Set 3 — Plank + Core", detail: "3 × 30 seconds", durationSec: 180 },
      { label: "Stretching — 3 min", durationSec: 180 },
    ],
    meditation_focus: () => isHe ? [
      { label: "שב בנוחות. עיניים עצומות.", durationSec: 30 },
      { label: "5 נשימות עמוקות — שאיפה 4, עצירה 4, נשיפה 6", durationSec: 120 },
      { label: "סריקת גוף — ראש עד רגליים", detail: "שחרר כל מתח", durationSec: 180 },
      { label: "ישיבה בשקט — תצפית על מחשבות", detail: "אל תשפוט, רק צפה", durationSec: 360 },
      { label: "חזרה — 3 נשימות, פתח עיניים", durationSec: 60 },
    ] : [
      { label: "Sit comfortably. Close your eyes.", durationSec: 30 },
      { label: "5 deep breaths — inhale 4, hold 4, exhale 6", durationSec: 120 },
      { label: "Body scan — head to toes", detail: "Release any tension", durationSec: 180 },
      { label: "Quiet sitting — observe thoughts", detail: "Don't judge, just watch", durationSec: 360 },
      { label: "Return — 3 breaths, open eyes", durationSec: 60 },
    ],
  };

  // Direct template match
  if (templates[actionType]) return templates[actionType]();

  // Keyword-based matching with actionType + pillar context
  if (/combat|shadow|boxing|לחימה|אגרוף/.test(combined)) return templates.shadowboxing_session();
  if (/strength|power|כוח|עוצמה/.test(combined) && !/influence|השפעה/.test(combined)) return templates.strength_session();
  if (/meditation|מדיטציה|mindful|מודעות|consciousness|תודעה/.test(combined)) return templates.meditation_focus();
  if (/deep.?work|focus.*strategy|מיקוד/.test(combined)) return templates.deep_work_block();
  
  // Skincare / grooming
  if (/skin|טיפוח|פנים|skincare|grooming/.test(combined)) {
    return isHe ? [
      { label: "ניקוי פנים — ג׳ל ניקוי + מים פושרים", detail: "עסה 60 שניות בתנועות עדינות", durationSec: 120 },
      { label: "טונר — הנח על פד כותנה", detail: "טפטף על הפנים והצוואר", durationSec: 60 },
      { label: "סרום — ויטמין C (בוקר) / רטינול (ערב)", detail: "עסה פנימה בתנועות כלפי מעלה", durationSec: 90 },
      { label: "קרם לחות — הנח בנקודות על הפנים", detail: "עסה בתנועות מעגליות", durationSec: 90 },
      { label: "הגנה מהשמש — SPF בשכבה נדיבה", durationSec: 60 },
    ] : [
      { label: "Cleanse — gel cleanser + lukewarm water", detail: "Massage 60 seconds in gentle circles", durationSec: 120 },
      { label: "Toner — apply on cotton pad", detail: "Pat onto face and neck", durationSec: 60 },
      { label: "Serum — Vitamin C (AM) / Retinol (PM)", detail: "Massage in with upward strokes", durationSec: 90 },
      { label: "Moisturize — dot on face", detail: "Massage in circular motions", durationSec: 90 },
      { label: "Sunscreen — apply SPF generously", durationSec: 60 },
    ];
  }

  // Reading / learning
  if (/read|קריאה|לימוד|study|learn|book|ספר|expansion/.test(combined)) {
    const readMin = Math.max(5, durationMin - 5);
    return isHe ? [
      { label: "בחר חומר — ספר/מאמר/קורס", detail: "סגור הסחות. הכן פנקס לרישומים.", durationSec: 120 },
      { label: `קריאה ממוקדת — ${readMin} דקות`, detail: "סמן מילות מפתח ורעיונות חשובים", durationSec: readMin * 60 },
      { label: "סיכום — 3 תובנות מרכזיות", detail: "כתוב מה למדת ואיך ליישם", durationSec: 180 },
    ] : [
      { label: "Choose material — book/article/course", detail: "Close distractions. Prepare notebook.", durationSec: 120 },
      { label: `Focused reading — ${readMin} minutes`, detail: "Highlight key ideas and concepts", durationSec: readMin * 60 },
      { label: "Summary — 3 key takeaways", detail: "Write what you learned and how to apply it", durationSec: 180 },
    ];
  }

  // Walking / nature
  if (/walk|הליכה|hiking|טיול|sunlight|אור/.test(combined)) {
    const walkMin = Math.max(5, durationMin - 4);
    return isHe ? [
      { label: "צא מהבית — 2 דקות הליכה איטית לחימום", durationSec: 120 },
      { label: `הליכה ראשית — ${walkMin} דקות`, detail: "קצב נוח אך ערני. שים לב לנשימה ולסביבה.", durationSec: walkMin * 60 },
      { label: "סגירה — האט, 3 נשימות עמוקות", detail: "מה הרגשת? מה שמת לב אליו?", durationSec: 120 },
    ] : [
      { label: "Head out — 2 min slow walking to warm up", durationSec: 120 },
      { label: `Main walk — ${walkMin} minutes`, detail: "Comfortable but alert pace. Notice your breathing.", durationSec: walkMin * 60 },
      { label: "Close — slow down, 3 deep breaths", detail: "How did you feel? What did you notice?", durationSec: 120 },
    ];
  }

  // Journaling / reflection
  if (/journal|יומן|כתיבה|reflec|writing|הרהור/.test(combined)) {
    const writeMin = Math.max(3, durationMin - 4);
    return isHe ? [
      { label: "התכוננות — 3 נשימות עמוקות", detail: "שאל את עצמך: מה עובר עליי עכשיו?", durationSec: 120 },
      { label: `כתיבה חופשית — ${writeMin} דקות`, detail: "כתוב בלי לעצור. אל תערוך, אל תשפוט.", durationSec: writeMin * 60 },
      { label: "תובנה מרכזית — קרא חזרה", detail: "מה מפתיע? מה הפעולה שעולה מזה?", durationSec: 120 },
    ] : [
      { label: "Center — 3 deep breaths", detail: "Ask yourself: what's on my mind right now?", durationSec: 120 },
      { label: `Free writing — ${writeMin} minutes`, detail: "Write without stopping. Don't edit, don't judge.", durationSec: writeMin * 60 },
      { label: "Core insight — read back", detail: "What's surprising? What action emerges?", durationSec: 120 },
    ];
  }

  // Business / project / work
  if (/business|wealth|project|work|עסק|פרויקט|עבודה|money|הכנסה|influence|השפעה/.test(combined)) {
    const workMin = Math.max(5, durationMin - 5);
    return isHe ? [
      { label: "הגדר מטרה — מה בדיוק תעשה?", detail: "כתוב משפט אחד ברור", durationSec: 120 },
      { label: `עבודה ממוקדת — ${workMin} דקות`, detail: "טלפון במצב טיסה. חלון אחד פתוח. מיקוד מלא.", durationSec: workMin * 60 },
      { label: "סיכום — מה הושג?", detail: "מה סיימתי? מה נשאר? מה הצעד הבא?", durationSec: 180 },
    ] : [
      { label: "Define goal — what exactly will you do?", detail: "Write one clear sentence", durationSec: 120 },
      { label: `Focused work — ${workMin} minutes`, detail: "Phone on airplane mode. One window open. Full focus.", durationSec: workMin * 60 },
      { label: "Summary — what was achieved?", detail: "What's done? What remains? What's next?", durationSec: 180 },
    ];
  }

  // Social / relationships
  if (/social|relation|יחסים|networking|connect|קשר|presence|נוכחות/.test(combined)) {
    const socialMin = Math.max(5, durationMin - 4);
    return isHe ? [
      { label: "הכנה — על מה לדבר?", detail: "חשוב על 2-3 נושאים. מה חשוב להעביר?", durationSec: 120 },
      { label: `השיחה/המפגש — ${socialMin} דקות`, detail: "היה נוכח. הקשב באמת. שאל שאלות.", durationSec: socialMin * 60 },
      { label: "סגירה — מה יצא מזה?", detail: "יש פעולה להמשך? מתי הפעם הבאה?", durationSec: 120 },
    ] : [
      { label: "Prepare — what to discuss?", detail: "Think of 2-3 topics. What's important to convey?", durationSec: 120 },
      { label: `The call/meeting — ${socialMin} minutes`, detail: "Be present. Really listen. Ask questions.", durationSec: socialMin * 60 },
      { label: "Close — what came of it?", detail: "Follow-up action? When's next time?", durationSec: 120 },
    ];
  }

  // Play / adventure
  if (/play|משחק|adventure|הרפתקה|fun|כיף/.test(combined)) {
    const playMin = Math.max(5, durationMin - 3);
    return isHe ? [
      { label: "בחר פעילות — מה ישמח אותך?", detail: "משחק, טבע, תנועה, יצירתיות, או הרפתקה", durationSec: 60 },
      { label: `זמן משחק — ${playMin} דקות`, detail: "שחרר ציפיות. תהנה מהתהליך. בלי טלפון.", durationSec: playMin * 60 },
      { label: "מה הרגשת?", detail: "חייך. שמור את האנרגיה הזו.", durationSec: 60 },
    ] : [
      { label: "Choose activity — what would make you happy?", detail: "Game, nature, movement, creativity, or adventure", durationSec: 60 },
      { label: `Play time — ${playMin} minutes`, detail: "Release expectations. Enjoy the process. No phone.", durationSec: playMin * 60 },
      { label: "How did it feel?", detail: "Smile. Keep that energy.", durationSec: 60 },
    ];
  }

  // Cold exposure (exact match, not broad)
  if (/cold.?(exposure|shower)|מקלחת.?קרה|חשיפה.?קור/.test(combined)) {
    const coldMin = Math.max(1, durationMin - 4);
    return isHe ? [
      { label: "נשימות כוח — 30 נשימות עמוקות (Wim Hof)", detail: "אחרי — עצור נשימה 30 שניות", durationSec: 120 },
      { label: `חשיפה לקור — ${coldMin} דקות`, detail: "התחל מהרגליים ועלה. נשום לאט ועמוק. אל תברח.", durationSec: coldMin * 60 },
      { label: "חימום — תנועה חופשית", detail: "התנער, זוז, קפוץ. תן לגוף להתחמם.", durationSec: 120 },
    ] : [
      { label: "Power breaths — 30 deep breaths (Wim Hof)", detail: "Then hold breath 30 seconds", durationSec: 120 },
      { label: `Cold exposure — ${coldMin} minutes`, detail: "Start from legs, work up. Breathe slow and deep.", durationSec: coldMin * 60 },
      { label: "Warm up — free movement", detail: "Shake, move, jump. Let body warm naturally.", durationSec: 120 },
    ];
  }

  // Vitality / morning routine / hydration / sleep
  if (/vitality|morning|hydrat|sleep|shutdown|ערב|בוקר|שינה|מים/.test(combined)) {
    return isHe ? [
      { label: "כוונה — מה המטרה שלי כרגע?", detail: "נשום 3 נשימות. חבר לגוף.", durationSec: 60 },
      { label: `ביצוע — ${Math.max(3, durationMin - 3)} דקות`, detail: "עקוב אחרי הפרוטוקול צעד אחרי צעד.", durationSec: Math.max(3, durationMin - 3) * 60 },
      { label: "סיום — בדוק: עשיתי את זה?", detail: "סמן V. זה חשוב.", durationSec: 60 },
    ] : [
      { label: "Intention — what's my goal right now?", detail: "3 breaths. Connect to your body.", durationSec: 60 },
      { label: `Execute — ${Math.max(3, durationMin - 3)} minutes`, detail: "Follow the protocol step by step.", durationSec: Math.max(3, durationMin - 3) * 60 },
      { label: "Done — check: did I do it?", detail: "Mark it off. This matters.", durationSec: 60 },
    ];
  }

  // Order / organizing / cleaning
  if (/order|סדר|clean|ניקיון|organiz|סידור/.test(combined)) {
    const orderMin = Math.max(5, durationMin - 4);
    return isHe ? [
      { label: "סקירה — מה דורש טיפול?", detail: "בחר 3 אזורים/משימות לטפל בהם.", durationSec: 120 },
      { label: `ביצוע — ${orderMin} דקות`, detail: "אזור אחרי אזור. לא לדלג.", durationSec: orderMin * 60 },
      { label: "בדיקה סופית — צפה בתוצאה", detail: "סדר פרטים קטנים. תהנה מהסדר.", durationSec: 120 },
    ] : [
      { label: "Survey — what needs attention?", detail: "Pick 3 areas/tasks to tackle.", durationSec: 120 },
      { label: `Execute — ${orderMin} minutes`, detail: "Zone by zone. No skipping.", durationSec: orderMin * 60 },
      { label: "Final check — admire the result", detail: "Fix small details. Enjoy the order.", durationSec: 120 },
    ];
  }

  // Generic fallback — still actionable
  const coreMin = Math.max(1, durationMin - 4);
  return isHe ? [
    { label: "הכנה — נשימות + מיקוד כוונה", detail: "מה בדיוק אני עומד לעשות? הגדר בבירור.", durationSec: 60 },
    { label: `ביצוע ליבה — ${coreMin} דקות`, detail: "עבודה ממוקדת ללא הסחות. צעד אחר צעד.", durationSec: coreMin * 60 },
    { label: "סגירה — מה למדתי? מה הצעד הבא?", detail: "רשום תובנה אחת ופעולה אחת.", durationSec: 120 },
  ] : [
    { label: "Prepare — breathe & set intention", detail: "What exactly am I about to do? Define clearly.", durationSec: 60 },
    { label: `Core execution — ${coreMin} minutes`, detail: "Focused work, no distractions. Step by step.", durationSec: coreMin * 60 },
    { label: "Close — what did I learn? What's next?", detail: "Write one insight and one action.", durationSec: 120 },
  ];
}

// ─── Queue item type ──────────────────────────────────────────
interface QueueItem {
  pillarId: string;
  hub: "core" | "arena";
  actionType: string;
  title: string;
  titleEn: string;
  durationMin: number;
  urgencyScore: number;
  reason: string;
  sourceType: "strategy" | "plan" | "assessment" | "template" | "habit";
  sourceId?: string;
  blockType?: string;
  executionSteps?: ExecStep[];
}

// ─── Get current week of the strategy ─────────────────────────
function getCurrentWeek(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(12, Math.max(1, Math.ceil((diffDays + 1) / 7)));
}

serve(async (req) => {
  if (isCorsPreFlight(req)) return handleCorsPreFlight();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { user_id, language = "he", mode } = body;

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── MODE: execution_steps ────────────────────────────
    if (mode === "execution_steps") {
      const { action_type, pillar, duration_min } = body;
      const isHe = language === "he";
      const steps = generateExecutionSteps(action_type, pillar, duration_min || 15, isHe);
      const auroraMessage = isHe
        ? `בוא נתחיל. ${duration_min || 15} דקות של ${pillar || "עבודה"}. אני איתך.`
        : `Let's begin. ${duration_min || 15} minutes of ${pillar || "work"}. I'm with you.`;
      return new Response(
        JSON.stringify({ steps, aurora_message: auroraMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Get user tier ────────────────────────────────────
    const { data: tierData } = await supabase.rpc("get_user_tier", { p_user_id: user_id });
    const tier = tierData || "clarity";
    const maxActions = getMaxActions(tier);
    const dayIntensity = getDayIntensity();
    const today = new Date().toISOString().split("T")[0];
    const isHe = language === "he";

    // ── Parallel data fetch ──────────────────────────────
    const [
      strategiesRes,
      habitsRes,
      todayActionsRes,
      overdueRes,
      projectsRes,
      pulseRes,
      assessmentsRes,
    ] = await Promise.all([
      // Active 90-day strategies
      supabase.from("life_plans").select("id, plan_data, start_date, status")
        .eq("user_id", user_id).eq("status", "active").order("created_at", { ascending: false }),
      // Habits
      supabase.from("action_items").select("id, title, pillar, completed_at")
        .eq("user_id", user_id).eq("type", "habit"),
      // Today tasks already scheduled
      supabase.from("action_items").select("id, title, pillar, status, type")
        .eq("user_id", user_id).in("status", ["todo", "doing"]).eq("type", "task")
        .or(`scheduled_date.eq.${today}`),
      // Overdue tasks
      supabase.from("action_items").select("id, title, pillar, due_at")
        .eq("user_id", user_id).eq("type", "task").in("status", ["todo", "doing"])
        .lt("due_at", `${today}T00:00:00`).order("due_at").limit(3),
      // Active projects
      supabase.from("user_projects").select("id, name, category, priority")
        .eq("user_id", user_id).eq("status", "active").order("priority").limit(5),
      // Today pulse
      supabase.from("daily_pulse_logs").select("energy_rating, mood")
        .eq("user_id", user_id).eq("log_date", today).maybeSingle(),
      // Pillar assessments
      supabase.from("life_domains").select("domain_id, domain_config, status")
        .eq("user_id", user_id),
    ]);

    const strategies = strategiesRes.data || [];
    const habits = habitsRes.data || [];
    const todayActions = todayActionsRes.data || [];
    const overdue = overdueRes.data || [];
    const projects = projectsRes.data || [];
    const pulse = pulseRes.data;
    const assessments = assessmentsRes.data || [];

    // ── Parse strategies ─────────────────────────────────
    const coreStrategy = strategies.find((s: any) => s.plan_data?.hub === 'core');
    const arenaStrategy = strategies.find((s: any) => s.plan_data?.hub === 'arena');

    // ── Build queue ──────────────────────────────────────
    const queue: QueueItem[] = [];
    const usedPillars = new Set<string>();

    // 1. Overdue tasks (highest priority)
    for (const task of overdue) {
      if (queue.length >= maxActions) break;
      queue.push({
        pillarId: task.pillar || "focus",
        hub: getHub(task.pillar || "focus"),
        actionType: "overdue_task",
        title: task.title,
        titleEn: task.title,
        durationMin: 15,
        urgencyScore: 10,
        reason: isHe ? "משימה באיחור" : "Overdue task",
        sourceType: "plan",
        sourceId: task.id,
      });
      if (task.pillar) usedPillars.add(task.pillar);
    }

    // 2. Habits not completed today
    const todayStart = `${today}T00:00:00`;
    const todayEnd = `${today}T23:59:59`;
    for (const habit of habits) {
      if (queue.length >= maxActions) break;
      const completedToday = habit.completed_at && habit.completed_at >= todayStart && habit.completed_at <= todayEnd;
      if (completedToday) continue;
      queue.push({
        pillarId: habit.pillar || "vitality",
        hub: getHub(habit.pillar || "vitality"),
        actionType: "daily_habit",
        title: habit.title,
        titleEn: habit.title,
        durationMin: 5,
        urgencyScore: 8,
        reason: isHe ? "הרגל יומי" : "Daily habit",
        sourceType: "habit",
        sourceId: habit.id,
      });
      if (habit.pillar) usedPillars.add(habit.pillar);
    }

    // 3. Strategy-derived actions (CORE)
    if (coreStrategy) {
      const weekNum = getCurrentWeek(coreStrategy.start_date);
      const strategy = coreStrategy.plan_data?.strategy;
      const weekPlan = strategy?.weeks?.find((w: any) => w.week === weekNum);

      if (weekPlan?.daily_actions) {
        for (const action of weekPlan.daily_actions) {
          if (queue.length >= maxActions) break;
          if (usedPillars.has(action.pillar)) continue;

          queue.push({
            pillarId: action.pillar,
            hub: 'core',
            actionType: action.pillar + '_strategy',
            title: isHe ? action.action_he : action.action_en,
            titleEn: action.action_en,
            durationMin: Math.round(action.duration_min * dayIntensity.multiplier),
            urgencyScore: 7,
            reason: isHe
              ? `${strategy.title_he || 'אסטרטגיה'} — שבוע ${weekNum}`
              : `${strategy.title_en || 'Strategy'} — Week ${weekNum}`,
            sourceType: "strategy",
            sourceId: coreStrategy.id,
            blockType: action.block_type,
          });
          usedPillars.add(action.pillar);
        }
      }
    }

    // 4. Strategy-derived actions (ARENA)
    if (arenaStrategy) {
      const weekNum = getCurrentWeek(arenaStrategy.start_date);
      const strategy = arenaStrategy.plan_data?.strategy;
      const weekPlan = strategy?.weeks?.find((w: any) => w.week === weekNum);

      if (weekPlan?.daily_actions) {
        for (const action of weekPlan.daily_actions) {
          if (queue.length >= maxActions) break;
          if (usedPillars.has(action.pillar)) continue;

          queue.push({
            pillarId: action.pillar,
            hub: 'arena',
            actionType: action.pillar + '_strategy',
            title: isHe ? action.action_he : action.action_en,
            titleEn: action.action_en,
            durationMin: Math.round(action.duration_min * dayIntensity.multiplier),
            urgencyScore: 6,
            reason: isHe
              ? `${strategy.title_he || 'אסטרטגיה'} — שבוע ${weekNum}`
              : `${strategy.title_en || 'Strategy'} — Week ${weekNum}`,
            sourceType: "strategy",
            sourceId: arenaStrategy.id,
            blockType: action.block_type,
          });
          usedPillars.add(action.pillar);
        }
      }
    }

    // 5. Project-based actions
    for (const proj of projects) {
      if (queue.length >= maxActions) break;
      if (usedPillars.has("projects")) continue;
      queue.push({
        pillarId: "projects",
        hub: "arena",
        actionType: "project_next_task",
        title: isHe ? `${proj.name} — צעד הבא` : `${proj.name} — Next step`,
        titleEn: `${proj.name} — Next step`,
        durationMin: 25,
        urgencyScore: 6,
        reason: isHe ? "פרויקט פעיל" : "Active project",
        sourceType: "plan",
        sourceId: proj.id,
      });
      usedPillars.add("projects");
    }

    // 6. Fill remaining slots from fallback templates
    if (queue.length < maxActions) {
      const energyMult = pulse?.energy_rating ? pulse.energy_rating / 5 : 0.8;

      // Ensure Body + Mind + Arena coverage
      const hasBody = queue.some(q => BODY_PILLARS.includes(q.pillarId));
      const hasMind = queue.some(q => MIND_PILLARS.includes(q.pillarId));
      const hasArena = queue.some(q => ARENA_PILLARS.includes(q.pillarId));

      const prioritize = (a: FallbackAction) => {
        let bonus = 0;
        if (!hasBody && a.block_type === 'body') bonus += 5;
        if (!hasMind && a.block_type === 'mind') bonus += 5;
        if (!hasArena && a.block_type === 'arena') bonus += 5;
        return bonus;
      };

      const candidates = FALLBACK_ACTIONS
        .filter(t => !usedPillars.has(t.pillar))
        .map(t => ({
          ...t,
          score: (t.urgency * energyMult * dayIntensity.multiplier) + prioritize(t) + Math.random() * 2,
        }))
        .sort((a, b) => b.score - a.score);

      for (const c of candidates) {
        if (queue.length >= maxActions) break;
        queue.push({
          pillarId: c.pillar,
          hub: getHub(c.pillar),
          actionType: c.pillar + '_template',
          title: isHe ? c.action_he : c.action_en,
          titleEn: c.action_en,
          durationMin: Math.round(c.duration_min * dayIntensity.multiplier),
          urgencyScore: Math.round(c.score),
          reason: isHe ? "מנוע יומי" : "Daily engine",
          sourceType: "template",
          blockType: c.block_type,
        });
        usedPillars.add(c.pillar);
      }
    }

    // Sort final queue by urgency
    queue.sort((a, b) => b.urgencyScore - a.urgencyScore);

    // Attach execution steps to each queue item
    for (const item of queue) {
      if (!item.executionSteps) {
        item.executionSteps = generateExecutionSteps(item.actionType, item.pillarId, item.durationMin, isHe);
      }
    }

    // Current week info for UI
    const currentWeekCore = coreStrategy ? getCurrentWeek(coreStrategy.start_date) : null;
    const currentWeekArena = arenaStrategy ? getCurrentWeek(arenaStrategy.start_date) : null;

    return new Response(
      JSON.stringify({
        today_queue: queue,
        generated_at: new Date().toISOString(),
        tier,
        max_actions: maxActions,
        energy_level: pulse?.energy_rating || null,
        day_intensity: dayIntensity.label,
        has_core_strategy: !!coreStrategy,
        has_arena_strategy: !!arenaStrategy,
        core_week: currentWeekCore,
        arena_week: currentWeekArena,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-today-queue error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
