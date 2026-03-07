import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Web3Roadmap } from '@/components/docs/Web3Roadmap';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5 } }),
};

interface Section {
  id: string;
  number: string;
  title: string;
  paragraphs: string[];
  subsections?: { title: string; paragraphs: string[] }[];
}

export default function Documentation() {
  const { language, isRTL } = useTranslation();
  const { theme } = useThemeSettings();
  const navigate = useNavigate();
  const he = language === 'he';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const brandName = he ? theme.brand_name : theme.brand_name_en;
  const founderName = he ? theme.founder_name : theme.founder_name_en;

  const abstractText = he
    ? `${brandName} הוא מערכת הפעלה אישית מבוססת בינה מלאכותית, המשלבת מנגנוני Play-to-Earn (P2E), נכסים דיגיטליים ייחודיים (NFTs), גיימיפיקציה עמוקה, היפנוזה ומדיטציה מונחית AI, מערכת למידה אדפטיבית, שוק פנימי (FreeMarket), ופלטפורמת מאמנים — לתוך מערכת הפעלה אחת שעוטפת את חיי המשתמש. המסמך מציג את הארכיטקטורה, הכלכלה הדיגיטלית, מערכת ה-AI התודעתית (Aurora), מודל המנויים, ומפת הדרכים של הפרויקט. המטבע הפנימי MOS (100 MOS = $1.00) מבוסס על מנגנון Proof of Growth — מודל כריית נתונים שמתגמל פעילות אנושית אמיתית.`
    : `${brandName} is an AI-powered Personal Operating System that integrates Play-to-Earn (P2E) mechanics, unique digital assets (NFTs), deep gamification, AI-guided hypnosis and meditation, an adaptive learning system, an internal marketplace (FreeMarket), and a coach platform — into a single operating system that wraps around the user's life. This paper presents the architecture, digital economy, consciousness AI engine (Aurora), subscription model, and roadmap. The internal currency MOS (100 MOS = $1.00) is based on a Proof of Growth mechanism — a data mining model that rewards genuine human activity.`;

  const sections: Section[] = [
    {
      id: 'introduction',
      number: '1',
      title: he ? 'מבוא' : 'Introduction',
      paragraphs: he ? [
        `העולם מוצף באפליקציות — לבריאות, לפרודוקטיביות, למדיטציה, לכסף, ולמערכות יחסים. אבל אף אחת מהן לא מדברת עם השנייה. התוצאה: פיצול קוגניטיבי, עומס דיגיטלי, ותחושת חוסר שליטה.`,
        `${brandName} מציע פרדיגמה חדשה: שכבה אינטליגנטית אחת שיושבת מעל כל תחומי החיים — בריאות, קריירה, זוגיות, כסף, הרגלים, ותודעה — ומנהלת אותם כמערכת הפעלה מאוחדת. לא עוד אפליקציה, אלא מערכת ההפעלה של החיים שלך.`,
        `בניגוד למתחרים, ${brandName} משלב שלושה מנועים: (1) AI תודעתי אדפטיבי, (2) כלכלה דיגיטלית מבוססת Proof of Growth, ו-(3) מערכת NFT שמייצגת את הזהות המתפתחת של המשתמש.`,
      ] : [
        `The world is flooded with apps — for health, productivity, meditation, finance, and relationships. But none of them talk to each other. The result: cognitive fragmentation, digital overload, and a loss of control.`,
        `${brandName} proposes a new paradigm: a single intelligent layer that sits above all life domains — health, career, relationships, finances, habits, and consciousness — and manages them as a unified operating system. Not another app, but the operating system of your life.`,
        `Unlike competitors, ${brandName} combines three engines: (1) an adaptive consciousness AI, (2) a Proof of Growth digital economy, and (3) an NFT system representing the user's evolving identity.`,
      ],
    },
    {
      id: 'problem',
      number: '2',
      title: he ? 'הבעיה' : 'Problem Statement',
      paragraphs: he ? [
        `האדם המודרני מנהל את חייו דרך עשרות כלים מנותקים. מחקרים מראים שהמשתמש הממוצע מתקין 80+ אפליקציות ומשתמש ב-9 ביום. כל אפליקציה פותרת פריסה צרה של הבעיה, אבל אף אחת לא רואה את התמונה המלאה.`,
        `התוצאה: (א) חוסר יכולת לזהות דפוסים חוצי-תחומים, (ב) אובדן מוטיבציה בגלל חוסר תגמול מערכתי, (ג) תחושת ניתוק בין "מי שאני" ל"מי שאני רוצה להיות", (ד) בזבוז נתונים אישיים בעלי ערך אדיר — ללא שום תמורה למשתמש.`,
      ] : [
        `Modern humans manage their lives through dozens of disconnected tools. Research shows the average user installs 80+ apps and uses 9 daily. Each app solves a narrow slice of the problem, but none sees the full picture.`,
        `The result: (a) inability to identify cross-domain patterns, (b) motivation loss due to lack of systemic reward, (c) a disconnect between "who I am" and "who I want to be", (d) waste of immensely valuable personal data — with zero return to the user.`,
      ],
    },
    {
      id: 'methodology',
      number: '3',
      title: he ? 'מתודולוגיית Why-How-Now' : 'The Why-How-Now Methodology',
      paragraphs: he ? [
        `${brandName} בנוי סביב מתודולוגיית "Why-How-Now" — מסגרת שלושה אופקים שמתרגמת חזון מופשט לפעולות קונקרטיות. שלושת האופקים הם: Strategy (למה), Tactics (איך), ו-Now (עכשיו).`,
        `Strategy (Why): מגדיר את מטרות החיים, ערכים, משימות, ו-14 עמודי חיים. זהו הצפון של המשתמש — ה"למה" מאחורי כל פעולה.`,
        `Tactics (How): מפרק את האסטרטגיה לתוכנית 100 ימים עם שלבים, אבני דרך, ובלוקי פעולה יומיים. זהו ה"איך" — הגשר בין חזון לביצוע.`,
        `Now (עכשיו): דשבורד הביצוע היומי — מציג את פעולות היום מחולקות ל-4 רבעוני יום עם שמות הרפתקניים ייחודיים, סטטוס אנרגיה, streak, ו-Movement Score שמודד מומנטום בזמן אמת.`,
      ] : [
        `${brandName} is built around the "Why-How-Now" methodology — a three-horizon framework that translates abstract vision into concrete daily actions. The three horizons are: Strategy (Why), Tactics (How), and Now (execute).`,
        `Strategy (Why): Defines life goals, values, missions, and 14 life pillars. This is the user's north star — the "why" behind every action.`,
        `Tactics (How): Breaks down strategy into a 100-day plan with phases, milestones, and daily action blocks. This is the "how" — the bridge between vision and execution.`,
        `Now (Execute): The daily execution dashboard — displays today's actions divided into 4 adventure-themed day quarters with unique names, energy status, streak, and a Movement Score measuring real-time momentum.`,
      ],
    },
    {
      id: 'solution',
      number: '4',
      title: he ? 'הפתרון — חמישה Hubs' : 'The Solution — Five Hubs',
      paragraphs: he ? [
        `${brandName} הוא Human Operating System — מערכת הפעלה אנושית שמאחדת את כל ממדי החיים תחת קורת גג אחת. הפלטפורמה בנויה מחמישה Hubs בסדר עדיפות ביצועי:`,
      ] : [
        `${brandName} is a Human Operating System that unifies all life dimensions under one roof. The platform is built from five Hubs in execution-priority order:`,
      ],
      subsections: [
        {
          title: he ? '4.1 Now Hub — מרכז הביצוע' : '4.1 Now Hub — Execution Center',
          paragraphs: he ? [
            `Now הוא דף הנחיתה ומרכז הביצוע של ${brandName}. הדשבורד מציג את פעולות היום מחולקות ל-4 רבעוני יום (בוקר, צהריים, אחר הצהריים, ערב) — כל רבע מקבל שם הרפתקני ייחודי שמתחדש כל יום ("Dawn Forge", "Summit Push", "Iron Hour" וכו').`,
            `ה-Movement Score מודד מומנטום בזמן אמת — אחוז ההשלמה היומי שמניע את האורב. כולל: סטטוס אנרגיה, streak יומי, XP, טוקנים, ומערכת Quest — כל יום הוא משימה (Quest) עם שם ייחודי, ושבוע שלם מרכיב קמפיין.`,
            `כשלמשתמש אין תוכנית פעילה, Now מפנה אוטומטית ל-Strategy Hub ליצירת תוכנית 100 ימים.`,
          ] : [
            `Now is the landing page and execution center of ${brandName}. The dashboard displays today's actions divided into 4 day quarters (morning, midday, afternoon, evening) — each quarter receives a unique adventure name that refreshes daily ("Dawn Forge", "Summit Push", "Iron Hour", etc.).`,
            `The Movement Score measures real-time momentum — the daily completion percentage that drives the orb. Includes: energy status, daily streak, XP, tokens, and a Quest system — each day is a Quest with a unique name, and an entire week forms a Campaign.`,
            `When the user has no active plan, Now automatically redirects to Strategy Hub for 100-day plan creation.`,
          ],
        },
        {
          title: he ? '4.2 Tactics Hub — טקטיקה וביצוע' : '4.2 Tactics Hub — Tactical Execution',
          paragraphs: he ? [
            `Tactics מציג את ה"איך" — תוכנית 7 ימים עם פעולות יומיות מסודרות ב-4 רבעונים הרפתקניים. כל יום מוצג כ-Quest עם שם ייחודי, והיום הנוכחי מסומן בתג כחול. המשתמש יכול לסמן השלמת בלוקים ולראות את ההתקדמות בזמן אמת.`,
            `ה-Tactics Hub פתוח לכל המשתמשים (כולל חינמיים) כדי לעודד מומנטום יומי. כולל ניהול משימות, פרויקטים, Sprints, ו-Milestones עם תעדוף AI וsubtasks היררכיים.`,
          ] : [
            `Tactics shows the "How" — a 7-day plan with daily actions organized in 4 adventure-themed quarters. Each day is displayed as a Quest with a unique name, and the current day is marked with a blue badge. Users can mark block completion and see real-time progress.`,
            `The Tactics Hub is open to all users (including free tier) to encourage daily momentum. Includes task management, projects, sprints, and milestones with AI prioritization and hierarchical subtasks.`,
          ],
        },
        {
          title: he ? '4.3 Strategy Hub — אסטרטגיה ותכנון' : '4.3 Strategy Hub — Strategy & Planning',
          paragraphs: he ? [
            `Strategy מציג את ה"למה" ומנהל את Pipeline האסטרטגי המלא. התהליך: (1) בחירת עמודי חיים (2-14 לפי רמת מנוי) דרך StrategyPillarWizard, (2) סריקת AI עומק לכל עמוד עם ציון 0-100, (3) יצירת תוכנית 100 ימים מחולקת ל-10 שלבים עם Milestones ופעולות יומיות.`,
            `כולל: תכונות אופי (Traits), משימות חיים (Missions), יעדים (Goals), ומערכת "כיול מחדש" (Recalibrate) שמאפשרת לעדכן את האסטרטגיה. במנוי Apex, השלמת הערכה מזריקה אסטרטגיות חדשות לתוכנית הפעילה ללא צורך ביצירה מחדש.`,
            `14 עמודי החיים: נוכחות, כוח, חיוניות, פוקוס, לחימה, התרחבות, תודעה, עושר, השפעה, מערכות יחסים, עסקים, פרויקטים, משחק, ואומנות.`,
          ] : [
            `Strategy shows the "Why" and manages the full strategic pipeline. The process: (1) select life pillars (2-14 based on subscription tier) via StrategyPillarWizard, (2) AI deep scan for each pillar scoring 0-100, (3) generate a 100-day plan divided into 10 phases with milestones and daily actions.`,
            `Includes: character Traits, life Missions, Goals, and a "Recalibrate" system for strategy updates. On the Apex tier, completing an assessment injects new strategies into the active plan without full regeneration.`,
            `The 14 Life Pillars: Presence, Power, Vitality, Focus, Combat, Expansion, Consciousness, Wealth, Influence, Relationships, Business, Projects, Play, and Craft.`,
          ],
        },
        {
          title: he ? '4.4 Community Hub — קהילה' : '4.4 Community Hub — Community',
          paragraphs: he ? [
            `פיד קהילתי עם פוסטים, תגובות, לייקים, אירועים, ודירוגים. כולל מערכת רמות קהילתיות, נקודות, ו-badges. Aurora משתתפת בשיחות כחברת קהילה AI. ניווט לפי 14 עמודי חיים ונושאים (Topics) דרך הסיידבר.`,
            `תמיכה דו-לשונית מלאה בתוכן (title_he, content_he) עם זיהוי שפה אוטומטי. אירועים קהילתיים עם RSVP, מפגשים וירטואליים, ולוח מובילים.`,
          ] : [
            `Community feed with posts, comments, likes, events, and leaderboards. Includes community levels, points, and badges. Aurora participates in conversations as an AI community member. Navigation by 14 life pillars and Topics via the sidebar.`,
            `Full bilingual content support (title_he, content_he) with automatic language detection. Community events with RSVP, virtual meetups, and leaderboards.`,
          ],
        },
        {
          title: he ? '4.5 Learn Hub — למידה' : '4.5 Learn Hub — Learning',
          paragraphs: he ? [
            `"Aurora מלמדת אותך" — מערכת למידה אדפטיבית עם HUD דו-סיידבר: סיידבר שמאלי לניווט קורסים וסיידבר ימני לעץ הקוריקולום. המערכת משתמשת במודל "Lazy Generation" — שלד הקורס נוצר מיידית, והתוכן מיוצר דינמית רק כשהמשתמש מגיע לשיעור ספציפי ונשמר במטמון.`,
            `כל שיעור כולל תרגול מעשי שמסוכם אוטומטית כ-"Plan Integration Summary" ומסונכרן לתור הביצוע (Tactics Hub) כפעולות בתוכנית. כפתור "בנה את הקוריקולום!" נגיש מכל מקום במערכת דרך ה-Aurora Dock. כולל מסע אונבורדינג, מסע עסקי (10 שלבים), מסע אימון (10 שלבים), ומסע פרויקטים.`,
            `זרימת השלמה: מנגנון auto-advance עם שלב השלמה חובה דו-שלבי (חזרה לקורס או שיעור הבא).`,
          ] : [
            `"Aurora Teaches You" — an adaptive learning system with a dual-sidebar HUD: left sidebar for course navigation and right sidebar for the curriculum tree. Uses a "Lazy Generation" model — course skeleton is created instantly, and content is generated dynamically only when the user reaches a specific lesson, then cached.`,
            `Each lesson includes practical exercises that are auto-summarized as a "Plan Integration Summary" and synced to the execution queue (Tactics Hub) as plan actions. The "Build the Curriculum!" button is accessible from anywhere via the Aurora Dock. Includes onboarding journey, business journey (10 steps), coaching journey (10 steps), and projects journey.`,
            `Completion flow: auto-advance mechanism with a mandatory two-step completion gate (Back to Course or Next Lesson).`,
          ],
        },
      ],
    },
    {
      id: 'aurora',
      number: '5',
      title: he ? 'Aurora — מנוע ה-AI התודעתי' : 'Aurora — Consciousness AI Engine',
      paragraphs: he ? [
        `Aurora היא ליבת האינטליגנציה של ${brandName}. היא אינה צ'אטבוט רגיל — אלא מנוע תודעתי שלומד את הדפוסים ההתנהגותיים של המשתמש, מזהה מצבים רגשיים, ומייצרת פעולות פרואקטיביות.`,
        `Aurora מנהלת: (1) שיחות אישיות מותאמות קונטקסט, (2) תוכניות פעולה יומיות/שבועיות, (3) סריקות עומק ל-14 עמודי חיים, (4) מנגנון תזכורות ודחיפה פרואקטיבית, (5) ניתוח דפוסי אנרגיה, (6) זיהוי ego states ומצבי תודעה.`,
        `המודל משתמש ב-Gemini 2.5 Pro/Flash ו-GPT-5 עם system prompts מותאמים שכוללים את הפרופיל המלא של המשתמש, היסטוריית שיחות, ציוני עמודים, ומצב רגשי נוכחי. המערכת תומכת בעיבוד מולטימודלי (טקסט + תמונות) דרך מודלים עם יכולות ראייה.`,
      ] : [
        `Aurora is the intelligence core of ${brandName}. It is not a regular chatbot — but a consciousness engine that learns behavioral patterns, identifies emotional states, and generates proactive actions.`,
        `Aurora manages: (1) context-aware personal conversations, (2) daily/weekly action plans, (3) deep scans for 14 life pillars, (4) proactive reminders and nudges, (5) energy pattern analysis, (6) ego state and consciousness level detection.`,
        `The model uses Gemini 2.5 Pro/Flash and GPT-5 with custom system prompts that include the user's full profile, conversation history, pillar scores, and current emotional state. The system supports multimodal processing (text + images) through vision-capable models.`,
      ],
      subsections: [
        {
          title: he ? '5.1 זיכרון שיחות וזיכרון ארוך טווח' : '5.1 Conversation Memory & Long-Term Memory',
          paragraphs: he ? [
            `Aurora שומרת זיכרון שיחות מלא — כולל סיכומי שיחה, נושאים מרכזיים, מצב רגשי, ופעולות שהוסכמו. הזיכרון מזורק לכל שיחה חדשה כקונטקסט, מה שמאפשר המשכיות אמיתית לאורך זמן. הזיכרון מודע לציר הזמן — אירועים אחרונים ושינויי זהות מקבלים עדיפות.`,
          ] : [
            `Aurora maintains full conversation memory — including conversation summaries, key topics, emotional state, and agreed-upon actions. Memory is injected into every new conversation as context, enabling true continuity over time. Memory is timeline-aware — recent events and identity shifts are prioritized.`,
          ],
        },
        {
          title: he ? '5.2 מערכת פרואקטיבית' : '5.2 Proactive System',
          paragraphs: he ? [
            `Aurora לא מחכה שתדבר אליה — היא פועלת פרואקטיבית. מערכת ה-Proactive Queue מזהה טריגרים (streak שנשבר, ירידה באנרגיה, משימה שנדחתה) ומייצרת דחיפות חכמות עם עדיפויות. כולל push notifications, תזכורות מתוזמנות, ומנגנון idempotency למניעת כפילויות.`,
          ] : [
            `Aurora doesn't wait for you to talk — it acts proactively. The Proactive Queue system detects triggers (broken streak, energy drop, postponed task) and generates smart nudges with priorities. Includes push notifications, scheduled reminders, and an idempotency mechanism to prevent duplicates.`,
          ],
        },
        {
          title: he ? '5.3 דפוסים התנהגותיים ואנרגטיים' : '5.3 Behavioral & Energy Patterns',
          paragraphs: he ? [
            `Aurora מנתחת דפוסי התנהגות ואנרגיה לאורך זמן — מזהה מתי המשתמש הכי פרודוקטיבי, מתי צריך מנוחה, ואילו פעילויות משפיעות על מצב הרוח. המידע משפיע על תזמון משימות, המלצות, ותוכן מותאם.`,
          ] : [
            `Aurora analyzes behavioral and energy patterns over time — identifying when the user is most productive, when rest is needed, and which activities affect mood. This data influences task timing, recommendations, and personalized content.`,
          ],
        },
        {
          title: he ? '5.4 Aurora Dock — ממשק פעולות מהירות' : '5.4 Aurora Dock — Quick Action Interface',
          paragraphs: he ? [
            `ה-Aurora Dock הוא ממשק צף שנגיש מכל מקום במערכת — כפתור FAB (Floating Action Button) שפותח מגש פעולות מהירות. דרכו המשתמש יכול: לפתוח שיחה עם Aurora, להתחיל סשן היפנוזה, לבנות קוריקולום, לסרוק עמוד חיים, ולהציץ במשימות היום. ה-Dock מזהה קונטקסט ומציע פעולות רלוונטיות לפי הדף הנוכחי.`,
          ] : [
            `The Aurora Dock is a floating interface accessible from anywhere in the system — a FAB (Floating Action Button) that opens a quick-action tray. Through it users can: start an Aurora conversation, begin a hypnosis session, build a curriculum, scan a life pillar, and peek at today's tasks. The Dock is context-aware and suggests relevant actions based on the current page.`,
          ],
        },
      ],
    },
    {
      id: 'hypnosis',
      number: '6',
      title: he ? 'היפנוזה ומדיטציה מונחית AI' : 'AI-Guided Hypnosis & Meditation',
      paragraphs: he ? [
        `${brandName} כולל מערכת היפנוזה ומדיטציה מונחית בינה מלאכותית — סשנים מותאמים אישית שנוצרים בזמן אמת בהתבסס על מצב המשתמש, יעדיו, ודפוסי התודעה שלו.`,
        `הסשנים משלבים: (1) תסריטי היפנוזה מותאמים שנוצרים על ידי Aurora בהתבסס על פרופיל המשתמש, (2) המרת טקסט לדיבור (TTS) בזמן אמת ליצירת הנחיות קוליות, (3) שכבת מוזיקת רקע ותדרים בינאוראליים, (4) עבודה עם ego states ותת-מודע, (5) תרגול ויזואליזציה ואפירמציות.`,
        `כל סשן מתגמל 10 MOS ומשפיע על ציון עמוד התודעה (Consciousness Pillar). ההיפנוזה משולבת בליבת ה-AI — Aurora משתמשת בהיסטוריית סשנים קודמים כדי להתאים את התוכן, ומשלבת תובנות מעמודי חיים אחרים לתוך חווית הסשן. התסריטים נוצרים דינמית ומותאמים למצב הרגשי הנוכחי של המשתמש.`,
      ] : [
        `${brandName} includes an AI-guided hypnosis and meditation system — personalized sessions generated in real-time based on the user's state, goals, and consciousness patterns.`,
        `Sessions combine: (1) custom hypnosis scripts generated by Aurora based on the user's profile, (2) real-time Text-to-Speech (TTS) conversion for voice guidance, (3) background music and binaural frequency layers, (4) ego state and subconscious work, (5) visualization and affirmation practice.`,
        `Each session rewards 10 MOS and affects the Consciousness Pillar score. Hypnosis is integrated into the AI core — Aurora uses previous session history to tailor content, and weaves insights from other life pillars into the session experience. Scripts are dynamically generated and adapted to the user's current emotional state.`,
      ],
    },
    {
      id: 'nft',
      number: '7',
      title: he ? 'מערכת ה-NFT — זהות דיגיטלית מתפתחת' : 'The NFT System — Evolving Digital Identity',
      paragraphs: he ? [
        `כל משתמש ב-${brandName} מחזיק ב-Orb — נכס דיגיטלי תלת-ממדי ייחודי שמייצג את הזהות, ההתקדמות, והתודעה שלו. ה-Orb נבנה באמצעות Three.js עם אפקטי Bloom, חלקיקים ומורפינג בזמן אמת — הוא אינו סטטי, אלא מתפתח בהתאם לפעולות המשתמש.`,
        `מאפייני ה-Orb: (1) צבעים — משתנים לפי עמודי חיים דומיננטיים ומחושבים מציוני העמודים, (2) מורפולוגיה — עוצמת עיוות הגיאומטריה (morph intensity) ומהירותה גדלות עם הרמה, (3) חלקיקים — מספר וצפיפות לפי streak ואנרגיה (particle count/enabled), (4) הילה — אפקט Bloom שנשלט על ידי ציון geometry detail, (5) צבעים משניים — מערך שמייצג שילובי עמודים.`,
        `ה-Orb הוא גם ה-Avatar של המשתמש במערכת, מופיע בפרופיל, בקהילה, ובעתיד ייצוא כ-NFT אמיתי על blockchain. כל Orb נשמר עם computed_from — snapshot של הנתונים שממנו חושבו הפרמטרים הוויזואליים.`,
      ] : [
        `Every ${brandName} user holds an Orb — a unique 3D digital asset representing their identity, progress, and consciousness. The Orb is built with Three.js featuring real-time Bloom effects, particles, and morphing — it is not static, but evolves based on user actions.`,
        `Orb attributes: (1) Colors — change based on dominant life pillars, computed from pillar scores, (2) Morphology — geometry distortion intensity (morph intensity) and speed grow with level, (3) Particles — count and density based on streak and energy (particle count/enabled), (4) Aura — Bloom effect controlled by geometry detail score, (5) Secondary colors — an array representing pillar combinations.`,
        `The Orb also serves as the user's avatar in the system, appearing in profiles, community, and in the future exportable as a real NFT on blockchain. Each Orb is saved with computed_from — a snapshot of the data from which visual parameters were computed.`,
      ],
    },
    {
      id: 'economy',
      number: '8',
      title: he ? 'כלכלה דיגיטלית — Proof of Growth' : 'Digital Economy — Proof of Growth',
      paragraphs: he ? [
        `MOS (Mind Operating System) הוא המטבע הפנימי של ${brandName}. שער קבוע: 100 MOS = $1.00. המטבע מבוסס על מנגנון Proof of Growth — מנוע כרייה (Mining Engine) שמתגמל פעילות אנושית אמיתית ומאומתת.`,
      ] : [
        `MOS (Mind Operating System) is the internal currency of ${brandName}. Fixed rate: 100 MOS = $1.00. The currency is based on a Proof of Growth mechanism — a Mining Engine that rewards verified genuine human activity.`,
      ],
      subsections: [
        {
          title: he ? '8.1 מנוע הכרייה (Mining Engine)' : '8.1 Mining Engine',
          paragraphs: he ? [
            `המנוע מתגמל אוטומטית פעילות מאומתת בתעריפים קבועים: סשני היפנוזה (10 MOS), פוסטים בקהילה (8 MOS), שיעורי למידה (5 MOS), השלמת הרגלים (3 MOS), תגובות בקהילה (3 MOS). תקרה יומית של 200 MOS עם cooldowns למניעת ניצול. כל הכרייה מתועדת ב-fm_mining_logs לביקורתיות מלאה.`,
          ] : [
            `The engine automatically rewards verified activity at fixed rates: Hypnosis Sessions (10 MOS), Community Posts (8 MOS), Learning Lessons (5 MOS), Habit Completion (3 MOS), Community Comments (3 MOS). Daily cap of 200 MOS with cooldowns to prevent exploitation. All mining is logged in fm_mining_logs for full auditability.`,
          ],
        },
        {
          title: he ? '8.2 שוק נתונים (Data Marketplace)' : '8.2 Data Marketplace',
          paragraphs: he ? [
            `מייצר הכנסה מתובנות התנהגותיות אנונימיות עם חלוקת הכנסה 80/20 (80% למשתמש). כולל pipeline אנונימיזציה מודע פרטיות (fm_data_snapshots) שדורש סף מינימלי של 10 תורמים, והסכמה גרנולרית (fm_data_consent) של המשתמש. הכנסות מחולקות אוטומטית לתורמים בעת רכישה.`,
          ] : [
            `Monetizes anonymized behavioral insights with an 80/20 revenue split (80% to user). Includes a privacy-aware anonymization pipeline (fm_data_snapshots) requiring a minimum 10-contributor threshold, and granular user consent (fm_data_consent). Revenue is automatically distributed to contributors upon purchase.`,
          ],
        },
        {
          title: he ? '8.3 ארנק ויישוב' : '8.3 Wallet & Settlement',
          paragraphs: he ? [
            `ארנק פנימי (fm_wallets) עם ספר חשבונות (fm_transactions). יישוב אסינכרוני לערוצי תשלום חיצוניים (Stripe לפיאט או Solana לטוקנים MOS) דרך fm_settlement_outbox. חשיפה פרוגרסיבית: "מצב פשוט" (נקודות/בנק) ו"מצב מתקדם" (כתובות Solana).`,
          ] : [
            `Internal wallet (fm_wallets) with ledger (fm_transactions). Asynchronous settlement to external payment rails (Stripe for fiat or Solana for MOS tokens) via fm_settlement_outbox. Progressive disclosure: "Simple Mode" (points/bank terminology) and "Advanced Mode" (Solana addresses).`,
          ],
        },
      ],
    },
    {
      id: 'freemarket',
      number: '9',
      title: he ? 'FreeMarket — שוק פנימי' : 'FreeMarket — Internal Marketplace',
      paragraphs: he ? [
        `FreeMarket הוא השוק הפנימי של ${brandName} — מקום בו משתמשים יכולים להרוויח MOS על ידי מכירת שירותים, ביצוע בונטי (משימות קהילתיות), וגיגים. השוק כולל שלושה טאבים: Earn (הרוויח), Work (עבודה), ו-Partners (שותפים).`,
        `Earn כולל: בונטי (Bounties) — משימות עם תגמול MOS, גיגים (Gigs) — הצעות עבודה זמניות. Work כולל: ניהול שירותים, הזמנות, ולוח בקרה לנותני שירות. Partners כולל: תוכנית שותפים (Affiliate) עם עמלות על הפניות, קודי הפניה ייחודיים, ודשבורד מעקב אחרי רפרלים ותשלומים.`,
        `כולל דשבורד "Proof of Growth Mining" שמציג סטטיסטיקות כרייה בזמן אמת: MOS שנכרו היום, סך הכרייה, תקרה יומית, וחלון cooldown.`,
      ] : [
        `FreeMarket is the internal marketplace of ${brandName} — where users can earn MOS by selling services, completing bounties (community tasks), and gigs. The marketplace includes three tabs: Earn, Work, and Partners.`,
        `Earn includes: Bounties — tasks with MOS rewards, Gigs — temporary work offers. Work includes: service management, bookings, and a dashboard for service providers. Partners includes: affiliate program with referral commissions, unique referral codes, and a tracking dashboard for referrals and payouts.`,
        `Includes a "Proof of Growth Mining" dashboard showing real-time mining statistics: MOS mined today, total mined, daily cap, and cooldown window.`,
      ],
    },
    {
      id: 'coaches',
      number: '10',
      title: he ? 'פלטפורמת מאמנים' : 'Coach Platform',
      paragraphs: he ? [
        `${brandName} כולל פלטפורמת מאמנים מלאה — מאמנים יכולים להירשם, להגדיר שירותים, לקבל הזמנות, לנהל לקוחות, וליצור דפי נחיתה. כולל מנוי מאמנים עם רמות (Starter, Pro, Enterprise).`,
        `המאמנים מקבלים כלי AI: יצירת תוכניות ללקוחות, ניתוח התקדמות, ובניית דפי נחיתה אוטומטיים. כל מאמן מקבל עמוד פרופיל ציבורי עם ביקורות, שירותים, וכפתור הזמנה.`,
      ] : [
        `${brandName} includes a full coach platform — coaches can register, define services, receive bookings, manage clients, and create landing pages. Includes coach subscriptions with tiers (Starter, Pro, Enterprise).`,
        `Coaches receive AI tools: client plan generation, progress analysis, and automatic landing page building. Each coach gets a public profile page with reviews, services, and a booking button.`,
      ],
    },
    {
      id: 'gamification',
      number: '11',
      title: he ? 'גיימיפיקציה עמוקה' : 'Deep Gamification',
      paragraphs: he ? [
        `${brandName} משתמש בגיימיפיקציה כמנוע מוטיבציה מרכזי: XP (ניקוד ניסיון), רמות (1-100+), Streaks (רצפים יומיים), Tokens (MOS), Badges, ולוחות מובילים.`,
        `כל פעולה במערכת מתגמלת XP ו-MOS: משימות, הרגלים, היפנוזה, למידה, פעילות קהילתית, ומכירות ב-FreeMarket. ה-Streak מעודד עקביות יומית ומכפיל תגמולים.`,
      ] : [
        `${brandName} uses gamification as a core motivation engine: XP (experience points), Levels (1-100+), Streaks (daily chains), Tokens (MOS), Badges, and Leaderboards.`,
        `Every action in the system rewards XP and MOS: tasks, habits, hypnosis, learning, community activity, and FreeMarket sales. The Streak encourages daily consistency and multiplies rewards.`,
      ],
      subsections: [
        {
          title: he ? '11.1 מערכת מיומנויות (Skill Tree)' : '11.1 Skill Tree System',
          paragraphs: he ? [
            `מערכת ה-Skills מאפשרת למשתמשים לצבור ניסיון בתחומים ספציפיים. כל פעולה מחולקת למשקלים (action_skill_weights) שמשפיעים על מיומנויות רלוונטיות. משקלים מחושבים לפי סוג פעולה (mapping_type), מפתח מיפוי (mapping_key), ועמוד חיים (pillar). זה מאפשר מעקב גרנולרי אחרי התפתחות מיומנויות חוצות-תחומים.`,
          ] : [
            `The Skills system allows users to gain experience in specific domains. Each action is weighted (action_skill_weights) to affect relevant skills. Weights are calculated by action type (mapping_type), mapping key (mapping_key), and life pillar. This enables granular tracking of cross-domain skill development.`,
          ],
        },
      ],
    },
    {
      id: 'subscription',
      number: '12',
      title: he ? 'מודל מנויים — "עומק הכוח"' : 'Subscription Model — "Depth of Power"',
      paragraphs: he ? [
        `${brandName} מציע שלוש רמות מנוי בהיררכיית "עומק הכוח":`,
        `Awakening (חינמי — $0): מבנה בסיסי, XP ורמות, 5 הודעות Aurora ביום, בחירת עד 2 עמודי חיים, וגישה מלאה ל-Tactics Hub לעידוד מומנטום יומי.`,
        `Optimization (Plus — $69/חודש): Aurora ללא הגבלת זיכרון, 6 עמודי חיים, מערכת טרנספורמציה של 100 יום (100-Day Transformation OS), והיפנוזה AI.`,
        `Command (Apex — $199/חודש): כל 14 עמודי החיים, מנוע פרואקטיבי "Jarvis", ועדכוני תוכנית מודולריים — השלמת הערכות מזריקה אסטרטגיות לתוכנית הפעילה ללא יצירה מחדש.`,
      ] : [
        `${brandName} offers three subscription tiers in a "Depth of Power" hierarchy:`,
        `Awakening (Free — $0): Basic structure, XP/leveling, 5 daily Aurora messages, selection of up to 2 pillars, and full access to the Tactics Hub for daily momentum.`,
        `Optimization (Plus — $69/mo): Unlimited Aurora memory, 6 pillars, the 100-Day Transformation OS, and AI Hypnosis.`,
        `Command (Apex — $199/mo): All 14 pillars, the proactive "Jarvis" engine, and modular plan updates — completing assessments injects strategies into the active plan without full regeneration.`,
      ],
    },
    {
      id: 'data-privacy',
      number: '13',
      title: he ? 'פרטיות ואבטחת מידע' : 'Data Privacy & Security',
      paragraphs: he ? [
        `${brandName} מחויב לפרטיות המשתמשים. כל הנתונים מוצפנים, מאוחסנים בתשתית ענן מאובטחת, ונגישים רק למשתמש עצמו דרך Row-Level Security (RLS). המערכת לא מוכרת נתונים לצדדים שלישיים.`,
        `נתוני AI משמשים אך ורק לשיפור חווית המשתמש. המשתמש יכול למחוק את כל הנתונים שלו בכל עת. שוק הנתונים מבוסס על הסכמה גרנולרית ואנונימיזציה מלאה עם סף 10 תורמים.`,
      ] : [
        `${brandName} is committed to user privacy. All data is encrypted, stored in secure cloud infrastructure, and accessible only to the user through Row-Level Security (RLS). The system does not sell data to third parties.`,
        `AI data is used solely to improve user experience. Users can delete all their data at any time. The data marketplace is based on granular consent and full anonymization with a 10-contributor threshold.`,
      ],
    },
    {
      id: 'tech-stack',
      number: '14',
      title: he ? 'סטאק טכנולוגי וארכיטקטורה' : 'Technology Stack & Architecture',
      paragraphs: he ? [
        `Frontend: React + TypeScript + Tailwind CSS + Framer Motion + Three.js (Orb rendering). Backend: PostgreSQL, Auth, Edge Functions, Storage, Realtime. AI: Gemini 2.5 Pro/Flash, GPT-5, מודלים מולטימודליים עם עיבוד חזותי.`,
        `תשתית: Vite כ-build tool עם תמיכת PWA מלאה (vite-plugin-pwa) לחוויית מובייל native-like עם offline support, התקנה למסך הבית, ו-service worker. הפלטפורמה responsive לחלוטין עם תמיכה מלאה ב-RTL (עברית), ניהול מצב עם Zustand, ו-data fetching עם TanStack React Query.`,
        `ארכיטקטורת Mobile-First: כל ה-UI מתוכנן קודם כל למובייל עם breakpoints אדפטיביים. ה-Aurora Dock, ניווט תחתון, ותמיכת swipe (react-swipeable) מבטיחים חוויה חלקה במכשירים ניידים.`,
      ] : [
        `Frontend: React + TypeScript + Tailwind CSS + Framer Motion + Three.js (Orb rendering). Backend: PostgreSQL, Auth, Edge Functions, Storage, Realtime. AI: Gemini 2.5 Pro/Flash, GPT-5, multimodal models with vision processing.`,
        `Infrastructure: Vite as build tool with full PWA support (vite-plugin-pwa) for native-like mobile experience with offline support, home screen installation, and service worker. The platform is fully responsive with complete RTL (Hebrew) support, state management with Zustand, and data fetching with TanStack React Query.`,
        `Mobile-First Architecture: All UI is designed mobile-first with adaptive breakpoints. The Aurora Dock, bottom navigation, and swipe support (react-swipeable) ensure a smooth experience on mobile devices.`,
      ],
    },
    {
      id: 'roadmap',
      number: '15',
      title: he ? 'מפת דרכים' : 'Roadmap',
      paragraphs: he ? [
        `Q1 2026: השקת Beta ציבורי, 5 Hubs פעילים, מנוע כרייה MOS, היפנוזה AI, תוכנית 100 ימים. Q2 2026: פלטפורמת מאמנים, FreeMarket עם שוק נתונים, תוכנית שותפים, API פתוח. Q3 2026: NFT Orb export ל-blockchain, אפליקציית מובייל native, integrations עם כלים חיצוניים. Q4 2026: שותפויות B2B, הרחבה גלובלית, שפות נוספות.`,
        `2027: Blockchain integration, DAO governance, מטבע MOS על רשת Solana, שוק NFT חיצוני, יישוב Stripe לפיאט.`,
      ] : [
        `Q1 2026: Public Beta launch, 5 active Hubs, MOS Mining Engine, AI Hypnosis, 100-Day Plan. Q2 2026: Coach platform, FreeMarket with Data Marketplace, affiliate program, open API. Q3 2026: NFT Orb export to blockchain, native mobile app, external integrations. Q4 2026: B2B partnerships, global expansion, additional languages.`,
        `2027: Blockchain integration, DAO governance, MOS token on Solana network, external NFT marketplace, Stripe fiat settlement.`,
      ],
    },
    {
      id: 'team',
      number: '16',
      title: he ? 'צוות' : 'Team',
      paragraphs: he ? [
        `מייסד ומנכ"ל: ${founderName} — ${he ? theme.founder_title : theme.founder_title_en}`,
        `פיתוח AI: ${brandName} נבנה בשיתוף עם Lovable AI — פלטפורמת פיתוח מבוססת בינה מלאכותית שמאפשרת יצירת מוצרים מורכבים במהירות חסרת תקדים.`,
        `ישות משפטית: ${theme.company_legal_name}, ${theme.company_country}.`,
      ] : [
        `Founder & CEO: ${founderName} — ${theme.founder_title_en}`,
        `AI & Development: ${brandName} is built in collaboration with Lovable AI — an AI-powered development platform enabling creation of complex products at unprecedented speed.`,
        `Legal entity: ${theme.company_legal_name}, ${theme.company_country}.`,
      ],
    },
    {
      id: 'conclusion',
      number: '17',
      title: he ? 'סיכום' : 'Conclusion',
      paragraphs: he ? [
        `${brandName} אינו עוד מוצר בשוק רווי. הוא קטגוריה חדשה — Human Operating System — שמאחדת AI תודעתי, כלכלה דיגיטלית מבוססת Proof of Growth, וזהות NFT דינמית לתוך חוויה אחת שעוטפת את חיי המשתמש.`,
        `הפלטפורמה מציעה: מנוע AI שמכיר אותך לעומק, תוכנית 100 ימים עם מתודולוגיית Why-How-Now, היפנוזה ומדיטציה מונחית עם TTS בזמן אמת, מערכת למידה אדפטיבית עם Lazy Generation, שוק פנימי עם כלכלת כרייה אמיתית, פלטפורמת מאמנים מלאה, קהילה פעילה עם Aurora AI, ותוכנית שותפים. הכל מחובר, הכל גיימיפי, הכל בשירות הצמיחה האישית.`,
        `בעולם שבו אנשים מוצפים, מנותקים, ומחפשים כיוון — ${brandName} הוא מערכת ההפעלה שתנהל את ההכל. לא רק פרודוקטיביות. לא רק מיינדפולנס. את החיים עצמם.`,
      ] : [
        `${brandName} is not just another product in a saturated market. It is a new category — Human Operating System — that unifies consciousness AI, a Proof of Growth digital economy, and dynamic NFT identity into a single experience that wraps around the user's life.`,
        `The platform offers: an AI engine that deeply knows you, a 100-day plan with the Why-How-Now methodology, guided hypnosis with real-time TTS, an adaptive learning system with Lazy Generation, an internal marketplace with real mining economy, a full coach platform, an active community with Aurora AI, and an affiliate program. Everything connected, everything gamified, everything in service of personal growth.`,
        `In a world where people are overwhelmed, disconnected, and searching for direction — ${brandName} is the operating system that will manage everything. Not just productivity. Not just mindfulness. Life itself.`,
      ],
    },
  ];

  const tocItems = sections.map(s => ({ id: s.id, number: s.number, title: s.title }));

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="flex items-center h-14 px-4 gap-3">
          {/* Left: Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground lg:hidden"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <AuroraOrbIcon className="w-7 h-7 text-foreground" size={28} />
          <span className="font-bold text-foreground text-sm">{brandName}</span>
          <span className="text-muted-foreground text-sm hidden sm:inline">—</span>
          <span className="text-muted-foreground text-sm hidden sm:inline">{he ? 'ספר לבן' : 'White Paper'}</span>

          <div className="flex-1" />

          {/* Right: Back arrow */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <span className="text-xs hidden sm:inline">{he ? 'חזור' : 'Back'}</span>
            <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop always visible, mobile toggle */}
        <aside
          className={cn(
            "fixed lg:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-72 border-e border-border bg-background shrink-0 transition-transform duration-200",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            isRTL && !sidebarOpen && "translate-x-full lg:translate-x-0",
            isRTL && sidebarOpen && "translate-x-0"
          )}
        >
          <ScrollArea className="h-full">
            <div className="p-4 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {he ? 'תוכן עניינים' : 'Table of Contents'}
              </p>
              {tocItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center gap-2 w-full text-start text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-2.5 py-1.5 transition-colors"
                >
                  <span className="font-mono text-xs text-primary/60 w-5 shrink-0">{item.number}.</span>
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-8">
            {/* Title Page */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-5 pb-10 border-b border-border"
            >
              <div className="flex justify-center">
                <AuroraOrbIcon className="w-24 h-24 text-primary" size={96} />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                {brandName}
              </h1>
              <p className="text-xl md:text-2xl font-semibold text-primary">
                {he ? 'מערכת הפעלה אנושית' : 'Human Operating System'}
              </p>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                {he
                  ? 'ספר לבן — AI · NFT · Play-to-Earn · גיימיפיקציה · היפנוזה · למידה · שוק פנימי · פיתוח אישי'
                  : 'White Paper — AI · NFT · Play-to-Earn · Gamification · Hypnosis · Learning · Marketplace · Personal Development'
                }
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{he ? `מאת ${founderName}` : `By ${founderName}`}</p>
                <p>{theme.company_legal_name} · {theme.company_country}</p>
                <p>{he ? 'גרסה 3.0 · מרץ 2026' : 'Version 3.0 · March 2026'}</p>
              </div>
            </motion.div>

            {/* Abstract */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3"
            >
              <h2 className="text-lg font-bold text-foreground">{he ? 'תקציר מנהלים' : 'Abstract'}</h2>
              <p dir={isRTL ? 'rtl' : 'ltr'} className="text-muted-foreground leading-relaxed text-sm">{abstractText}</p>
            </motion.div>

            {/* Sections */}
            {sections.map((section, i) => (
              <motion.section
                key={section.id}
                id={section.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                className="space-y-4 scroll-mt-20"
              >
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  <span className="text-primary/60 font-mono me-2">{section.number}.</span>
                  {section.title}
                </h2>

                {/* Special visual roadmap for section 15 */}
                {section.id === 'roadmap' ? (
                  <Web3Roadmap isHe={he} />
                ) : (
                  <>
                    {section.paragraphs.map((p, j) => (
                      <p key={j} dir={isRTL ? 'rtl' : 'ltr'} className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                        {p}
                      </p>
                    ))}
                  </>
                )}

                {section.subsections?.map((sub, k) => (
                  <div key={k} className="ms-4 border-s-2 border-primary/20 ps-4 space-y-2 pt-2">
                    <h3 className="text-base font-semibold text-foreground">{sub.title}</h3>
                    {sub.paragraphs.map((p, j) => (
                      <p key={j} dir={isRTL ? 'rtl' : 'ltr'} className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{p}</p>
                    ))}
                  </div>
                ))}
              </motion.section>
            ))}

            {/* Disclaimer */}
            <div className="text-center pt-10 pb-24 border-t border-border space-y-3">
              <p dir={isRTL ? 'rtl' : 'ltr'} className="text-xs text-muted-foreground/80 max-w-xl mx-auto">
                {he
                  ? `מסמך זה מוגש למטרות מידע בלבד ואינו מהווה הצעה למכירת ניירות ערך או הזמנה לרכישה. MOS tokens אינם מייצגים בעלות, דיבידנדים, או זכויות הצבעה. ביצועי העבר אינם מעידים על ביצועים עתידיים.`
                  : `This document is provided for informational purposes only and does not constitute an offer to sell securities or a solicitation to purchase. MOS tokens do not represent ownership, dividends, or voting rights. Past performance does not indicate future results.`
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {he ? `© ${new Date().getFullYear()} ${theme.company_legal_name}. כל הזכויות שמורות.` : `© ${new Date().getFullYear()} ${theme.company_legal_name}. All rights reserved.`}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
