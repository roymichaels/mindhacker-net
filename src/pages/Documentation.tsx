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
    ? `${brandName} הוא מערכת הפעלה אישית מבוססת בינה מלאכותית, המשלבת מנגנוני Play-to-Earn (P2E), נכסים דיגיטליים ייחודיים (NFTs), גיימיפיקציה עמוקה, היפנוזה ומדיטציה מונחית AI (כולל סשנים אישיים מותאמים), מערכת למידה אדפטיבית, שוק פנימי (FreeMarket) עם 5 מסלולי קריירה מאוחדים (בעל עסק, מאמן, מטפל, יוצר תוכן, פרילנסר), התאמת מאמנים מבוססת AI, פלטפורמת מאמנים עם דפי נחיתה דינמיים וחנויות אישיות (/p/:slug), הערכות עמודים מבוססות שיחת AI, מנגנון Plan Chat Wizard, תוכנית Consciousness Leap, בלוג Aurora Codex, מערכת אונבורדינג עם טקס כניסה (Ceremony), מערכת PWA מלאה עם התקנה למסך הבית, מערכת Admin Hub לניהול הפלטפורמה, מנגנון דיווח באגים, תוכנית שותפים (Affiliates), ו-Aurora עם מודעות הקשרית מלאה (אסטרטגיות, טקטיקות, לוח זמנים, ציוני עמודים, זמן נוכחי) — לתוך מערכת הפעלה אחת שעוטפת את חיי המשתמש. המסמך מציג את הארכיטקטורה, הכלכלה הדיגיטלית, מערכת ה-AI התודעתית (Aurora), מודל המנויים, ומפת הדרכים של הפרויקט. המטבע הפנימי MOS (100 MOS = $1.00) מבוסס על מנגנון Proof of Growth — מודל כריית נתונים שמתגמל פעילות אנושית אמיתית.`
    : `${brandName} is an AI-powered Personal Operating System that integrates Play-to-Earn (P2E) mechanics, unique digital assets (NFTs), deep gamification, AI-guided hypnosis and meditation (including custom personal sessions), an adaptive learning system, an internal marketplace (FreeMarket) with 5 unified career paths (Business Owner, Coach, Therapist, Content Creator, Freelancer), AI-powered coach matching, a coach platform with dynamic landing pages and personal storefronts (/p/:slug), chat-based pillar assessments, Plan Chat Wizard, Consciousness Leap program, Aurora Codex blog, an onboarding system with initiation Ceremony, full PWA support with home screen installation, Admin Hub for platform management, bug reporting system, Affiliate program, and Aurora with full contextual awareness (strategies, tactics, schedules, pillar scores, current time) — into a single operating system that wraps around the user's life. This paper presents the architecture, digital economy, consciousness AI engine (Aurora), subscription model, and roadmap. The internal currency MOS (100 MOS = $1.00) is based on a Proof of Growth mechanism — a data mining model that rewards genuine human activity.`;

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
      title: he ? 'הפתרון — שישה Hubs' : 'The Solution — Six Hubs',
      paragraphs: he ? [
        `${brandName} הוא Human Operating System — מערכת הפעלה אנושית שמאחדת את כל ממדי החיים תחת קורת גג אחת. הפלטפורמה בנויה מששה Hubs בסדר עדיפות ביצועי:`,
      ] : [
        `${brandName} is a Human Operating System that unifies all life dimensions under one roof. The platform is built from six Hubs in execution-priority order:`,
      ],
      subsections: [
        {
          title: he ? '4.1 Now Hub — מרכז הביצוע' : '4.1 Now Hub — Execution Center',
          paragraphs: he ? [
            `Now הוא דף הנחיתה ומרכז הביצוע של ${brandName}. הדשבורד מציג את פעולות היום מחולקות ל-4 רבעוני יום (בוקר, צהריים, אחר הצהריים, ערב) — כל רבע מקבל שם הרפתקני ייחודי שמתחדש כל יום ("Dawn Forge", "Summit Push", "Iron Hour" וכו').`,
            `ה-Movement Score מודד מומנטום בזמן אמת — אחוז ההשלמה היומי שמניע את האורב. כולל: סטטוס אנרגיה, streak יומי, XP, טוקנים, ומערכת Quest — כל יום הוא משימה (Quest) עם שם ייחודי, ושבוע שלם מרכיב קמפיין.`,
            `מערכת Quest Runner (/quests/:pillar) מאפשרת ניווט ל-Quest ייעודי לפי עמוד חיים — כל Quest מרנדר flow אינטראקטיבי מותאם עם שאלות, תובנות, ופעולות שנשמרות בחזרה לתוכנית.`,
            `כשלמשתמש אין תוכנית פעילה, Now מפנה אוטומטית ל-Strategy Hub ליצירת תוכנית 100 ימים.`,
          ] : [
            `Now is the landing page and execution center of ${brandName}. The dashboard displays today's actions divided into 4 day quarters (morning, midday, afternoon, evening) — each quarter receives a unique adventure name that refreshes daily ("Dawn Forge", "Summit Push", "Iron Hour", etc.).`,
            `The Movement Score measures real-time momentum — the daily completion percentage that drives the orb. Includes: energy status, daily streak, XP, tokens, and a Quest system — each day is a Quest with a unique name, and an entire week forms a Campaign.`,
            `The Quest Runner system (/quests/:pillar) enables navigating to a dedicated Quest per life pillar — each Quest renders a custom interactive flow with questions, insights, and actions that sync back to the plan.`,
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
            `14 עמודי החיים מחולקים ל-6 עמודי Life (נוכחות, כוח, חיוניות, פוקוס, לחימה, התרחבות) ו-6 עמודי Arena (עסקים, עושר, השפעה, מערכות יחסים, פרויקטים, משחק) + תודעה ואומנות. כל עמוד כולל הערכה מבוססת שיחת AI (Chat-Based Assessment) עם דף תוצאות מותאם.`,
            `Plan Chat Wizard ("דבר עם התוכנית"): כפתור קבוע ב-Strategy Hub שמאפשר למשתמש לנהל משא ומתן עם Aurora על התוכנית — לשנות סדרי עדיפויות, להזיז אבני דרך, לבקש התאמות, או לחולל תוכנית מחדש. כולל מנגנון "Negotiate" לעדכון חכם של התוכנית.`,
            `התאמת מאמן מבוססת AI: בתוך ה-Strategy Hub, המשתמש יכול לבקש מ-Aurora למצוא מאמן שיעזור לו להוציא את האסטרטגיה לפועל. Aurora מנהלת שיחת זיהוי צרכים (תחום, אתגרים, העדפות) וממליצה על מאמנים מתאימים מתוך הפלטפורמה — מחברת בין משתמשים למאמנים בצורה אורגנית.`,
          ] : [
            `Strategy shows the "Why" and manages the full strategic pipeline. The process: (1) select life pillars (2-14 based on subscription tier) via StrategyPillarWizard, (2) AI deep scan for each pillar scoring 0-100, (3) generate a 100-day plan divided into 10 phases with milestones and daily actions.`,
            `Includes: character Traits, life Missions, Goals, and a "Recalibrate" system for strategy updates. On the Apex tier, completing an assessment injects new strategies into the active plan without full regeneration.`,
            `The 14 Life Pillars are split into 6 Life pillars (Presence, Power, Vitality, Focus, Combat, Expansion) and 6 Arena pillars (Business, Wealth, Influence, Relationships, Projects, Play) + Consciousness and Craft. Each pillar includes a Chat-Based Assessment with a personalized results page.`,
            `Plan Chat Wizard ("Talk to Your Plan"): A persistent button in the Strategy Hub that lets users negotiate with Aurora about their plan — reprioritize, shift milestones, request adaptations, or regenerate the plan. Includes a "Negotiate" mechanism for smart plan updates.`,
            `AI Coach Matching: Within the Strategy Hub, users can ask Aurora to find a coach to help execute their strategy. Aurora conducts a needs-discovery conversation (domain, challenges, preferences) and recommends matching coaches from the platform — organically connecting users with practitioners.`,
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
        {
          title: he ? '4.6 FreeMarket Hub — שוק חופשי וקריירה' : '4.6 FreeMarket Hub — Marketplace & Career',
          paragraphs: he ? [
            `FreeMarket הוא ה-Hub השישי — מרכז הכלכלה, הקריירה, והמסחר של ${brandName}. בנוי משלושה טאבים: Earn (הרוויח), Career (קריירה), ו-Wallet (ארנק). ה-Earn Launchpad מנחה משתמשים חדשים דרך תהליך אונבורדינג כלכלי ומוצג מעל הטאבים כ-banner מתמיד.`,
            `ב-Career Hub, המשתמש בוחר מסלול קריירה מתוך 5 מסלולים מאוחדים בסגנון כרטיסי רריטי (Legendary, Epic, Heroic, Rare, Uncommon): בעל עסק, מאמן, מטפל, יוצר תוכן, פרילנסר. כל מסלול כולל ויזארד AI שמנחה את תהליך ההקמה (גם לעסקים חדשים וגם קיימים), עם אפשרות מחיקה לעסקים שלא התקדמו מעבר ל-1%.`,
            `כל מסלול קריירה מנותב ל-CareerHub מאוחד — דשבורד ניהול מלא עם טאבים: סקירה, לקוחות, לידים, מוצרים/שירותים, תוכן, שיווק, אנליטיקס, והגדרות. הפיצ'רים משותפים לכל המסלולים עם התאמות ויזואליות וטרמינולוגיות לפי הפרופסיה.`,
            `ה-Wallet מנהל את יתרת ה-MOS עם ספר חשבונות מלא (fm_transactions), היסטוריית עסקאות, cashout ל-Stripe או Solana, ו-bridge בין מטבעות.`,
          ] : [
            `FreeMarket is the sixth Hub — the economy, career, and commerce center of ${brandName}. Built with three tabs: Earn, Career, and Wallet. The Earn Launchpad guides new users through an economic onboarding process, displayed as a persistent banner above the tabs.`,
            `In the Career Hub, users choose from 5 unified career paths displayed as rarity-themed cards (Legendary, Epic, Heroic, Rare, Uncommon): Business Owner, Coach, Therapist, Content Creator, Freelancer. Each path includes an AI-guided setup wizard (supporting both new and existing businesses), with delete capability for entries that haven't progressed past 1%.`,
            `Every career path routes to a unified CareerHub — a full management dashboard with tabs: Overview, Clients, Leads, Products/Services, Content, Marketing, Analytics, and Settings. Features are shared across all paths with visual and terminology adaptations per profession.`,
            `The Wallet manages MOS balance with a full ledger (fm_transactions), transaction history, cashout to Stripe or Solana, and a cross-currency bridge.`,
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
          title: he ? '5.1 מודעות הקשרית מלאה (Context Pipeline)' : '5.1 Full Contextual Awareness (Context Pipeline)',
          paragraphs: he ? [
            `Aurora בנויה על Context Pipeline מתקדם שאוסף אוטומטית את כל המידע הרלוונטי לפני כל שיחה. ה-Pipeline מזריק לכל תגובה: (1) פרופיל מלא — שם, שפה, אזור זמן, רמת מנוי, ארכיטיפ, (2) תוכניות אסטרטגיות פעילות — כל הפילרים, התקדמות באחוזים, שלב נוכחי, (3) משימות (Missions) — כותרות, עמודים, סטטוס השלמה, (4) לוח זמנים טקטי ליום הנוכחי — כל בלוקי הפעולה מחולקים לרבעוני יום, (5) ציוני הערכה מ-14 עמודי החיים — ציון כולל לכל דומיין, (6) רמת מנוי — Free/Plus/Apex.`,
            `Aurora מודעת לזמן: היא יודעת את השעה, היום, ואת לוח הזמנים הספציפי של המשתמש להיום. זה מאפשר לה לתת המלצות מדויקות ("יש לך בלוק אימון בעוד שעה", "סיימת 60% מהמשימות של היום").`,
            `כל ה-Context Pipeline רץ בצד השרת (Edge Function) ומאחד נתונים מ-7+ טבלאות בו-זמנית באמצעות Promise.all. התוצאה: Aurora שמכירה את המשתמש לעומק — לא רק מה שהוא אומר, אלא מה שהוא עושה, מתכנן, ומרגיש.`,
          ] : [
            `Aurora is built on an advanced Context Pipeline that automatically gathers all relevant information before every conversation. The pipeline injects into each response: (1) Full profile — name, language, timezone, subscription tier, archetype, (2) Active strategic plans — all pillars, percentage progress, current phase, (3) Missions — titles, pillars, completion status, (4) Today's tactical schedule — all action blocks divided into day quarters, (5) Assessment scores from all 14 life pillars — overall score per domain, (6) Subscription tier — Free/Plus/Apex.`,
            `Aurora is time-aware: it knows the current time, day, and the user's specific schedule for today. This enables precise recommendations ("you have a training block in an hour", "you've completed 60% of today's tasks").`,
            `The entire Context Pipeline runs server-side (Edge Function) and unifies data from 7+ tables simultaneously using Promise.all. The result: Aurora that deeply knows the user — not just what they say, but what they do, plan, and feel.`,
          ],
        },
        {
          title: he ? '5.2 זיכרון שיחות וגרף זיכרון' : '5.2 Conversation Memory & Memory Graph',
          paragraphs: he ? [
            `Aurora שומרת זיכרון שיחות מלא — כולל סיכומי שיחה, נושאים מרכזיים, מצב רגשי, ופעולות שהוסכמו. הזיכרון מזורק לכל שיחה חדשה כקונטקסט, מה שמאפשר המשכיות אמיתית לאורך זמן. הזיכרון מודע לציר הזמן — אירועים אחרונים ושינויי זהות מקבלים עדיפות.`,
            `Memory Graph: מערכת זיכרון גרף שמקשרת בין צמתי מידע (nodes) — עובדות, דפוסים, זהויות, העדפות — עם חוזק חיבור (strength), ספירת הפניות (reference_count), ומודעות עמודים (pillar). זה מאפשר ל-Aurora "לזכור" תובנות חוצות-שיחות ולחבר נקודות בין נושאים שונים.`,
          ] : [
            `Aurora maintains full conversation memory — including conversation summaries, key topics, emotional state, and agreed-upon actions. Memory is injected into every new conversation as context, enabling true continuity over time. Memory is timeline-aware — recent events and identity shifts are prioritized.`,
            `Memory Graph: A graph memory system connecting information nodes — facts, patterns, identities, preferences — with connection strength, reference counts, and pillar awareness. This enables Aurora to "remember" cross-conversation insights and connect dots between different topics.`,
          ],
        },
        {
          title: he ? '5.3 מערכת פרואקטיבית' : '5.3 Proactive System',
          paragraphs: he ? [
            `Aurora לא מחכה שתדבר אליה — היא פועלת פרואקטיבית. מערכת ה-Proactive Queue מזהה טריגרים (streak שנשבר, ירידה באנרגיה, משימה שנדחתה) ומייצרת דחיפות חכמות עם עדיפויות. כולל push notifications, תזכורות מתוזמנות, ומנגנון idempotency למניעת כפילויות.`,
          ] : [
            `Aurora doesn't wait for you to talk — it acts proactively. The Proactive Queue system detects triggers (broken streak, energy drop, postponed task) and generates smart nudges with priorities. Includes push notifications, scheduled reminders, and an idempotency mechanism to prevent duplicates.`,
          ],
        },
        {
          title: he ? '5.4 דפוסים התנהגותיים ואנרגטיים' : '5.4 Behavioral & Energy Patterns',
          paragraphs: he ? [
            `Aurora מנתחת דפוסי התנהגות ואנרגיה לאורך זמן — מזהה מתי המשתמש הכי פרודוקטיבי, מתי צריך מנוחה, ואילו פעילויות משפיעות על מצב הרוח. המידע משפיע על תזמון משימות, המלצות, ותוכן מותאם.`,
          ] : [
            `Aurora analyzes behavioral and energy patterns over time — identifying when the user is most productive, when rest is needed, and which activities affect mood. This data influences task timing, recommendations, and personalized content.`,
          ],
        },
        {
          title: he ? '5.5 Aurora Dock — ממשק פעולות מהירות' : '5.5 Aurora Dock — Quick Action Interface',
          paragraphs: he ? [
            `ה-Aurora Dock הוא ממשק צף שנגיש מכל מקום במערכת — כפתור FAB (Floating Action Button) שפותח מגש פעולות מהירות. דרכו המשתמש יכול: לפתוח שיחה עם Aurora, להתחיל סשן היפנוזה, לבנות קוריקולום, לסרוק עמוד חיים, ולהציץ במשימות היום. ה-Dock מזהה קונטקסט ומציע פעולות רלוונטיות לפי הדף הנוכחי.`,
          ] : [
            `The Aurora Dock is a floating interface accessible from anywhere in the system — a FAB (Floating Action Button) that opens a quick-action tray. Through it users can: start an Aurora conversation, begin a hypnosis session, build a curriculum, scan a life pillar, and peek at today's tasks. The Dock is context-aware and suggests relevant actions based on the current page.`,
          ],
        },
        {
          title: he ? '5.6 Command Bus — פעולות בתוך השיחה' : '5.6 Command Bus — In-Chat Actions',
          paragraphs: he ? [
            `Aurora תומכת ב-Command Bus — מנגנון שמאפשר לה לבצע פעולות ישירות מתוך השיחה: ניווט לדפים, יצירת משימות, עדכון סטטוס פעולות, פתיחת הערכות, והוספת פריטים ללו"ז. הפקודות מוטמעות בתגובות ה-AI ומופעלות אוטומטית בצד הלקוח.`,
          ] : [
            `Aurora supports a Command Bus — a mechanism enabling direct actions from within conversations: navigating to pages, creating tasks, updating action statuses, opening assessments, and adding items to the schedule. Commands are embedded in AI responses and executed automatically client-side.`,
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
        `היפנוזה אישית מותאמת: המשתמש יכול להזמין סשן היפנוזה אישי דרך דף נחיתה ייעודי (/personal-hypnosis). התהליך כולל: (1) תיאור המטרה האישית, (2) יצירת תסריט מותאם על ידי Aurora, (3) עמוד המתנה עם עדכון סטטוס, (4) עמוד הצלחה עם גישה לסשן המוכן. זהו מוצר פרימיום שמייצר הכנסה נוספת.`,
      ] : [
        `${brandName} includes an AI-guided hypnosis and meditation system — personalized sessions generated in real-time based on the user's state, goals, and consciousness patterns.`,
        `Sessions combine: (1) custom hypnosis scripts generated by Aurora based on the user's profile, (2) real-time Text-to-Speech (TTS) conversion for voice guidance, (3) background music and binaural frequency layers, (4) ego state and subconscious work, (5) visualization and affirmation practice.`,
        `Each session rewards 10 MOS and affects the Consciousness Pillar score. Hypnosis is integrated into the AI core — Aurora uses previous session history to tailor content, and weaves insights from other life pillars into the session experience. Scripts are dynamically generated and adapted to the user's current emotional state.`,
        `Personal Custom Hypnosis: Users can order a personalized hypnosis session through a dedicated landing page (/personal-hypnosis). The flow includes: (1) describing the personal goal, (2) Aurora generates a custom script, (3) a pending page with status updates, (4) a success page with access to the ready session. This is a premium product generating additional revenue.`,
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
          title: he ? '8.3 מנגנון Play2Earn — הרוויח מכל פעולה' : '8.3 Play2Earn — Earn From Every Action',
          paragraphs: he ? [
            `הכלכלה של ${brandName} בנויה על מנגנון Play2Earn אחוד שמתגמל כל היבט של צמיחה אישית — צמיחה, למידה, עבודה, ושיתוף נתונים. כל פעולה במערכת היא "משחק" שמייצר ערך אמיתי:`,
            `🌱 צמיחה — השלמת הרגלים, עמידה ב-streaks, סיום שלבים בתוכנית 100 הימים, וביצוע משימות יומיות. מכפילי streak (x1.5 ביום 7, x2 ביום 30) מעודדים עקביות.`,
            `📊 נתונים — המשתמשים יכולים למכור תובנות התנהגותיות אנונימיות דרך שוק הנתונים. חלוקת הכנסה 80/20 (80% למשתמש) עם הסכמה גרנולרית ופרטיות מלאה.`,
            `💼 עבודה — גיגים, באונטי קהילתיות, מכירת שירותים דרך ה-FreeMarket, וסשנים של מאמנים.`,
            `📚 למידה — כל שיעור, קוריקולום, ותרגול שהושלם מתגמל MOS. מערכת הלמידה האדפטיבית מייצרת תוכן בזמן אמת — וכל אינטראקציה נספרת כפעולת כרייה מאומתת.`,
          ] : [
            `The ${brandName} economy is built on a unified Play2Earn mechanism that rewards every aspect of personal growth — growing, learning, working, and data sharing. Every action in the system is a "game" that generates real value:`,
            `🌱 Growth — Habit completion, streak maintenance, 100-day plan phase completion, and daily task execution. Streak multipliers (x1.5 at day 7, x2 at day 30) incentivize consistency.`,
            `📊 Data — Users can sell anonymized behavioral insights through the data marketplace. 80/20 revenue split (80% to user) with granular consent and complete privacy.`,
            `💼 Work — Gigs, community bounties, service sales through FreeMarket, and coach sessions.`,
            `📚 Learning — Every completed lesson, curriculum, and exercise rewards MOS. The adaptive learning system generates content in real-time — and every interaction counts as a verified mining action.`,
          ],
        },
        {
          title: he ? '8.4 ארנק ויישוב' : '8.4 Wallet & Settlement',
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
      title: he ? 'FreeMarket — שוק פנימי וכלכלת קריירה' : 'FreeMarket — Internal Marketplace & Career Economy',
      paragraphs: he ? [
        `FreeMarket הוא מרכז הכלכלה והקריירה של ${brandName}. בנוי משלושה טאבים ראשיים: Earn (הרוויח — בונטי, גיגים, כרייה), Career (קריירה — 5 מסלולי קריירה מאוחדים), ו-Wallet (ארנק — יתרות, היסטוריה, cashout).`,
        `Earn כולל: בונטי (Bounties) — משימות קהילתיות עם תגמול MOS, גיגים (Gigs) — הצעות עבודה זמניות, ודשבורד "Proof of Growth Mining" שמציג סטטיסטיקות כרייה בזמן אמת עם תקרה יומית. ה-Earn Launchpad מוצג כ-banner מתמיד מעל הטאבים ומנחה אונבורדינג כלכלי.`,
        `Career כולל: 5 מסלולים מקצועיים בכרטיסי רריטי (בעל עסק — Legendary, מאמן — Epic, מטפל — Heroic, יוצר תוכן — Rare, פרילנסר — Uncommon). כל מסלול מנותב ל-CareerHub מאוחד עם טאבים משותפים: סקירה, לקוחות, לידים, מוצרים, תוכן, שיווק, אנליטיקס, והגדרות — עם התאמות תימטיות לפי הפרופסיה.`,
        `Wallet כולל: ארנק פנימי עם ספר חשבונות, שותפים (Affiliate) עם קודי הפניה ועמלות, cashout ו-bridge בין מטבעות.`,
      ] : [
        `FreeMarket is the economy and career center of ${brandName}. Built with three main tabs: Earn (bounties, gigs, mining), Career (5 unified career paths), and Wallet (balances, history, cashout).`,
        `Earn includes: Bounties — community tasks with MOS rewards, Gigs — temporary work offers, and a "Proof of Growth Mining" dashboard showing real-time mining statistics with daily caps. The Earn Launchpad is displayed as a persistent banner above the tabs, guiding economic onboarding.`,
        `Career includes: 5 professional paths with rarity-themed cards (Business Owner — Legendary, Coach — Epic, Therapist — Heroic, Content Creator — Rare, Freelancer — Uncommon). Each path routes to a unified CareerHub with shared tabs: Overview, Clients, Leads, Products, Content, Marketing, Analytics, and Settings — with thematic adaptations per profession.`,
        `Wallet includes: internal wallet with ledger, affiliate program with referral codes and commissions, cashout, and a cross-currency bridge.`,
      ],
    },
    {
      id: 'career-platform',
      number: '10',
      title: he ? 'פלטפורמת קריירה מאוחדת' : 'Unified Career Platform',
      paragraphs: he ? [
        `${brandName} כולל פלטפורמת קריירה מאוחדת שמשרתת 5 מסלולים מקצועיים תחת ארכיטקטורה אחת. כל מסלול כולל ויזארד AI (Aurora) שמנחה את תהליך ההקמה — לעסקים חדשים וקיימים כאחד — עם שמירת נתונים מצטברת ואפשרות מחיקה לפני התקדמות של 1%.`,
        `מסלולים: (1) בעל עסק — תכנון, השקה וצמיחה עם אסטרטגיית AI, (2) מאמן — בניית פרקטיקה עם CRM, לקוחות, לידים ודפי נחיתה, (3) מטפל — ניהול פרקטיקה טיפולית עם תורים וצמיחה, (4) יוצר תוכן — קורסים, תוכן ומוצרים דיגיטליים, (5) פרילנסר — גיגים, פרויקטים וטוקנים.`,
        `כלי AI למקצוענים: יצירת תוכניות ללקוחות, ניתוח התקדמות, בניית דפי נחיתה אוטומטיים (Dynamic Landing Pages עם slug ייחודי לכל מאמן), מערכת CRM מלאה, ניהול לידים, וניתוח אנליטי. מנוי מאמנים עם רמות (Starter $19, Growth $49, Scale $99) מאפשר גישה מדורגת לכלים.`,
        `התאמת מאמן מבוססת AI: משתמשים יכולים למצוא מאמן מתאים דרך ויזארד Aurora — גם מתוך ה-Career Hub וגם מתוך ה-Strategy Hub. Aurora מנהלת שיחת זיהוי צרכים (תחום, אתגרים, סגנון) וממליצה על מאמנים מתאימים מתוך הפלטפורמה.`,
      ] : [
        `${brandName} includes a unified career platform serving 5 professional paths under a single architecture. Each path includes an AI wizard (Aurora) guiding the setup process — for both new and existing businesses — with cumulative data persistence and delete capability before 1% progress.`,
        `Paths: (1) Business Owner — plan, launch and grow with AI strategy, (2) Coach — build a practice with CRM, clients, leads and landing pages, (3) Therapist — manage therapeutic practice with scheduling and growth, (4) Content Creator — courses, content and digital products, (5) Freelancer — gigs, projects and tokens.`,
        `AI tools for professionals: client plan generation, progress analysis, automatic landing page building (Dynamic Landing Pages with unique slug per coach), full CRM system, lead management, and analytics. Coach subscriptions with tiers (Starter $19, Growth $49, Scale $99) provide tiered access to tools.`,
        `AI Coach Matching: Users can find a matching coach through the Aurora wizard — from both the Career Hub and the Strategy Hub. Aurora conducts a needs-discovery conversation (domain, challenges, style) and recommends suitable coaches from the platform.`,
      ],
    },
    {
      id: 'consciousness-leap',
      number: '10.1',
      title: he ? 'Consciousness Leap — תוכנית טרנספורמציה פרימיום' : 'Consciousness Leap — Premium Transformation Program',
      paragraphs: he ? [
        `Consciousness Leap הוא מוצר פרימיום של ${brandName} — תוכנית טרנספורמציה אישית מעמיקה שמשלבת את כל יכולות הפלטפורמה תחת מעטפת אישית. כולל: דף נחיתה ייעודי (/consciousness-leap) עם תיאור הבעיות, תהליך 4 שלבים, יתרונות, עדויות, ו-FAQ.`,
        `תהליך ההצטרפות: (1) טופס הגשה עם שם, אימייל, טלפון, ותיאור אתגר, (2) שיחת התאמה עם Aurora, (3) בניית תוכנית מותאמת, (4) ליווי יומי עם סשנים, היפנוזה, ומעקב AI. זהו מוצר B2C premium שמייצר הכנסה חוזרת.`,
      ] : [
        `Consciousness Leap is a premium ${brandName} product — a deep personal transformation program combining all platform capabilities under a personalized wrapper. Includes: a dedicated landing page (/consciousness-leap) with pain point descriptions, a 4-step process, benefits, testimonials, and FAQ.`,
        `Application process: (1) submission form with name, email, phone, and challenge description, (2) matching conversation with Aurora, (3) building a custom plan, (4) daily support with sessions, hypnosis, and AI tracking. This is a premium B2C product generating recurring revenue.`,
      ],
    },
    {
      id: 'blog',
      number: '10.2',
      title: he ? 'Aurora Codex — בלוג ומערכת תוכן' : 'Aurora Codex — Blog & Content System',
      paragraphs: he ? [
        `Aurora Codex (/blog) הוא מערכת הבלוג והתוכן של ${brandName}. מאמרים דו-לשוניים (עברית/אנגלית) עם תמיכת SEO מלאה (meta title, description, keywords), slug ייחודי, תגיות, זמן קריאה, ותמונת כיסוי.`,
        `הבלוג נגיש מתפריט הראשי (Dropdown) הן למשתמשים מחוברים והן לאורחים — משמש כמנוע שיווק אורגני, SEO, ו-thought leadership. כל פוסט תומך בסטטוס (draft/published) עם תאריך פרסום.`,
      ] : [
        `Aurora Codex (/blog) is the blog and content system of ${brandName}. Bilingual articles (Hebrew/English) with full SEO support (meta title, description, keywords), unique slug, tags, reading time, and cover image.`,
        `The blog is accessible from the main menu dropdown for both authenticated and guest users — serving as an organic marketing engine, SEO driver, and thought leadership platform. Each post supports status (draft/published) with publication date.`,
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
      id: 'onboarding',
      number: '13.1',
      title: he ? 'אונבורדינג וטקס כניסה' : 'Onboarding & Initiation Ceremony',
      paragraphs: he ? [
        `${brandName} כולל מערכת אונבורדינג רב-שלבית שמלווה משתמשים חדשים מרגע ההרשמה ועד לביצוע הפעולה הראשונה. התהליך כולל: (1) הרשמה עם אימייל ואימות, (2) שיחת היכרות עם Aurora לזיהוי מצב, מטרות, ואתגרים, (3) בחירת עמודי חיים ראשוניים, (4) יצירת תוכנית 100 ימים ראשונה.`,
        `טקס הכניסה (Ceremony): חוויה ויזואלית אימרסיבית שמסמנת את תחילת המסע. כוללת אנימציות, מוזיקת רקע, ויצירת ה-Orb האישי הראשון. הטקס בונה מחויבות רגשית ומבדל את ${brandName} מכל אפליקציה אחרת — זו לא רק הרשמה, זו התחלה.`,
        `דף Go (/go): דף נחיתה ייעודי להפניית משתמשים חדשים שמתחיל את תהליך האונבורדינג עם חוויה מותאמת.`,
      ] : [
        `${brandName} includes a multi-step onboarding system that guides new users from registration to first action. The process includes: (1) email signup with verification, (2) introductory conversation with Aurora for state, goals, and challenge identification, (3) initial life pillar selection, (4) first 100-day plan creation.`,
        `Initiation Ceremony: An immersive visual experience marking the start of the journey. Features animations, background music, and creation of the first personal Orb. The ceremony builds emotional commitment and differentiates ${brandName} from any other app — it's not just signup, it's a beginning.`,
        `Go Page (/go): A dedicated landing page for directing new users that initiates the onboarding process with a tailored experience.`,
      ],
    },
    {
      id: 'admin-hub',
      number: '13.2',
      title: he ? 'Admin Hub — מרכז ניהול הפלטפורמה' : 'Admin Hub — Platform Management Center',
      paragraphs: he ? [
        `Admin Hub (/admin-hub) הוא מרכז הניהול של ${brandName} — נגיש רק למשתמשים עם תפקיד admin (מנוהל דרך טבלת user_roles עם RLS). כולל: דשבורד סטטיסטיקות עם כמויות משתמשים, מנויים, הכנסות, ופעילות יומית.`,
        `מודולי ניהול: (1) ניהול משתמשים — חיפוש, צפייה, ועדכון פרופילים, (2) ניהול תוכן — מוצרים, קורסים, ומדיה, (3) ניהול קהילה — פוסטים, קטגוריות, אירועים, (4) ניהול בלוג — כתיבת ועריכת מאמרים, (5) ניהול שותפים (Affiliates) — קודים, עמלות, תשלומים, (6) ניהול באגים — צפייה ועדכון דיווחי באגים, (7) התראות מערכת — ניהול הודעות אדמין עם סדר עדיפויות.`,
        `מסע אדמין (Admin Journey): ויזארד 8 שלבים שמנחה אדמינים חדשים דרך הגדרת החזון, צוות, מיתוג, מוצרים, תוכן, דפי נחיתה, שיווק, ותפעול — עם סיכום AI בסוף.`,
      ] : [
        `Admin Hub (/admin-hub) is the management center of ${brandName} — accessible only to users with an admin role (managed via user_roles table with RLS). Includes: statistics dashboard with user counts, subscriptions, revenue, and daily activity.`,
        `Management modules: (1) User management — search, view, and update profiles, (2) Content management — products, courses, and media, (3) Community management — posts, categories, events, (4) Blog management — writing and editing articles, (5) Affiliate management — codes, commissions, payouts, (6) Bug management — viewing and updating bug reports, (7) System notifications — managing admin notifications with priorities.`,
        `Admin Journey: An 8-step wizard guiding new admins through vision, team, branding, products, content, landing pages, marketing, and operations setup — with an AI summary at completion.`,
      ],
    },
    {
      id: 'affiliate',
      number: '13.3',
      title: he ? 'תוכנית שותפים (Affiliates)' : 'Affiliate Program',
      paragraphs: he ? [
        `${brandName} כולל תוכנית שותפים מלאה שמאפשרת למשתמשים להרוויח עמלות על הפניית לקוחות חדשים. כל שותף מקבל קוד הפניה ייחודי (affiliate_code) עם שיעור עמלה מותאם (ברירת מחדל commission_rate).`,
        `מערכת השותפים כוללת: (1) דשבורד שותפים (/affiliate) עם סטטיסטיקות רווחים, (2) ניהול לינקים (My Links), (3) מעקב הפניות (My Referrals) עם סטטוס אישור, (4) היסטוריית תשלומים (My Payouts). תשלומים מאושרים ומעובדים דרך Admin Hub עם תיעוד מלא.`,
        `דף הרשמת שותפים (/affiliate-signup) פתוח לכולם ומאפשר הצטרפות מהירה לתוכנית.`,
      ] : [
        `${brandName} includes a full affiliate program enabling users to earn commissions for referring new customers. Each affiliate receives a unique referral code (affiliate_code) with a customizable commission rate.`,
        `The affiliate system includes: (1) Affiliate dashboard (/affiliate) with earnings statistics, (2) Link management (My Links), (3) Referral tracking (My Referrals) with approval status, (4) Payout history (My Payouts). Payouts are approved and processed through Admin Hub with full documentation.`,
        `An affiliate signup page (/affiliate-signup) is open to everyone for quick program enrollment.`,
      ],
    },
    {
      id: 'bug-reporting',
      number: '13.4',
      title: he ? 'מערכת דיווח באגים' : 'Bug Reporting System',
      paragraphs: he ? [
        `${brandName} כולל מערכת דיווח באגים מובנית שמאפשרת למשתמשים לדווח על בעיות ישירות מתוך האפליקציה. כל דיווח שומר: כותרת, תיאור, קטגוריה, עדיפות, URL ונתיב הדף, צילום מסך, סוג דפדפן, מערכת הפעלה, וגודל מסך.`,
        `הדיווחים נגישים לאדמינים דרך Admin Hub עם סינון לפי סטטוס (open, in_progress, resolved) ועדיפות. כל דיווח כולל שדות admin_notes ו-resolved_by למעקב טיפול.`,
      ] : [
        `${brandName} includes a built-in bug reporting system allowing users to report issues directly from the application. Each report captures: title, description, category, priority, page URL and path, screenshot, browser type, OS, and screen size.`,
        `Reports are accessible to admins through Admin Hub with filtering by status (open, in_progress, resolved) and priority. Each report includes admin_notes and resolved_by fields for resolution tracking.`,
      ],
    },
    {
      id: 'pwa',
      number: '13.5',
      title: he ? 'PWA — אפליקציית ווב מתקדמת' : 'PWA — Progressive Web App',
      paragraphs: he ? [
        `${brandName} בנוי כ-Progressive Web App (PWA) מלא עם דף התקנה ייעודי (/install). תכונות: (1) התקנה למסך הבית בכל מכשיר (iOS, Android, Desktop), (2) Service Worker לניהול cache ועבודה אופליין, (3) Push Notifications (במנוי Pro), (4) חוויה native-like ללא צורך ב-App Store.`,
        `דף ההתקנה מנחה את המשתמש שלב-אחר-שלב לפי סוג המכשיר (Safari iOS, Chrome Android, Desktop) עם הנחיות ויזואליות מותאמות.`,
      ] : [
        `${brandName} is built as a full Progressive Web App (PWA) with a dedicated install page (/install). Features: (1) Home screen installation on any device (iOS, Android, Desktop), (2) Service Worker for cache management and offline support, (3) Push Notifications (on Pro tier), (4) Native-like experience without App Store dependency.`,
        `The install page guides users step-by-step based on device type (Safari iOS, Chrome Android, Desktop) with tailored visual instructions.`,
      ],
    },
    {
      id: 'coach-storefront',
      number: '13.6',
      title: he ? 'חנויות מאמנים אישיות' : 'Coach Personal Storefronts',
      paragraphs: he ? [
        `כל מאמן ב-${brandName} מקבל חנות אישית עם URL ייחודי (/p/:slug). דפי הנחיתה נוצרים אוטומטית על ידי Aurora ומותאמים לפרופיל המאמן — כולל Hero section, יתרונות, אודות, עדויות, הצעת ערך, FAQ, ו-CTA.`,
        `המאמנים יכולים לערוך את התוכן, לשנות תבניות (templates), ולפרסם/לבטל פרסום. כל דף נחיתה כולל תמיכת SEO (meta title, description), תמונת כיסוי, וטופס לידים שמזרים ישירות ל-CRM של המאמן.`,
      ] : [
        `Every coach on ${brandName} receives a personal storefront with a unique URL (/p/:slug). Landing pages are auto-generated by Aurora and customized to the coach's profile — including Hero section, benefits, about, testimonials, value proposition, FAQ, and CTA.`,
        `Coaches can edit content, switch templates, and publish/unpublish. Each landing page includes SEO support (meta title, description), cover image, and a lead capture form that feeds directly into the coach's CRM.`,
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
        `Q1 2026: השקת Beta ציבורי, 6 Hubs פעילים (Now, Tactics, Strategy, Community, Learn, FreeMarket), מנוע כרייה MOS, היפנוזה AI, תוכנית 100 ימים, Quest Runner, הערכות עמודים מבוססות שיחה, Plan Chat Wizard, התאמת מאמן AI, היפנוזה אישית, תוכנית Consciousness Leap, בלוג Aurora Codex, תוכנית שותפים, אונבורדינג עם Ceremony, Admin Hub, דיווח באגים, PWA מלא, חנויות מאמנים אישיות, Aurora Context Pipeline מלא. Q2 2026: פלטפורמת מאמנים מתקדמת, FreeMarket עם שוק נתונים, API פתוח, אנליטיקס מתקדם. Q3 2026: NFT Orb export ל-blockchain, אפליקציית מובייל native, integrations עם כלים חיצוניים. Q4 2026: שותפויות B2B, הרחבה גלובלית, שפות נוספות.`,
        `2027: Blockchain integration, DAO governance, מטבע MOS על רשת Solana, שוק NFT חיצוני, יישוב Stripe לפיאט, Aurora Voice Agent עצמאי.`,
      ] : [
        `Q1 2026: Public Beta launch, 6 active Hubs (Now, Tactics, Strategy, Community, Learn, FreeMarket), MOS Mining Engine, AI Hypnosis, 100-Day Plan, Quest Runner, chat-based pillar assessments, Plan Chat Wizard, AI coach matching, personal hypnosis, Consciousness Leap program, Aurora Codex blog, Affiliate program, Onboarding with Ceremony, Admin Hub, Bug Reporting, full PWA, Coach personal storefronts, full Aurora Context Pipeline. Q2 2026: Advanced coach platform, FreeMarket with Data Marketplace, open API, advanced analytics. Q3 2026: NFT Orb export to blockchain, native mobile app, external integrations. Q4 2026: B2B partnerships, global expansion, additional languages.`,
        `2027: Blockchain integration, DAO governance, MOS token on Solana network, external NFT marketplace, Stripe fiat settlement, standalone Aurora Voice Agent.`,
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
        `${brandName} אינו עוד מוצר בשוק רווי. הוא קטגוריה חדשה — Human Operating System — שמאחדת AI תודעתי עם מודעות הקשרית מלאה, כלכלה דיגיטלית מבוססת Proof of Growth, פלטפורמת קריירה מאוחדת עם 5 מסלולים מקצועיים, זהות NFT דינמית, ומערכת אונבורדינג אימרסיבית — לתוך חוויה אחת שעוטפת את חיי המשתמש.`,
        `הפלטפורמה מציעה: מנוע AI שמכיר אותך לעומק (עם Context Pipeline שכולל אסטרטגיות, טקטיקות, לו"ז יומי, ציוני עמודים, וזמן נוכחי), תוכנית 100 ימים עם מתודולוגיית Why-How-Now, Quest Runner לכל עמוד חיים, הערכות מבוססות שיחת AI, Plan Chat Wizard למשא ומתן עם התוכנית, התאמת מאמן מבוססת AI, היפנוזה ומדיטציה מונחית עם TTS בזמן אמת (כולל סשנים אישיים), מערכת למידה אדפטיבית עם Lazy Generation, שוק פנימי עם כלכלת כרייה אמיתית, פלטפורמת קריירה מאוחדת עם דפי נחיתה דינמיים וחנויות אישיות, קהילה פעילה עם Aurora AI, תוכנית Consciousness Leap, בלוג Aurora Codex, תוכנית שותפים, Admin Hub, מערכת PWA, ודיווח באגים מובנה. הכל מחובר, הכל גיימיפי, הכל בשירות הצמיחה האישית.`,
        `בעולם שבו אנשים מוצפים, מנותקים, ומחפשים כיוון — ${brandName} הוא מערכת ההפעלה שתנהל את ההכל. לא רק פרודוקטיביות. לא רק מיינדפולנס. את החיים עצמם.`,
      ] : [
        `${brandName} is not just another product in a saturated market. It is a new category — Human Operating System — that unifies consciousness AI with full contextual awareness, a Proof of Growth digital economy, a unified career platform with 5 professional paths, dynamic NFT identity, and an immersive onboarding system — into a single experience that wraps around the user's life.`,
        `The platform offers: an AI engine that deeply knows you (with a Context Pipeline including strategies, tactics, daily schedule, pillar scores, and current time), a 100-day plan with the Why-How-Now methodology, Quest Runner for each life pillar, chat-based AI assessments, Plan Chat Wizard for plan negotiation, AI-powered coach matching, guided hypnosis with real-time TTS (including custom personal sessions), an adaptive learning system with Lazy Generation, an internal marketplace with real mining economy, a unified career platform with dynamic landing pages and personal storefronts, an active community with Aurora AI, Consciousness Leap program, Aurora Codex blog, affiliate program, Admin Hub, PWA system, and built-in bug reporting. Everything connected, everything gamified, everything in service of personal growth.`,
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
      <div className="sticky top-0 z-50 border-b border-border bg-background backdrop-blur-lg">
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
        {/* Main content - rendered first in DOM, ordered visually */}
        <main className={cn("flex-1 min-w-0", isRTL ? "order-1" : "order-2")}>
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
                  ? 'ספר לבן — AI · NFT · Play-to-Earn · גיימיפיקציה · היפנוזה · למידה · שוק פנימי · קריירה מאוחדת · פיתוח אישי'
                  : 'White Paper — AI · NFT · Play-to-Earn · Gamification · Hypnosis · Learning · Marketplace · Unified Career · Personal Development'
                }
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{he ? `מאת ${founderName}` : `By ${founderName}`}</p>
                <p>{theme.company_legal_name} · {theme.company_country}</p>
                <p>{he ? 'גרסה 4.0 · מרץ 2026' : 'Version 4.0 · March 2026'}</p>
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
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2" style={{ unicodeBidi: 'plaintext' }}>
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
                    <h3 className="text-base font-semibold text-foreground" style={{ unicodeBidi: 'plaintext' }}>{sub.title}</h3>
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

        {/* Sidebar - Desktop always visible, mobile toggle */}
        <aside
          className={cn(
            "fixed lg:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-64 bg-background shrink-0 transition-transform duration-200 overflow-hidden",
            isRTL ? "border-l border-border order-2" : "border-r border-border order-1",
            !isRTL && (sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"),
            isRTL && (sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"),
          )}
          style={isRTL ? { right: 0 } : { left: 0 }}
          dir={isRTL ? 'rtl' : 'ltr'}
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
                  <span className="font-mono text-xs text-primary/60 shrink-0">{item.number}.</span>
                  <span className="min-w-0 text-wrap leading-snug">{item.title}</span>
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
      </div>
    </div>
  );
}
