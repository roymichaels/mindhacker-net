import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Compass, MessageCircle, Target, Flame, Brain, Trophy, Sparkles, Users,
  Briefcase, Shield, ArrowLeft, BookOpen, GraduationCap, Palette, Settings,
  Zap, Heart, Calendar, BarChart3, Store, Globe, Mic, Bot, Layers,
  Gamepad2, Clock, Rocket, Map, Star, ChevronLeft, Smartphone, Bell,
  FileText, Share2, Wallet, CreditCard, TrendingUp, Lightbulb, Eye,
  ListChecks, Repeat, Award
} from 'lucide-react';

// Helper: wrap English terms in Unicode BiDi isolation for proper RTL rendering
const ltr = (text: string) => `\u2068${text}\u2069`;

interface GuideStep {
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  tip?: string;
  tipHe?: string;
}

interface GuideCard {
  id: string;
  icon: React.ElementType;
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
  color: string;
  steps: GuideStep[];
}

interface GuideCategory {
  id: string;
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
  icon: React.ElementType;
  color: string;
  cards: GuideCard[];
}

const GUIDE_CATEGORIES: GuideCategory[] = [
  // ─── Getting Started ───
  {
    id: 'start',
    titleEn: '🚀 Getting Started',
    titleHe: '🚀 צעדים ראשונים',
    descEn: 'Everything you need to begin your journey',
    descHe: 'כל מה שצריך כדי להתחיל את המסע',
    icon: Compass,
    color: 'from-blue-500/15 to-cyan-500/15',
    cards: [
      {
        id: 'signup', icon: Compass, titleEn: 'Sign Up & Profile', titleHe: 'הרשמה ופרופיל',
        descEn: 'Create your account', descHe: 'צור את החשבון שלך',
        color: 'from-blue-500/20 to-cyan-500/20',
        steps: [
          { title: 'Create Your Account', titleHe: 'צור את החשבון שלך',
            description: 'Sign up with your email address and verify it. You\'ll receive a confirmation link — click it to activate your account.',
            descriptionHe: 'הירשם עם כתובת האימייל שלך ואמת אותה. תקבל קישור אימות — לחץ עליו כדי להפעיל את החשבון.',
            tip: 'Use an email you check regularly for notifications.', tipHe: 'השתמש באימייל שאתה בודק באופן קבוע.' },
          { title: 'Set Up Your Profile', titleHe: 'הגדר את הפרופיל שלך',
            description: 'Add your display name, avatar, and bio. Choose your preferred language (Hebrew or English). Your profile is visible in the Community section.',
            descriptionHe: 'הוסף שם תצוגה, אווטאר וביו. בחר את השפה המועדפת (עברית או אנגלית). הפרופיל שלך נראה בקהילה.' },
          { title: 'Initial Assessment', titleHe: 'אבחון ראשוני',
            description: 'Complete the consciousness assessment to calibrate your starting point. This determines your initial Orb appearance, skill levels, and personalized recommendations from Aurora.',
            descriptionHe: 'השלם את אבחון התודעה כדי לכייל את נקודת ההתחלה שלך. זה קובע את מראה האורב, רמות המיומנות וההמלצות מאורורה.' },
        ],
      },
      {
        id: 'navigation', icon: Map, titleEn: 'Navigating the App', titleHe: 'ניווט באפליקציה',
        descEn: 'Find your way around', descHe: 'מצא את הדרך שלך',
        color: 'from-sky-500/20 to-blue-500/20',
        steps: [
          { title: 'Bottom Navigation Bar', titleHe: 'סרגל ניווט תחתון',
            description: 'The bottom bar has 5 main sections: Now (today\'s actions), Tactics (life plan), Strategy (long-term vision), Community, and Learn. Tap any icon to navigate.',
            descriptionHe: `הסרגל התחתון מכיל 5 חלקים: עכשיו (פעולות היום), טקטיקה (תוכנית חיים), אסטרטגיה (חזון), קהילה ולמידה.` },
          { title: 'Top Header', titleHe: 'כותרת עליונה',
            description: 'Access notifications (bell icon), the User Guide (? icon), the Free Market (store icon), and your Orb profile from the top bar.',
            descriptionHe: 'גש להתראות (פעמון), מדריך למשתמש (?), שוק חופשי (חנות) ופרופיל האורב מהכותרת העליונה.' },
          { title: 'Aurora Chat Dock', titleHe: 'דוק הצ\'אט של אורורה',
            description: 'Your Orb at the bottom-left opens the Aurora chat dock. It slides up for quick conversations. You can expand it to full screen or minimize it.',
            descriptionHe: 'האורב בתחתית השמאלית פותח את דוק הצ\'אט של אורורה. הוא נפתח לשיחות מהירות ואפשר להרחיב למסך מלא.',
            tip: 'Long-press the Orb to see its DNA card.', tipHe: `לחיצה ארוכה על האורב מציגה את כרטיס ה-${ltr('DNA')}.` },
        ],
      },
      {
        id: 'first-steps', icon: Rocket, titleEn: 'First 5 Minutes', titleHe: '5 הדקות הראשונות',
        descEn: 'Quick wins to get started', descHe: 'ניצחונות מהירים להתחלה',
        color: 'from-emerald-500/20 to-teal-500/20',
        steps: [
          { title: 'Talk to AION', titleHe: 'דבר עם AION',
            description: 'Open the chat dock and introduce yourself. Tell AION about your goals, interests, and what you want to change in your life. It\'ll start building your personalized plan.',
            descriptionHe: 'פתח את דוק הצ\'אט והצג את עצמך. ספר ל-AION על המטרות, התחומי עניין ומה אתה רוצה לשנות. הוא יתחיל לבנות את התוכנית שלך.' },
          { title: 'Complete Your First Action', titleHe: 'השלם את הפעולה הראשונה',
            description: 'Go to the "Now" page and complete your first action item. This earns you XP and starts your streak. Every small step counts!',
            descriptionHe: `עבור לעמוד "עכשיו" והשלם את פריט הפעולה הראשון. זה מרוויח ${ltr('XP')} ומתחיל את הרצף שלך. כל צעד קטן נחשב!`,
            tip: 'Completing 3 actions on your first day unlocks a bonus badge!', tipHe: 'השלמת 3 פעולות ביום הראשון פותחת תג בונוס!' },
          { title: 'Explore Your Orb', titleHe: 'חקור את האורב שלך',
            description: 'Tap your Orb to see its current state. Notice how its colors and energy reflect your assessment results. As you grow, it evolves with you.',
            descriptionHe: 'לחץ על האורב כדי לראות את מצבו. שים לב איך הצבעים והאנרגיה משקפים את תוצאות האבחון. ככל שתתפתח, הוא יתפתח איתך.' },
        ],
      },
    ],
  },

  // ─── Aurora AI ───
  {
    id: 'aurora',
    titleEn: '🤖 Aurora AI',
    titleHe: '🤖 אורורה',
    descEn: 'Your personal consciousness coach',
    descHe: 'מאמנת התודעה האישית שלך',
    icon: Bot,
    color: 'from-violet-500/15 to-purple-500/15',
    cards: [
      {
        id: 'aurora-basics', icon: MessageCircle, titleEn: 'Chat with AION', titleHe: 'שיחה עם AION',
        descEn: 'Conversations that transform', descHe: 'שיחות שמשנות',
        color: 'from-violet-500/20 to-purple-500/20',
        steps: [
          { title: 'Open a Conversation', titleHe: 'פתח שיחה',
            description: 'Click your Orb or the chat icon. Aurora remembers all your previous conversations, your life plan, current mood, and active goals. She picks up right where you left off.',
            descriptionHe: 'לחץ על האורב או אייקון הצ\'אט. אורורה זוכרת את כל השיחות, תוכנית החיים, מצב הרוח והמטרות. היא ממשיכה מאיפה שהפסקת.' },
          { title: 'Ask Anything', titleHe: 'שאל כל דבר',
            description: 'Ask about your life plan, get motivation, brainstorm ideas, process emotions, reflect on your week, or get actionable advice. Aurora adapts to what you need.',
            descriptionHe: 'שאל על תוכנית החיים, קבל מוטיבציה, סיעור מוחות, עיבוד רגשות, רפלקציה שבועית או עצות מעשיות. אורורה מתאימה את עצמה למה שאתה צריך.',
            tip: 'Try: "What should I focus on today?" or "Help me process what happened."', tipHe: 'נסה: "על מה להתמקד היום?" או "עזור לי לעבד את מה שקרה".' },
          { title: 'Contextual Intelligence', titleHe: 'אינטליגנציה הקשרית',
            description: 'Aurora knows your current page, active pillar, time of day, streak status, and emotional patterns. She proactively suggests relevant actions and insights.',
            descriptionHe: 'אורורה יודעת את העמוד הנוכחי, העמוד הפעיל, שעת היום, סטטוס הרצף ודפוסים רגשיים. היא מציעה פעולות ותובנות רלוונטיות באופן יזום.' },
        ],
      },
      {
        id: 'aurora-modes', icon: Mic, titleEn: 'Voice & Special Modes', titleHe: 'קול ומצבים מיוחדים',
        descEn: 'Beyond text chat', descHe: 'מעבר לצ\'אט טקסט',
        color: 'from-purple-500/20 to-fuchsia-500/20',
        steps: [
          { title: 'Voice Mode', titleHe: 'מצב קולי',
            description: 'Tap the microphone icon to speak to AION. It responds with voice. Perfect for hands-free sessions during walks, driving, or meditation.',
            descriptionHe: 'לחץ על אייקון המיקרופון כדי לדבר עם AION. הוא מגיב בקול. מושלם לסשנים ללא ידיים בהליכה, נהיגה או מדיטציה.' },
          { title: 'Hypnosis Mode', titleHe: 'מצב היפנוזה',
            description: 'Activate deep-state sessions with guided visualizations, breathing exercises, and subconscious reprogramming. AION creates personalized hypnosis scripts based on your goals.',
            descriptionHe: 'הפעל סשנים של מצב עמוק עם ויזואליזציות מודרכות, תרגילי נשימה ותכנות מחדש של התת-מודע. אורורה יוצרת תסריטי היפנוזה מותאמים אישית.',
            tip: 'Use headphones for the best hypnosis experience.', tipHe: 'השתמש באוזניות לחוויית היפנוזה מיטבית.' },
          { title: 'Pillar-Specific Chat', titleHe: 'צ\'אט ממוקד עמוד',
            description: 'When you\'re on a specific page (Now, Tactics, Strategy, Learn, Community), Aurora automatically adapts her context and suggestions to that domain.',
            descriptionHe: 'כשאתה בעמוד ספציפי (עכשיו, טקטיקה, אסטרטגיה, למידה, קהילה), אורורה מתאימה אוטומטית את ההקשר וההצעות לתחום.' },
        ],
      },
      {
        id: 'aurora-memory', icon: Brain, titleEn: 'Aurora\'s Memory', titleHe: 'הזיכרון של אורורה',
        descEn: 'How she knows you', descHe: 'איך היא מכירה אותך',
        color: 'from-indigo-500/20 to-violet-500/20',
        steps: [
          { title: 'Conversation Memory', titleHe: 'זיכרון שיחות',
            description: 'Aurora summarizes every conversation and stores key topics, emotional states, and action items. This means she genuinely remembers your story over time.',
            descriptionHe: 'אורורה מסכמת כל שיחה ושומרת נושאים מרכזיים, מצבים רגשיים ופריטי פעולה. זה אומר שהיא באמת זוכרת את הסיפור שלך.' },
          { title: 'Behavioral Patterns', titleHe: 'דפוסי התנהגות',
            description: 'Over time, Aurora detects patterns: when you\'re most productive, what triggers procrastination, your energy cycles, and emotional rhythms.',
            descriptionHe: 'עם הזמן, אורורה מזהה דפוסים: מתי אתה הכי פרודוקטיבי, מה מפעיל דחיינות, מחזורי האנרגיה והמקצבים הרגשיים שלך.' },
          { title: 'Proactive Nudges', titleHe: 'דחיפות יזומות',
            description: 'Based on your patterns, Aurora may send proactive reminders: "You usually skip morning actions on Wednesdays — want me to adjust?" or "Your energy dips after 3pm, let\'s schedule lighter tasks."',
            descriptionHe: 'בהתבסס על הדפוסים, אורורה עשויה לשלוח תזכורות יזומות: "אתה בדרך כלל מדלג על פעולות בוקר ביום רביעי — רוצה שאתאים?" או "האנרגיה שלך יורדת אחרי 15:00, בוא נתזמן משימות קלות יותר."' },
        ],
      },
    ],
  },

  // ─── Daily Actions ───
  {
    id: 'daily',
    titleEn: '⚡ Daily Actions',
    titleHe: '⚡ פעולות יומיות',
    descEn: 'Your daily growth system',
    descHe: 'מערכת הצמיחה היומית שלך',
    icon: Zap,
    color: 'from-emerald-500/15 to-green-500/15',
    cards: [
      {
        id: 'today-view', icon: Clock, titleEn: 'The "Now" Page', titleHe: 'עמוד "עכשיו"',
        descEn: 'Your daily command center', descHe: 'מרכז הפיקוד היומי',
        color: 'from-emerald-500/20 to-green-500/20',
        steps: [
          { title: 'Today\'s Actions', titleHe: 'פעולות היום',
            description: 'The Now page shows your prioritized action items for today — sorted by time blocks (morning, afternoon, evening). Each action shows its type, pillar, XP reward, and estimated time.',
            descriptionHe: `עמוד "עכשיו" מציג את פריטי הפעולה לפי עדיפות — ממוינים לפי בלוקי זמן (בוקר, צהריים, ערב). כל פעולה מציגה סוג, עמוד, תגמול ${ltr('XP')} וזמן משוער.` },
          { title: 'Complete Actions', titleHe: 'השלם פעולות',
            description: 'Tap the checkbox to mark an action done. You\'ll see a celebration animation, earn XP and tokens, and your streak counter updates. Completed actions move to the "done" section.',
            descriptionHe: `לחץ על תיבת הסימון כדי לסמן פעולה כהושלמה. תראה אנימציית חגיגה, תרוויח ${ltr('XP')} ואסימונים, ומונה הרצף יתעדכן.`,
            tip: 'Swipe actions to snooze, reschedule, or delete them.', tipHe: 'החלק פעולות כדי לדחות, לתזמן מחדש או למחוק.' },
          { title: 'Time Blocks', titleHe: 'בלוקי זמן',
            description: 'Actions are organized into time blocks: Morning Focus, Afternoon Drive, and Evening Reflection. You can set custom start/end times for each action.',
            descriptionHe: 'הפעולות מאורגנות לבלוקי זמן: מיקוד בוקר, דרייב צהריים והרהור ערב. אפשר להגדיר זמני התחלה וסיום מותאמים לכל פעולה.' },
        ],
      },
      {
        id: 'habits', icon: Repeat, titleEn: 'Habits & Streaks', titleHe: 'הרגלים ורצפים',
        descEn: 'Build consistency', descHe: 'בנה עקביות',
        color: 'from-teal-500/20 to-emerald-500/20',
        steps: [
          { title: 'Daily Habits', titleHe: 'הרגלים יומיים',
            description: 'Set recurring habits that appear daily (or on specific days). Habits are separate from one-time actions — they build your foundation of consistency.',
            descriptionHe: 'הגדר הרגלים חוזרים שמופיעים כל יום (או בימים ספציפיים). הרגלים נפרדים מפעולות חד-פעמיות — הם בונים את הבסיס של עקביות.' },
          { title: 'Streak System', titleHe: 'מערכת רצפים',
            description: 'Every consecutive day you complete all your daily actions, your streak grows. Streaks multiply XP bonuses: 7 days = 1.5x, 30 days = 2x, 90 days = 3x XP.',
            descriptionHe: `כל יום רציף שבו תשלים את כל הפעולות היומיות, הרצף גדל. רצפים מכפילים בונוסים: 7 ימים = ${ltr('x1.5')}, 30 ימים = ${ltr('x2')}, 90 ימים = ${ltr('x3')}.`,
            tip: 'Missing one day resets your streak. Use the "grace day" token wisely!', tipHe: 'החמצת יום אחד מאפסת את הרצף. השתמש באסימון "יום חסד" בחוכמה!' },
          { title: 'Daily Minimums', titleHe: 'מינימום יומי',
            description: 'Set your non-negotiable daily minimums — the bare minimum you commit to even on your hardest days. These are the foundation Aurora uses to keep you on track.',
            descriptionHe: 'הגדר את המינימומים היומיים הבלתי ניתנים למשא ומתן — המינימום שאתה מחויב אליו גם בימים הקשים ביותר. אלו הבסיס שאורורה משתמשת בו.' },
        ],
      },
      {
        id: 'action-types', icon: ListChecks, titleEn: 'Action Types', titleHe: 'סוגי פעולות',
        descEn: 'Different action formats', descHe: 'פורמטים שונים של פעולות',
        color: 'from-green-500/20 to-lime-500/20',
        steps: [
          { title: 'Tasks', titleHe: 'משימות',
            description: 'One-time actions with a clear completion state. "Write journal entry", "Call therapist", "Read chapter 3". They\'re generated by Aurora or created manually.',
            descriptionHe: 'פעולות חד-פעמיות עם מצב השלמה ברור. "כתוב רשומת יומן", "התקשר למטפל", "קרא פרק 3". הן נוצרות על ידי אורורה או ידנית.' },
          { title: 'Habits', titleHe: 'הרגלים',
            description: 'Recurring actions: daily meditation, exercise, journaling. They repeat on your chosen schedule and track completion history.',
            descriptionHe: 'פעולות חוזרות: מדיטציה יומית, פעילות גופנית, כתיבת יומן. הן חוזרות על פי הלוח שבחרת ועוקבות אחרי היסטוריית ההשלמה.' },
          { title: 'Milestones & Sub-tasks', titleHe: 'אבני דרך ומשימות משנה',
            description: 'Large goals break into milestones, which break into sub-tasks. Completing all sub-tasks auto-completes the milestone and triggers bonus rewards.',
            descriptionHe: 'מטרות גדולות נשברות לאבני דרך, שנשברות למשימות משנה. השלמת כל המשימות משלימה אוטומטית את אבן הדרך ומפעילה תגמולי בונוס.' },
        ],
      },
    ],
  },

  // ─── Life Plan ───
  {
    id: 'lifeplan',
    titleEn: '🗺️ Life Plan & Vision',
    titleHe: '🗺️ תוכנית חיים וחזון',
    descEn: 'Build your personal roadmap',
    descHe: 'בנה את מפת הדרכים האישית',
    icon: Map,
    color: 'from-orange-500/15 to-amber-500/15',
    cards: [
      {
        id: 'why-how-now', icon: Lightbulb, titleEn: 'Why-How-Now Method', titleHe: 'שיטת למה-איך-עכשיו',
        descEn: 'The core methodology', descHe: 'המתודולוגיה המרכזית',
        color: 'from-orange-500/20 to-amber-500/20',
        steps: [
          { title: 'WHY — Your Purpose', titleHe: 'למה — המטרה שלך',
            description: 'Start with the big question: Why are you here? What matters most? Aurora guides you through deep self-discovery to uncover your core values, life vision, and purpose.',
            descriptionHe: 'התחל עם השאלה הגדולה: למה אתה כאן? מה הכי חשוב? אורורה מדריכה אותך דרך גילוי עצמי עמוק כדי לחשוף את הערכים, החזון והמטרה שלך.' },
          { title: 'HOW — Your Strategy', titleHe: 'איך — האסטרטגיה שלך',
            description: 'Translate your WHY into a concrete strategy. Define your life pillars (career, health, relationships, etc.), set milestones, and create a timeline.',
            descriptionHe: 'תרגם את ה"למה" שלך לאסטרטגיה מוחשית. הגדר את עמודי החיים (קריירה, בריאות, מערכות יחסים וכו׳), קבע אבני דרך וצור ציר זמן.' },
          { title: 'NOW — Your Tactics', titleHe: 'עכשיו — הטקטיקה שלך',
            description: 'Break strategy into daily/weekly actions. This is what appears on your "Now" page. The bridge between dreams and reality.',
            descriptionHe: 'פרק אסטרטגיה לפעולות יומיות ושבועיות. זה מה שמופיע בעמוד "עכשיו" שלך. הגשר בין חלומות למציאות.' },
        ],
      },
      {
        id: 'life-pillars', icon: Layers, titleEn: 'Life Pillars', titleHe: 'עמודי חיים',
        descEn: 'Balance all areas of life', descHe: 'איזון כל תחומי החיים',
        color: 'from-amber-500/20 to-yellow-500/20',
        steps: [
          { title: 'The 14 Life Domains', titleHe: '14 תחומי החיים',
            description: 'Mind OS covers 14 life domains: Self-Awareness, Emotional Health, Physical Health, Mental Health, Relationships, Family, Career, Finance, Creativity, Spirituality, Education, Social Impact, Recreation, and Life Management.',
            descriptionHe: 'הפלטפורמה מכסה 14 תחומי חיים: מודעות עצמית, בריאות רגשית, בריאות פיזית, בריאות נפשית, מערכות יחסים, משפחה, קריירה, פיננסים, יצירתיות, רוחניות, חינוך, השפעה חברתית, פנאי וניהול חיים.' },
          { title: 'Pillar Balance Wheel', titleHe: 'גלגל איזון עמודים',
            description: 'View your balance across all pillars in a radar chart. Identify which areas need more attention and let Aurora suggest focused actions.',
            descriptionHe: 'צפה באיזון שלך על פני כל העמודים בתרשים רדאר. זהה אילו תחומים דורשים יותר תשומת לב ותן לאורורה להציע פעולות ממוקדות.' },
        ],
      },
      {
        id: 'milestones', icon: Target, titleEn: 'Milestones & Goals', titleHe: 'אבני דרך ומטרות',
        descEn: 'Break dreams into steps', descHe: 'פרק חלומות לצעדים',
        color: 'from-red-500/20 to-orange-500/20',
        steps: [
          { title: 'Create Milestones', titleHe: 'צור אבני דרך',
            description: 'Each pillar can have milestones — significant achievements with deadlines. "Run a 5K by March", "Launch my website", "Read 12 books this year". Aurora helps you set realistic targets.',
            descriptionHe: 'לכל עמוד יכולות להיות אבני דרך — הישגים משמעותיים עם תאריכי יעד. "לרוץ 5 ק"מ עד מרץ", "להשיק את האתר", "לקרוא 12 ספרים השנה". אורורה עוזרת לקבוע יעדים ריאליסטיים.' },
          { title: 'Track Progress', titleHe: 'עקוב אחרי התקדמות',
            description: 'Each milestone shows completion percentage, remaining tasks, and estimated time. Visual progress bars keep you motivated.',
            descriptionHe: 'כל אבן דרך מציגה אחוז השלמה, משימות שנותרו וזמן משוער. סרגלי התקדמות חזותיים שומרים על המוטיבציה.' },
          { title: 'Milestone Rewards', titleHe: 'תגמולי אבני דרך',
            description: 'Completing a milestone awards bonus XP, MOS tokens, and potentially unlocks new Orb evolutions. Major milestones trigger confetti celebrations!',
            descriptionHe: `השלמת אבן דרך מעניקה בונוס ${ltr('XP')}, אסימוני ${ltr('MOS')}, ואולי פותחת התפתחויות אורב חדשות. אבני דרך גדולות מפעילות חגיגת קונפטי!` },
        ],
      },
    ],
  },

  // ─── Orb & Gamification ───
  {
    id: 'gamification',
    titleEn: '🎮 Orb & Gamification',
    titleHe: '🎮 אורב ומשחוק',
    descEn: 'Your digital avatar and reward system',
    descHe: 'האווטאר הדיגיטלי ומערכת התגמולים',
    icon: Gamepad2,
    color: 'from-fuchsia-500/15 to-pink-500/15',
    cards: [
      {
        id: 'orb-basics', icon: Sparkles, titleEn: 'Your Orb', titleHe: 'האורב שלך',
        descEn: 'Living consciousness avatar', descHe: 'אווטאר תודעה חי',
        color: 'from-fuchsia-500/20 to-pink-500/20',
        steps: [
          { title: 'What is the Orb?', titleHe: 'מהו האורב?',
            description: 'A real-time 3D avatar rendered with Three.js that reflects your consciousness state. Its colors map to your dominant pillars, its energy to your activity level, and its form to your overall level.',
            descriptionHe: 'אווטאר תלת-ממדי בזמן אמת שמשקף את מצב התודעה שלך. הצבעים ממופים לעמודים הדומיננטיים, האנרגיה לרמת הפעילות והצורה לרמה הכוללת.' },
          { title: 'Orb DNA Card', titleHe: `כרטיס ${ltr('DNA')} של האורב`,
            description: 'Tap your Orb to reveal its DNA card — an NFT-style identity showing: your unique color signature, level, XP, streak count, dominant traits, and a shareable QR code.',
            descriptionHe: `לחץ על האורב כדי לחשוף את כרטיס ה-${ltr('DNA')} שלו — כרטיס זהות ייחודי שמציג: חתימת צבע ייחודית, רמה, ${ltr('XP')}, רצף, תכונות דומיננטיות וקוד ${ltr('QR')} לשיתוף.` },
          { title: 'Orb Evolution', titleHe: 'התפתחות האורב',
            description: 'Level up to evolve your Orb. New forms unlock at levels 5, 10, 25, 50, and 100. Each evolution adds new particle effects, geometries, and animations.',
            descriptionHe: 'עלה רמה כדי לפתח את האורב. צורות חדשות נפתחות ברמות 5, 10, 25, 50 ו-100. כל התפתחות מוסיפה אפקטים, גיאומטריות ואנימציות חדשות.',
            tip: 'Your Orb is unique — no two users have the same combination.', tipHe: 'האורב שלך ייחודי — אין שני משתמשים עם אותו שילוב.' },
        ],
      },
      {
        id: 'xp-tokens', icon: Trophy, titleEn: 'XP & MOS Tokens', titleHe: `${ltr('XP')} ואסימוני ${ltr('MOS')}`,
        descEn: 'The Play2Earn economy', descHe: 'כלכלת משחק והרווחה',
        color: 'from-yellow-500/20 to-amber-500/20',
        steps: [
          { title: 'Earning XP', titleHe: `צבירת ${ltr('XP')}`,
            description: 'XP (Experience Points) come from: completing actions (+5-25 XP), maintaining streaks (multiplier bonus), finishing lessons (+10-50 XP), community participation (+2-10 XP), and milestone completions (+50-200 XP).',
            descriptionHe: `נקודות ניסיון (${ltr('XP')}) מגיעות מ: השלמת פעולות (${ltr('+5-25')}), שמירה על רצפים (בונוס מכפיל), סיום שיעורים (${ltr('+10-50')}), השתתפות בקהילה (${ltr('+2-10')}), והשלמת אבני דרך (${ltr('+50-200')}).` },
          { title: 'MOS Tokens', titleHe: `אסימוני ${ltr('MOS')}`,
            description: 'MOS (Mind OS) tokens are the platform currency. Earn them through achievements and spend them in the Free Market for courses, coaching sessions, digital products, and premium features.',
            descriptionHe: `אסימוני ${ltr('MOS')} הם מטבע הפלטפורמה. הרוויח אותם דרך הישגים והשתמש בהם בשוק החופשי לקורסים, סשנים, מוצרים דיגיטליים ותכונות פרימיום.` },
          { title: 'Levels & Ranks', titleHe: 'רמות ודירוגים',
            description: 'Your XP determines your level. Each level has a unique name and unlocks features. The level bar at the bottom of your screen shows progress to the next level.',
            descriptionHe: `ה-${ltr('XP')} קובע את הרמה שלך. לכל רמה שם ייחודי ופיצ\'רים חדשים. סרגל הרמה בתחתית המסך מציג התקדמות לרמה הבאה.` },
        ],
      },
      {
        id: 'achievements', icon: Award, titleEn: 'Achievements & Badges', titleHe: 'הישגים ותגים',
        descEn: 'Collect them all', descHe: 'אסוף את כולם',
        color: 'from-amber-500/20 to-orange-500/20',
        steps: [
          { title: 'Achievement Types', titleHe: 'סוגי הישגים',
            description: 'Achievements fall into categories: Consistency (streak milestones), Growth (skill level-ups), Social (community engagement), Explorer (trying new features), and Mastery (completing major goals).',
            descriptionHe: 'הישגים מחולקים לקטגוריות: עקביות (אבני דרך רצף), צמיחה (עליית מיומנויות), חברתי (מעורבות קהילתית), חוקר (ניסוי תכונות חדשות), ושליטה (השלמת מטרות גדולות).' },
          { title: 'Badge Display', titleHe: 'תצוגת תגים',
            description: 'Your earned badges appear on your profile and Orb DNA card. Some badges are rare and only available during limited-time events.',
            descriptionHe: `התגים שהרווחת מופיעים בפרופיל ובכרטיס ה-${ltr('DNA')} של האורב. חלק מהתגים נדירים וזמינים רק באירועים מוגבלי זמן.`,
            tip: 'Check the achievements page regularly — some are secret!', tipHe: 'בדוק את עמוד ההישגים באופן קבוע — חלקם סודיים!' },
        ],
      },
    ],
  },

  // ─── Skills & Learning ───
  {
    id: 'learning',
    titleEn: '📚 Skills & Learning',
    titleHe: '📚 מיומנויות ולמידה',
    descEn: 'Develop skills and take courses',
    descHe: 'פתח מיומנויות וקח קורסים',
    icon: GraduationCap,
    color: 'from-teal-500/15 to-cyan-500/15',
    cards: [
      {
        id: 'skill-tree', icon: Brain, titleEn: 'Skill System', titleHe: 'מערכת מיומנויות',
        descEn: 'Track your growth areas', descHe: 'עקוב אחרי תחומי הצמיחה',
        color: 'from-teal-500/20 to-cyan-500/20',
        steps: [
          { title: 'Your Skills', titleHe: 'המיומנויות שלך',
            description: 'Each action you complete contributes XP to specific skills. Skills are mapped to life pillars: Mindfulness, Emotional Intelligence, Physical Fitness, Communication, Leadership, Creativity, and more.',
            descriptionHe: `כל פעולה שתשלים תורמת ${ltr('XP')} למיומנויות ספציפיות. מיומנויות ממופות לעמודי חיים: מיינדפולנס, אינטליגנציה רגשית, כושר גופני, תקשורת, מנהיגות, יצירתיות ועוד.` },
          { title: 'Skill Levels', titleHe: 'רמות מיומנות',
            description: 'Each skill has its own level (1-100). Leveling up a skill grants bonus XP and may unlock new action suggestions from Aurora.',
            descriptionHe: `לכל מיומנות רמה משלה (${ltr('1-100')}). עליית רמה במיומנות מעניקה בונוס ${ltr('XP')} ועשויה לפתוח הצעות פעולה חדשות מאורורה.` },
        ],
      },
      {
        id: 'learn-courses', icon: GraduationCap, titleEn: 'Learning Courses', titleHe: 'קורסי למידה',
        descEn: 'Aurora teaches you anything', descHe: 'אורורה מלמדת אותך הכל',
        color: 'from-cyan-500/20 to-blue-500/20',
        steps: [
          { title: 'Create a Course', titleHe: 'צור קורס',
            description: 'Go to the Learn page and click "New Course". Tell Aurora what you want to learn — "Python for Data Science", "Guitar basics", "Digital Marketing" — and she generates a complete curriculum with modules and lessons.',
            descriptionHe: 'עבור לעמוד למידה ולחץ "קורס חדש". ספר לאורורה מה אתה רוצה ללמוד — והיא תייצר תוכנית לימודים מלאה עם מודולים ושיעורים.' },
          { title: 'Lesson Types', titleHe: 'סוגי שיעורים',
            description: 'Courses include Theory (reading), Practice (hands-on exercises), Quiz (knowledge checks), and Project (real-world application). Each earns XP.',
            descriptionHe: `קורסים כוללים תיאוריה (קריאה), תרגול (תרגילים מעשיים), בוחן (בדיקת ידע) ופרויקט (יישום בעולם האמיתי). כל אחד מרוויח ${ltr('XP')}.` },
          { title: 'Track Progress', titleHe: 'עקוב אחרי התקדמות',
            description: 'See your completion percentage, earned XP, and next lesson at a glance. Modules unlock progressively — finish one to access the next.',
            descriptionHe: `ראה את אחוז ההשלמה, ${ltr('XP')} שנצבר והשיעור הבא במבט אחד. מודולים נפתחים בהדרגה — סיים אחד כדי לגשת לבא.`,
            tip: 'Courses you create are saved and can be recalibrated anytime.', tipHe: 'קורסים שיצרת נשמרים וניתן לכייל אותם מחדש בכל עת.' },
        ],
      },
    ],
  },

  // ─── Community ───
  {
    id: 'community',
    titleEn: '👥 Community',
    titleHe: '👥 קהילה',
    descEn: 'Connect, share, and grow together',
    descHe: 'התחבר, שתף וצמח ביחד',
    icon: Users,
    color: 'from-indigo-500/15 to-blue-500/15',
    cards: [
      {
        id: 'community-basics', icon: Users, titleEn: 'Community Feed', titleHe: 'פיד קהילה',
        descEn: 'Posts, discussions, sharing', descHe: 'פוסטים, דיונים, שיתוף',
        color: 'from-indigo-500/20 to-blue-500/20',
        steps: [
          { title: 'Browse by Pillar', titleHe: 'גלוש לפי עמוד',
            description: 'The Community page is organized by life pillars. Click a pillar card to see its subcategories, then browse threads. Use "New" and "Hot" toggles to sort.',
            descriptionHe: 'עמוד הקהילה מאורגן לפי עמודי חיים. לחץ על כרטיס עמוד כדי לראות תת-קטגוריות ואז גלוש בשרשורים. השתמש במיתוגי "חדש" ו"חם" למיון.' },
          { title: 'Create Posts', titleHe: 'צור פוסטים',
            description: 'Share insights, ask questions, celebrate wins, or start discussions. Posts can include text, images, and tags. You earn community points for engagement.',
            descriptionHe: 'שתף תובנות, שאל שאלות, חגוג ניצחונות או התחל דיונים. פוסטים יכולים לכלול טקסט, תמונות ותגיות. אתה מרוויח נקודות קהילה על מעורבות.' },
          { title: 'Like & Comment', titleHe: 'לייק ותגובה',
            description: 'React to posts, leave thoughtful comments, and support others. The more you engage, the higher your community level grows.',
            descriptionHe: 'הגב לפוסטים, השאר תגובות מחושבות ותמוך באחרים. ככל שתשתתף יותר, כך רמת הקהילה שלך תעלה.' },
        ],
      },
      {
        id: 'community-events', icon: Calendar, titleEn: 'Events & Challenges', titleHe: 'אירועים ואתגרים',
        descEn: 'Live sessions and group activities', descHe: 'סשנים חיים ופעילויות קבוצתיות',
        color: 'from-blue-500/20 to-sky-500/20',
        steps: [
          { title: 'Community Events', titleHe: 'אירועי קהילה',
            description: 'Join live events: group meditations, coaching sessions, workshops, and Q&A sessions with experts. RSVP to secure your spot.',
            descriptionHe: 'הצטרף לאירועים חיים: מדיטציות קבוצתיות, סשנים של אימון, סדנאות ושאלות ותשובות עם מומחים. אשר הגעה כדי לשמור מקום.' },
          { title: 'Community Levels', titleHe: 'רמות קהילה',
            description: 'Earn community points through posting, commenting, and attending events. Level up to unlock badges, special features, and recognition.',
            descriptionHe: 'צבור נקודות קהילה דרך פרסום, תגובות והשתתפות באירועים. עלה רמה כדי לפתוח תגים, תכונות מיוחדות והכרה.' },
        ],
      },
    ],
  },

  // ─── Business & Coaching ───
  {
    id: 'business',
    titleEn: '💼 Business & Coaching',
    titleHe: '💼 עסקים ואימון',
    descEn: 'Tools for coaches and entrepreneurs',
    descHe: 'כלים למאמנים ויזמים',
    icon: Briefcase,
    color: 'from-rose-500/15 to-red-500/15',
    cards: [
      {
        id: 'coaching-tools', icon: Heart, titleEn: 'For Coaches', titleHe: 'למאמנים',
        descEn: 'Run your coaching practice', descHe: 'הפעל את הפרקטיקה שלך',
        color: 'from-rose-500/20 to-pink-500/20',
        steps: [
          { title: 'Set Up Your Practice', titleHe: 'הקם את הפרקטיקה',
            description: 'Complete the Coaching Journey wizard to define your niche, methodology, ideal client, value proposition, services, and marketing strategy. Aurora guides you through each step.',
            descriptionHe: 'השלם את מסע האימון כדי להגדיר את הנישה, המתודולוגיה, הלקוח האידיאלי, הצעת הערך, השירותים ואסטרטגיית השיווק. אורורה מדריכה אותך בכל שלב.' },
          { title: 'Client Management', titleHe: 'ניהול לקוחות',
            description: 'Create personalized plans for each client, track their progress, schedule sessions, and use AI-assisted session notes. Set up bookings with your available time slots.',
            descriptionHe: 'צור תוכניות מותאמות לכל לקוח, עקוב אחרי ההתקדמות, תזמן סשנים והשתמש בתיעוד סשנים בסיוע בינה מלאכותית. הגדר הזמנות עם חלונות הזמן הפנויים שלך.' },
          { title: 'Landing Pages', titleHe: 'דפי נחיתה',
            description: 'Build professional landing pages for your coaching services. Customize design, add testimonials, embed booking forms, and capture leads — all within Mind OS.',
            descriptionHe: 'בנה דפי נחיתה מקצועיים לשירותי האימון. התאם עיצוב, הוסף המלצות, הטמע טפסי הזמנה ותפוס לידים — הכל בתוך הפלטפורמה.' },
        ],
      },
      {
        id: 'business-tools', icon: Briefcase, titleEn: 'For Entrepreneurs', titleHe: 'ליזמים',
        descEn: 'Build your business', descHe: 'בנה את העסק שלך',
        color: 'from-red-500/20 to-rose-500/20',
        steps: [
          { title: 'Business Journey', titleHe: 'מסע עסקי',
            description: 'The Business Journey wizard helps you define your vision, business model, target audience, value proposition, financial plan, marketing strategy, and action plan.',
            descriptionHe: 'אשף המסע העסקי עוזר לך להגדיר חזון, מודל עסקי, קהל יעד, הצעת ערך, תוכנית פיננסית, אסטרטגיית שיווק ותוכנית פעולה.' },
          { title: 'Business Plans', titleHe: 'תוכניות עסקיות',
            description: 'Generate weekly milestone plans with tasks, focus areas, and progress tracking. Aurora helps you stay accountable to your business goals.',
            descriptionHe: 'צור תוכניות אבני דרך שבועיות עם משימות, תחומי מיקוד ומעקב התקדמות. אורורה עוזרת לך להישאר מחויב למטרות העסקיות.' },
        ],
      },
      {
        id: 'free-market', icon: Store, titleEn: 'Free Market', titleHe: 'שוק חופשי',
        descEn: 'Buy and sell digital products', descHe: 'קנה ומכור מוצרים דיגיטליים',
        color: 'from-orange-500/20 to-red-500/20',
        steps: [
          { title: 'Browse Products', titleHe: 'גלוש במוצרים',
            description: 'Explore courses, coaching sessions, digital tools, and resources from coaches and creators. Filter by category, price, or rating.',
            descriptionHe: 'חקור קורסים, סשנים, כלים דיגיטליים ומשאבים ממאמנים ויוצרים. סנן לפי קטגוריה, מחיר או דירוג.' },
          { title: 'Sell Your Products', titleHe: 'מכור את המוצרים שלך',
            description: 'As a coach or creator, list your digital products. Set prices in NIS or MOS tokens. Create product pages with descriptions, previews, and reviews.',
            descriptionHe: `כמאמן או יוצר, רשום את המוצרים הדיגיטליים שלך. קבע מחירים בש"ח או באסימוני ${ltr('MOS')}. צור דפי מוצר עם תיאורים, תצוגות מקדימות וביקורות.` },
          { title: 'Affiliate Program', titleHe: 'תוכנית שותפים',
            description: 'Earn commissions by referring new users. Get a unique affiliate code, share it, and earn a percentage of purchases made through your referral.',
            descriptionHe: 'הרוויח עמלות על ידי הפניית משתמשים חדשים. קבל קוד שותף ייחודי, שתף אותו והרוויח אחוז מרכישות שנעשו דרך ההפניה שלך.' },
        ],
      },
    ],
  },

  // ─── Settings & Privacy ───
  {
    id: 'settings',
    titleEn: '⚙️ Settings & Privacy',
    titleHe: '⚙️ הגדרות ופרטיות',
    descEn: 'Customize your experience',
    descHe: 'התאם את החוויה שלך',
    icon: Settings,
    color: 'from-slate-500/15 to-gray-500/15',
    cards: [
      {
        id: 'app-settings', icon: Settings, titleEn: 'App Settings', titleHe: 'הגדרות אפליקציה',
        descEn: 'Customize everything', descHe: 'התאם את הכל',
        color: 'from-slate-500/20 to-gray-500/20',
        steps: [
          { title: 'Language & Theme', titleHe: 'שפה ועיצוב',
            description: 'Switch between Hebrew and English. Toggle dark/light mode. The entire app adapts to your language including RTL/LTR layout.',
            descriptionHe: 'החלף בין עברית לאנגלית. החלף מצב כהה או בהיר. כל האפליקציה מתאימה את עצמה לשפה כולל כיוון פריסה.' },
          { title: 'Notifications', titleHe: 'התראות',
            description: 'Control which notifications you receive: daily reminders, streak alerts, community activity, Aurora proactive nudges, and event invitations.',
            descriptionHe: 'שלוט באילו התראות אתה מקבל: תזכורות יומיות, התרעות רצף, פעילות קהילתית, דחיפות יזומות מאורורה והזמנות לאירועים.' },
          { title: 'PWA Installation', titleHe: 'התקנה כאפליקציה',
            description: 'Mind OS works as a Progressive Web App. Install it on your phone for a native app experience with push notifications, offline access, and home screen icon.',
            descriptionHe: 'הפלטפורמה עובדת כאפליקציית ווב מתקדמת. התקן אותה בטלפון לחוויה של אפליקציה מלאה עם התראות, גישה אופליין ואייקון במסך הבית.',
            tip: 'On iOS: Safari → Share → Add to Home Screen.', tipHe: `באייפון: ${ltr('Safari')} ← שתף ← הוסף למסך הבית.` },
        ],
      },
      {
        id: 'privacy', icon: Shield, titleEn: 'Privacy & Security', titleHe: 'פרטיות ואבטחה',
        descEn: 'Your data is protected', descHe: 'המידע שלך מוגן',
        color: 'from-gray-500/20 to-zinc-500/20',
        steps: [
          { title: 'Data Privacy', titleHe: 'פרטיות מידע',
            description: 'All conversations with Aurora are encrypted and private. We never sell or share your personal data. Your consciousness journey data belongs to you.',
            descriptionHe: 'כל השיחות עם אורורה מוצפנות ופרטיות. אנחנו אף פעם לא מוכרים או משתפים את המידע האישי שלך. מידע מסע התודעה שלך שייך לך.' },
          { title: 'Account Control', titleHe: 'שליטה בחשבון',
            description: 'Export your data anytime. Delete conversations selectively. Control profile visibility. Delete your entire account and all associated data from Settings.',
            descriptionHe: 'ייצא את המידע בכל עת. מחק שיחות באופן סלקטיבי. שלוט בנראות הפרופיל. מחק את כל החשבון והמידע מההגדרות.' },
          { title: 'Community Safety', titleHe: 'בטיחות קהילתית',
            description: 'Report inappropriate content, block users, and manage who can see your posts. Moderators review reports and maintain community standards.',
            descriptionHe: 'דווח על תוכן לא הולם, חסום משתמשים ונהל מי יכול לראות את הפוסטים שלך. מנהלים בודקים דיווחים ושומרים על סטנדרטים קהילתיים.' },
        ],
      },
    ],
  },
];

interface UserDocsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDocsModal({ open, onOpenChange }: UserDocsModalProps) {
  const { language, isRTL } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<GuideCard | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleClose = () => {
    setSelectedGuide(null);
    setSelectedCategory(null);
    setCurrentStep(0);
  };

  const handleBack = () => {
    if (selectedGuide && currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (selectedGuide) {
      setSelectedGuide(null);
      setCurrentStep(0);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const handleNext = () => {
    if (selectedGuide && currentStep < selectedGuide.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const title = selectedGuide
    ? (isRTL ? selectedGuide.titleHe : selectedGuide.titleEn)
    : selectedCategory
      ? (isRTL ? selectedCategory.titleHe : selectedCategory.titleEn)
      : (isRTL ? 'מדריך למשתמש' : 'User Guide');

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); onOpenChange(val); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader
          title={title}
          icon={selectedGuide ? <selectedGuide.icon className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
          showBackArrow={!!(selectedGuide || selectedCategory)}
          onBack={handleBack}
          className="px-6 pt-6"
        />

        <ScrollArea className="flex-1 max-h-[calc(85vh-5rem)]">
          <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* ── Level 1: Category Grid ── */}
            {!selectedCategory && !selectedGuide && (
              <div className="grid grid-cols-2 gap-3">
                {GUIDE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "group relative flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50",
                        "bg-gradient-to-br", cat.color,
                        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                        "transition-all duration-200 text-start"
                      )}
                    >
                      <div className="p-2 rounded-lg bg-background/60 backdrop-blur-sm">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">
                          {isRTL ? cat.titleHe : cat.titleEn}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {isRTL ? cat.descHe : cat.descEn}
                        </p>
                      </div>
                      <div className="absolute top-3 end-3 text-[10px] text-muted-foreground/60 font-medium">
                        {cat.cards.length} {isRTL ? 'נושאים' : 'topics'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Level 2: Topic Cards within a Category ── */}
            {selectedCategory && !selectedGuide && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-4">
                  {isRTL ? selectedCategory.descHe : selectedCategory.descEn}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {selectedCategory.cards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.id}
                        onClick={() => { setSelectedGuide(card); setCurrentStep(0); }}
                        className={cn(
                          "group relative flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50",
                          "bg-gradient-to-br", card.color,
                          "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                          "transition-all duration-200 text-start"
                        )}
                      >
                        <div className="p-2 rounded-lg bg-background/60 backdrop-blur-sm">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">
                            {isRTL ? card.titleHe : card.titleEn}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {isRTL ? card.descHe : card.descEn}
                          </p>
                        </div>
                        <div className="absolute top-3 end-3 text-[10px] text-muted-foreground/60 font-medium">
                          {card.steps.length} {isRTL ? 'שלבים' : 'steps'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Level 3: Step Walkthrough ── */}
            {selectedGuide && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2">
                  {selectedGuide.steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        idx === currentStep
                          ? "w-8 bg-primary"
                          : idx < currentStep
                            ? "w-2 bg-primary/40"
                            : "w-2 bg-muted-foreground/20"
                      )}
                    />
                  ))}
                </div>

                {(() => {
                  const step = selectedGuide.steps[currentStep];
                  return (
                    <div className="space-y-4 animate-in fade-in-0 slide-in-from-end-4 duration-300">
                      <div className="text-center">
                        <span className="text-xs font-medium text-primary/70 uppercase tracking-wider">
                          {isRTL ? `שלב ${currentStep + 1} מתוך ${selectedGuide.steps.length}` : `Step ${currentStep + 1} of ${selectedGuide.steps.length}`}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-center text-foreground">
                        {isRTL ? step.titleHe : step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-md mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                        {isRTL ? step.descriptionHe : step.description}
                      </p>
                      {(step.tip || step.tipHe) && (
                        <div className="mx-auto max-w-md p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-xs text-primary flex items-start gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
                            <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span>{isRTL ? step.tipHe : step.tip}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    {currentStep === 0
                      ? (isRTL ? 'חזרה לתפריט' : '← Back')
                      : (isRTL ? 'הקודם' : '← Previous')
                    }
                    {isRTL && <ArrowLeft className="h-3.5 w-3.5" />}
                  </button>
                  {currentStep < selectedGuide.steps.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
                    >
                      {isRTL ? 'הבא' : 'Next →'}
                      {isRTL && <span>→</span>}
                    </button>
                  ) : (
                    <button
                      onClick={() => { setSelectedGuide(null); setCurrentStep(0); }}
                      className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {isRTL ? 'סיום ✓' : 'Done ✓'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}