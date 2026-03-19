import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { useWhitepaperPDF } from '@/hooks/useWhitepaperPDF';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Loader2, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Web3Roadmap } from '@/components/docs/Web3Roadmap';
import { TokenomicsSection } from '@/components/docs/TokenomicsSection';

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
  const { contentRef, capture: downloadPDF, capturing } = useWhitepaperPDF('whitepaper.pdf');

  const brandName = he ? theme.brand_name : theme.brand_name_en;
  const founderName = he ? theme.founder_name : theme.founder_name_en;

  const abstractText = he
    ? `${brandName} הוא מערכת הפעלה אנושית מבוססת בינה מלאכותית — הראשונה מסוגה — המשלבת מנגנוני Play-to-Earn, נכסים דיגיטליים (Soul Avatar NFTs), גיימיפיקציה עמוקה, היפנוזה ומדיטציה מונחית AI, מערכת למידה אדפטיבית, שוק פנימי עם 5 מסלולי קריירה מאוחדים, התאמת מאמנים מבוססת AI, ומנוע תודעתי עם מודעות הקשרית מלאה — לתוך מערכת הפעלה אחת שעוטפת את חיי המשתמש. המסמך מציג את הארכיטקטורה, הכלכלה הדיגיטלית, מנוע ה-AI התודעתי, מודל המנויים, ומפת הדרכים. המטבע הפנימי MOS (100 MOS = $1.00) מבוסס על מנגנון Proof of Growth — מודל שמתגמל פעילות אנושית אמיתית.`
    : `${brandName} is the first AI-powered Human Operating System — integrating Play-to-Earn mechanics, Soul Avatar NFTs, deep gamification, AI-guided hypnosis and meditation, an adaptive learning system, an internal marketplace with 5 unified career paths, AI-powered coach matching, and a consciousness AI engine with full contextual awareness — into a single operating system that wraps around the user's life. This paper presents the architecture, digital economy, consciousness AI engine, subscription model, and roadmap. The internal currency MOS (100 MOS = $1.00) is based on a Proof of Growth mechanism — a model that rewards genuine human activity.`;

  const sections: Section[] = [
    {
      id: 'introduction',
      number: '1',
      title: he ? 'מבוא' : 'Introduction',
      paragraphs: he ? [
        `העולם מוצף באפליקציות — לבריאות, לפרודוקטיביות, למדיטציה, לכסף, ולמערכות יחסים. אבל אף אחת מהן לא מדברת עם השנייה. התוצאה: פיצול קוגניטיבי, עומס דיגיטלי, ותחושת חוסר שליטה.`,
        `${brandName} מציע פרדיגמה חדשה: שכבה אינטליגנטית אחת שיושבת מעל כל תחומי החיים — בריאות, קריירה, זוגיות, כסף, הרגלים, ותודעה — ומנהלת אותם כמערכת הפעלה מאוחדת. לא עוד אפליקציה, אלא מערכת ההפעלה של החיים שלך.`,
        `בניגוד למתחרים, ${brandName} משלב שלושה מנועים: (1) AI תודעתי אדפטיבי, (2) כלכלה דיגיטלית מבוססת Proof of Growth, ו-(3) מערכת Soul Avatar NFT שמייצגת את הזהות המתפתחת של המשתמש.`,
      ] : [
        `The world is flooded with apps — for health, productivity, meditation, finance, and relationships. But none of them talk to each other. The result: cognitive fragmentation, digital overload, and a loss of control.`,
        `${brandName} proposes a new paradigm: a single intelligent layer that sits above all life domains — health, career, relationships, finances, habits, and consciousness — and manages them as a unified operating system. Not another app, but the operating system of your life.`,
        `Unlike competitors, ${brandName} combines three engines: (1) an adaptive consciousness AI, (2) a Proof of Growth digital economy, and (3) a Soul Avatar NFT system representing the user's evolving identity.`,
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
        `${brandName} בנוי סביב מתודולוגיית "Why-How-Now" — מסגרת שלושה אופקים שמתרגמת חזון מופשט לפעולות קונקרטיות יומיות.`,
        `Strategy (Why): מגדיר את מטרות החיים, ערכים, משימות, ו-14 עמודי חיים. זהו הצפון של המשתמש — ה"למה" מאחורי כל פעולה.`,
        `Tactics (How): מפרק את האסטרטגיה לתוכנית 100 ימים עם שלבים, אבני דרך, ובלוקי פעולה יומיים. זהו הגשר בין חזון לביצוע.`,
        `Now (Execute): דשבורד הביצוע היומי — פעולות מחולקות ל-4 רבעוני יום עם שמות הרפתקניים ייחודיים, Movement Score שמודד מומנטום בזמן אמת, ומערכת Quest יומית.`,
      ] : [
        `${brandName} is built around the "Why-How-Now" methodology — a three-horizon framework that translates abstract vision into concrete daily actions.`,
        `Strategy (Why): Defines life goals, values, missions, and 14 life pillars. This is the user's north star — the "why" behind every action.`,
        `Tactics (How): Breaks down strategy into a 100-day plan with phases, milestones, and daily action blocks. The bridge between vision and execution.`,
        `Now (Execute): The daily execution dashboard — actions divided into 4 adventure-themed day quarters with unique names, a Movement Score measuring real-time momentum, and a daily Quest system.`,
      ],
    },
    {
      id: 'solution',
      number: '4',
      title: he ? 'הפתרון — חמש חוויות ליבה' : 'The Solution — Five Core Experiences',
      paragraphs: he ? [
        `${brandName} הוא Human Operating System — מערכת הפעלה אנושית שמאחדת את כל ממדי החיים תחת קורת גג אחת. הפלטפורמה בנויה מחמש חוויות ליבה:`,
      ] : [
        `${brandName} is a Human Operating System that unifies all life dimensions under one roof. The platform is built around five core experiences:`,
      ],
      subsections: [
        {
          title: he ? '4.1 Play — מרכז הביצוע המאוחד' : '4.1 Play — Unified Execution Hub',
          paragraphs: he ? [
            `Play הוא לב הפלטפורמה — מרכז ביצוע אחוד שמאחד אסטרטגיה, טקטיקה, וביצוע יומי תחת חוויה אחת. שלושת אופקי ה-Why-How-Now חיים כאן.`,
            `הדשבורד מציג פעולות יומיות מחולקות ל-4 רבעוני יום הרפתקניים, כל אחד עם שם ייחודי שמתחדש כל יום. Movement Score מודד מומנטום בזמן אמת, וכל יום הוא Quest עם שם ייחודי — שבוע שלם מרכיב Campaign.`,
            `כולל: תוכנית 100 ימים מחולקת ל-10 שלבים עם אבני דרך, סריקות AI עומק ל-14 עמודי חיים עם ציון 0-100, ניהול משימות ופרויקטים עם תעדוף AI, ומנגנון משא ומתן עם Aurora על התוכנית — שינוי סדרי עדיפויות, הזזת אבני דרך, או חידוש תוכנית בשיחה.`,
            `14 עמודי החיים מחולקים ל-6 עמודי Life (נוכחות, כוח, חיוניות, פוקוס, לחימה, התרחבות) ו-6 עמודי Arena (עסקים, עושר, השפעה, מערכות יחסים, פרויקטים, משחק) + תודעה ואומנות. כל עמוד כולל הערכה מבוססת שיחת AI עם דף תוצאות מותאם אישית.`,
            `התאמת מאמן מבוססת AI: המשתמש יכול לבקש מ-Aurora למצוא מאמן שיעזור לו להוציא את האסטרטגיה לפועל — Aurora מנהלת שיחת זיהוי צרכים וממליצה על מאמנים מתאימים מתוך הפלטפורמה.`,
          ] : [
            `Play is the heart of the platform — a unified execution hub that merges strategy, tactics, and daily execution into a single experience. All three Why-How-Now horizons live here.`,
            `The dashboard displays daily actions divided into 4 adventure-themed day quarters, each with a unique name that refreshes daily. A Movement Score measures real-time momentum, and each day is a Quest with a unique name — an entire week forms a Campaign.`,
            `Includes: a 100-day plan divided into 10 phases with milestones, AI deep scans for 14 life pillars scoring 0-100, task and project management with AI prioritization, and a negotiation mechanism with Aurora about the plan — reprioritize, shift milestones, or regenerate the plan through conversation.`,
            `The 14 Life Pillars are split into 6 Life pillars (Presence, Power, Vitality, Focus, Combat, Expansion) and 6 Arena pillars (Business, Wealth, Influence, Relationships, Projects, Play) + Consciousness and Craft. Each pillar includes a chat-based AI assessment with a personalized results page.`,
            `AI Coach Matching: Users can ask Aurora to find a coach to help execute their strategy — Aurora conducts a needs-discovery conversation and recommends matching coaches from the platform.`,
          ],
        },
        {
          title: he ? '4.2 Aurora — מנוע AI תודעתי ויומן' : '4.2 Aurora — Consciousness AI & Journal',
          paragraphs: he ? [
            `Aurora היא ליבת האינטליגנציה של ${brandName} — מנוע תודעתי שלומד דפוסים התנהגותיים, מזהה מצבים רגשיים, ומייצר פעולות פרואקטיביות. כולל שיחות מותאמות קונטקסט, מצב קולי דו-כיווני, וצירוף תמונות.`,
            `מערכת יומן Aurora: ארבעה טאבים — שיחה עם AI, יומן חלומות עם פרשנות, רפלקציה יומית, ותרגול הכרת תודה. כל רשומה נשמרת ומזינה את המודעות ההקשרית של Aurora.`,
          ] : [
            `Aurora is the intelligence core of ${brandName} — a consciousness engine that learns behavioral patterns, identifies emotional states, and generates proactive actions. Includes context-aware conversations, bidirectional voice mode, and image attachments.`,
            `Aurora Journal System: Four tabs — AI conversation, dream journaling with interpretation, daily reflection, and gratitude practice. Every entry is saved and feeds Aurora's contextual awareness.`,
          ],
        },
        {
          title: he ? '4.3 FreeMarket — כלכלה, קריירה ומסחר' : '4.3 FreeMarket — Economy, Career & Commerce',
          paragraphs: he ? [
            `FreeMarket הוא מרכז הכלכלה והקריירה — בנוי משלושה טאבים: Earn (הרוויח), Career (קריירה), ו-Wallet (ארנק). כולל מנגנון אונבורדינג כלכלי מודרך.`,
            `ב-Career, המשתמש בוחר מסלול קריירה מתוך 5 מסלולים מאוחדים: בעל עסק, מאמן, מטפל, יוצר תוכן, פרילנסר. כל מסלול כולל ויזארד AI שמנחה את תהליך ההקמה, דשבורד ניהול מלא, וחנות אישית עם דף נחיתה דינמי.`,
            `ה-Wallet מנהל יתרת MOS עם ספר חשבונות, היסטוריית עסקאות, cashout, וגשר בין מטבעות.`,
          ] : [
            `FreeMarket is the economy and career center — built with three tabs: Earn, Career, and Wallet. Includes a guided economic onboarding process.`,
            `In Career, users choose from 5 unified career paths: Business Owner, Coach, Therapist, Content Creator, Freelancer. Each path includes an AI-guided setup wizard, a full management dashboard, and a personal storefront with a dynamic landing page.`,
            `The Wallet manages MOS balance with a full ledger, transaction history, cashout, and a cross-currency bridge.`,
          ],
        },
        {
          title: he ? '4.4 Community — פיד חברתי' : '4.4 Community — Social Feed',
          paragraphs: he ? [
            `פיד חברתי עם פוסטים, תגובות, לייקים, אירועים, ולוחות מובילים. כולל מערכת רמות קהילתיות, נקודות, ו-badges. Aurora משתתפת בשיחות כחברת קהילה AI.`,
            `סטוריז בסגנון אינסטגרם: משתמשים מעלים סטוריז המקושרים לעמוד חיים ונושא ספציפי — מוצגים בסטריפ אופקי בראש הפיד עם צפייה במסך מלא. תמיכה דו-לשונית מלאה, אירועים קהילתיים עם RSVP, ומפגשים וירטואליים.`,
          ] : [
            `Social feed with posts, comments, likes, events, and leaderboards. Includes community levels, points, and badges. Aurora participates in conversations as an AI community member.`,
            `Instagram-style Stories: Users upload stories tied to specific life pillars and subtopics — displayed in a horizontal strip at the top of the feed with full-screen viewing. Full bilingual content support, community events with RSVP, and virtual meetups.`,
          ],
        },
        {
          title: he ? '4.5 Study — למידה אדפטיבית' : '4.5 Study — Adaptive Learning',
          paragraphs: he ? [
            `"Aurora מלמדת אותך" — מערכת למידה אדפטיבית עם מודל "Lazy Generation": שלד הקורס נוצר מיידית, והתוכן מיוצר דינמית כשהמשתמש מגיע לשיעור ספציפי.`,
            `כל שיעור כולל תרגול מעשי שמסוכם אוטומטית ומסונכרן חזרה לתוכנית הפעולה. כולל מסעות הכוונה: מסע אונבורדינג, מסע עסקי, מסע אימון, ומסע פרויקטים.`,
          ] : [
            `"Aurora Teaches You" — an adaptive learning system using a "Lazy Generation" model: the course skeleton is created instantly, and content is generated dynamically when the user reaches a specific lesson.`,
            `Each lesson includes practical exercises auto-summarized and synced back to the action plan. Includes guided journeys: onboarding journey, business journey, coaching journey, and projects journey.`,
          ],
        },
      ],
    },
    {
      id: 'aurora',
      number: '5',
      title: he ? 'Aurora — מנוע ה-AI התודעתי (עומק)' : 'Aurora — Consciousness AI Engine (Deep Dive)',
      paragraphs: he ? [
        `Aurora אינה צ'אטבוט — אלא מנוע תודעתי שמתפתח עם המשתמש. היא מנהלת: (1) שיחות מותאמות קונטקסט, (2) תוכניות פעולה יומיות/שבועיות, (3) סריקות עומק ל-14 עמודי חיים, (4) תזכורות ודחיפה פרואקטיבית, (5) ניתוח דפוסי אנרגיה, (6) זיהוי מצבי תודעה.`,
        `המודל משתמש בשילוב מודלים מתקדמים (Gemini 2.5 Pro/Flash, GPT-5) עם prompts מותאמים שכוללים את הפרופיל המלא של המשתמש, היסטוריית שיחות, ציוני עמודים, ומצב רגשי. תמיכה מלאה בעיבוד מולטימודלי (טקסט + תמונות).`,
      ] : [
        `Aurora is not a chatbot — it is a consciousness engine that evolves with the user. It manages: (1) context-aware personal conversations, (2) daily/weekly action plans, (3) deep scans for 14 life pillars, (4) proactive reminders and nudges, (5) energy pattern analysis, (6) consciousness state detection.`,
        `The model uses a combination of frontier AI models (Gemini 2.5 Pro/Flash, GPT-5) with custom prompts that include the user's full profile, conversation history, pillar scores, and emotional state. Full multimodal processing support (text + images).`,
      ],
      subsections: [
        {
          title: he ? '5.1 מודעות הקשרית מלאה' : '5.1 Full Contextual Awareness',
          paragraphs: he ? [
            `Aurora בנויה על pipeline הקשרי מתקדם שאוסף אוטומטית מידע מ-7+ מקורות נתונים לפני כל שיחה: פרופיל מלא, תוכניות אסטרטגיות פעילות, משימות, לוח זמנים יומי, ציוני הערכה מ-14 עמודי חיים, ורמת מנוי.`,
            `Aurora מודעת לזמן — יודעת את השעה, היום, ולוח הזמנים הספציפי של המשתמש. זה מאפשר המלצות מדויקות: "יש לך בלוק אימון בעוד שעה", "סיימת 60% מהמשימות של היום".`,
          ] : [
            `Aurora is built on an advanced contextual pipeline that automatically gathers data from 7+ sources before every conversation: full profile, active strategic plans, missions, daily schedule, assessment scores from all 14 life pillars, and subscription tier.`,
            `Aurora is time-aware — it knows the current time, day, and the user's specific schedule. This enables precise recommendations: "you have a training block in an hour", "you've completed 60% of today's tasks".`,
          ],
        },
        {
          title: he ? '5.2 זיכרון וגרף מידע' : '5.2 Memory & Knowledge Graph',
          paragraphs: he ? [
            `Aurora שומרת זיכרון שיחות מלא — סיכומים, נושאים מרכזיים, מצב רגשי, ופעולות שהוסכמו. הזיכרון מזורק לכל שיחה חדשה, מה שמאפשר המשכיות אמיתית לאורך זמן. אירועים אחרונים ושינויי זהות מקבלים עדיפות.`,
            `גרף זיכרון: מערכת שמקשרת בין צמתי מידע — עובדות, דפוסים, זהויות, העדפות — עם חוזק חיבור ומודעות לעמודי חיים. מאפשרת ל-Aurora לחבר נקודות בין נושאים שונים וליצור תובנות חוצות-שיחות.`,
          ] : [
            `Aurora maintains full conversation memory — summaries, key topics, emotional state, and agreed-upon actions. Memory is injected into every new conversation, enabling true continuity over time. Recent events and identity shifts are prioritized.`,
            `Knowledge Graph: A system connecting information nodes — facts, patterns, identities, preferences — with connection strength and pillar awareness. Enables Aurora to connect dots between different topics and surface cross-conversation insights.`,
          ],
        },
        {
          title: he ? '5.3 מערכת פרואקטיבית ומצב קולי' : '5.3 Proactive System & Voice Mode',
          paragraphs: he ? [
            `מנוע פרואקטיבי שדוחף הודעות מבוססות הקשר — תזכורות, עידוד, אזהרות על ירידת streak, או הצעות לפעולה. עובד ברקע ומזהה הזדמנויות התערבות אופטימליות.`,
            `מצב קולי: שיחה דו-כיוונית עם Aurora במסך מלא — מאזינה, מעבדת, ומדברת בלולאה רציפה. כולל המרת דיבור לטקסט, טקסט לדיבור, ואנימציית Orb חיה. פועל גם בהערכות עמודים וגם בשיחות חופשיות.`,
          ] : [
            `A proactive engine that pushes context-based messages — reminders, encouragement, streak drop warnings, or action suggestions. Works in the background and identifies optimal intervention opportunities.`,
            `Voice Mode: Full-screen bidirectional conversation with Aurora — listening, processing, and speaking in a continuous loop. Includes speech-to-text, text-to-speech, and a live Orb animation. Works in both pillar assessments and free conversations.`,
          ],
        },
      ],
    },
    {
      id: 'hypnosis',
      number: '6',
      title: he ? 'היפנוזה ומדיטציה מונחית AI' : 'AI-Guided Hypnosis & Meditation',
      paragraphs: he ? [
        `${brandName} כולל מערכת היפנוזה ומדיטציה מונחית AI — סשנים מותאמים אישית שנוצרים בזמן אמת על בסיס מצב המשתמש, מטרותיו, ודפוסי התודעה שלו.`,
        `כל סשן משלב: (1) תסריט היפנוזה מותאם על בסיס הפרופיל, (2) המרת טקסט-לדיבור בזמן אמת, (3) מוזיקת רקע ותדרים בינאורליים, (4) עבודה עם מצבי אגו ותת-מודע, (5) ויזואליזציה ואפירמציות.`,
        `כל סשן מתגמל MOS ומשפיע על ציון עמוד התודעה. Aurora משתמשת בהיסטוריית סשנים קודמים כדי להתאים תוכן, ושוזרת תובנות מעמודי חיים אחרים לתוך החוויה.`,
      ] : [
        `${brandName} includes an AI-guided hypnosis and meditation system — personalized sessions generated in real-time based on the user's state, goals, and consciousness patterns.`,
        `Each session combines: (1) custom hypnosis scripts generated based on the user's profile, (2) real-time text-to-speech conversion, (3) background music and binaural frequency layers, (4) ego state and subconscious work, (5) visualization and affirmation practice.`,
        `Every session rewards MOS and affects the Consciousness Pillar score. Aurora uses previous session history to tailor content, weaving insights from other life pillars into the experience.`,
      ],
    },
    {
      id: 'nft',
      number: '7',
      title: he ? 'Soul Avatar NFT — זהות דיגיטלית מתפתחת' : 'Soul Avatar NFT — Evolving Digital Identity',
      paragraphs: he ? [
        `כל משתמש ב-${brandName} מחזיק ב-Soul Avatar — נכס דיגיטלי תלת-ממדי ייחודי שמייצג את הזהות, ההתקדמות, והתודעה שלו. ה-Avatar נבנה באמצעות Three.js עם אפקטי Bloom, חלקיקים ומורפינג בזמן אמת — הוא מתפתח בהתאם לפעולות המשתמש.`,
        `מאפייני ה-Avatar: (1) צבעים — משתנים לפי עמודי חיים דומיננטיים, (2) מורפולוגיה — עוצמת עיוות הגיאומטריה גדלה עם הרמה, (3) חלקיקים — צפיפות לפי streak ואנרגיה, (4) הילה — אפקט Bloom שמשקף עומק התודעה, (5) צבעים משניים — שילובי עמודי חיים.`,
        `Web3 Onboarding: ויזארד מנטינג ב-5 שלבים — היכרות עם עולם ה-Web3, יצירת ארנק דיגיטלי (ללא seed phrases — כניסה דרך Google/Email), מנטינג סינמטי של ה-Soul Avatar, וכניסה לכלכלת Play2Earn. הארנק הדיגיטלי מאפשר בעלות אמיתית על הנכס.`,
        `ה-Soul Avatar הוא האווטר של המשתמש בכל המערכת — בפרופיל, בקהילה, ובעתיד ייצוא כ-NFT אמיתי על blockchain.`,
      ] : [
        `Every ${brandName} user holds a Soul Avatar — a unique 3D digital asset representing their identity, progress, and consciousness. The Avatar is built with Three.js featuring real-time Bloom effects, particles, and morphing — it evolves based on user actions.`,
        `Avatar attributes: (1) Colors — change based on dominant life pillars, (2) Morphology — geometry distortion intensity grows with level, (3) Particles — density based on streak and energy, (4) Aura — Bloom effect reflecting consciousness depth, (5) Secondary colors — pillar combinations.`,
        `Web3 Onboarding: A 5-step minting wizard — introduction to Web3, digital wallet creation (no seed phrases — sign in with Google/Email), cinematic Soul Avatar minting, and entry into the Play2Earn economy. The digital wallet enables true ownership of the asset.`,
        `The Soul Avatar serves as the user's avatar across the entire system — in profiles, community, and in the future exportable as a real NFT on blockchain.`,
      ],
    },
    {
      id: 'economy',
      number: '8',
      title: he ? 'כלכלה דיגיטלית — Proof of Growth' : 'Digital Economy — Proof of Growth',
      paragraphs: he ? [
        `MOS (Mind Operating System) הוא המטבע הפנימי של ${brandName}. שער קבוע: 100 MOS = $1.00. המטבע מבוסס על מנגנון Proof of Growth — מנוע שמתגמל פעילות אנושית אמיתית ומאומתת.`,
      ] : [
        `MOS (Mind Operating System) is the internal currency of ${brandName}. Fixed rate: 100 MOS = $1.00. The currency is based on a Proof of Growth mechanism — an engine that rewards verified genuine human activity.`,
      ],
      subsections: [
        {
          title: he ? '8.1 מנוע הכרייה' : '8.1 Mining Engine',
          paragraphs: he ? [
            `המנוע מתגמל אוטומטית פעילות מאומתת בתעריפים קבועים: סשני היפנוזה (10 MOS), פוסטים בקהילה (8 MOS), שיעורי למידה (5 MOS), השלמת הרגלים (3 MOS), תגובות בקהילה (3 MOS). תקרה יומית של 200 MOS עם cooldowns למניעת ניצול. כל הכרייה מתועדת לביקורתיות מלאה.`,
          ] : [
            `The engine automatically rewards verified activity at fixed rates: Hypnosis Sessions (10 MOS), Community Posts (8 MOS), Learning Lessons (5 MOS), Habit Completion (3 MOS), Community Comments (3 MOS). Daily cap of 200 MOS with cooldowns to prevent exploitation. All mining is fully auditable.`,
          ],
        },
        {
          title: he ? '8.2 שוק נתונים' : '8.2 Data Marketplace',
          paragraphs: he ? [
            `מייצר הכנסה מתובנות התנהגותיות אנונימיות עם חלוקת הכנסה 80/20 (80% למשתמש). כולל pipeline אנונימיזציה עם סף מינימלי של 10 תורמים, והסכמה גרנולרית של המשתמש. הכנסות מחולקות אוטומטית לתורמים בעת רכישה.`,
          ] : [
            `Monetizes anonymized behavioral insights with an 80/20 revenue split (80% to user). Includes an anonymization pipeline requiring a minimum 10-contributor threshold, with granular user consent. Revenue is automatically distributed to contributors upon purchase.`,
          ],
        },
        {
          title: he ? '8.3 Play2Earn — הרוויח מכל פעולה' : '8.3 Play2Earn — Earn From Every Action',
          paragraphs: he ? [
            `כלכלת ${brandName} בנויה על מנגנון Play2Earn שמתגמל כל היבט של צמיחה אישית:`,
            `🌱 צמיחה — השלמת הרגלים, streaks, סיום שלבים בתוכנית 100 הימים. מכפילי streak (x1.5 ביום 7, x2 ביום 30) מעודדים עקביות.`,
            `📊 נתונים — מכירת תובנות אנונימיות עם חלוקת 80/20 והסכמה גרנולרית.`,
            `💼 עבודה — גיגים, באונטי קהילתיות, מכירת שירותים, וסשנים של מאמנים.`,
            `📚 למידה — כל שיעור ותרגול שהושלם מתגמל MOS. כל אינטראקציה היא פעולת כרייה מאומתת.`,
          ] : [
            `The ${brandName} economy is built on a Play2Earn mechanism that rewards every aspect of personal growth:`,
            `🌱 Growth — Habit completion, streaks, 100-day plan phase completion. Streak multipliers (x1.5 at day 7, x2 at day 30) incentivize consistency.`,
            `📊 Data — Sell anonymized insights with 80/20 split and granular consent.`,
            `💼 Work — Gigs, community bounties, service sales, and coach sessions.`,
            `📚 Learning — Every completed lesson and exercise rewards MOS. Every interaction is a verified mining action.`,
          ],
        },
        {
          title: he ? '8.4 ארנק ויישוב' : '8.4 Wallet & Settlement',
          paragraphs: he ? [
            `ארנק פנימי עם ספר חשבונות מלא. יישוב אסינכרוני לערוצי תשלום חיצוניים (Stripe לפיאט או Solana לטוקנים MOS). חשיפה פרוגרסיבית: "מצב פשוט" (נקודות/בנק) ו"מצב מתקדם" (כתובות blockchain).`,
          ] : [
            `Internal wallet with a full ledger. Asynchronous settlement to external payment rails (Stripe for fiat or Solana for MOS tokens). Progressive disclosure: "Simple Mode" (points/bank terminology) and "Advanced Mode" (blockchain addresses).`,
          ],
        },
      ],
    },
    {
      id: 'career-platform',
      number: '9',
      title: he ? 'פלטפורמת קריירה מאוחדת' : 'Unified Career Platform',
      paragraphs: he ? [
        `${brandName} כולל פלטפורמת קריירה מאוחדת עם 5 מסלולים מקצועיים תחת ארכיטקטורה אחת. כל מסלול כולל ויזארד AI שמנחה את תהליך ההקמה — לעסקים חדשים וקיימים.`,
        `מסלולים: (1) בעל עסק — תכנון, השקה וצמיחה, (2) מאמן — בניית פרקטיקה עם CRM, לקוחות ודפי נחיתה, (3) מטפל — ניהול פרקטיקה עם תורים וצמיחה, (4) יוצר תוכן — קורסים ומוצרים דיגיטליים, (5) פרילנסר — גיגים ופרויקטים.`,
        `כלי AI למקצוענים: יצירת תוכניות ללקוחות, ניתוח התקדמות, דפי נחיתה אוטומטיים עם URL ייחודי לכל מאמן, מערכת CRM, ניהול לידים, וניתוח אנליטי. מנוי מאמנים עם רמות (Starter $19, Growth $49, Scale $99) מאפשר גישה מדורגת.`,
        `כל מאמן מקבל חנות אישית עם דף נחיתה שנוצר אוטומטית על ידי Aurora — כולל Hero, יתרונות, עדויות, הצעת ערך, FAQ, ו-CTA. כולל תמיכת SEO וטופס לידים שמזרים ישירות ל-CRM.`,
      ] : [
        `${brandName} includes a unified career platform serving 5 professional paths under a single architecture. Each path includes an AI wizard guiding the setup process — for both new and existing businesses.`,
        `Paths: (1) Business Owner — plan, launch and grow, (2) Coach — build a practice with CRM, clients and landing pages, (3) Therapist — manage practice with scheduling and growth, (4) Content Creator — courses and digital products, (5) Freelancer — gigs and projects.`,
        `AI tools for professionals: client plan generation, progress analysis, automatic landing pages with unique URLs per coach, full CRM, lead management, and analytics. Coach subscriptions with tiers (Starter $19, Growth $49, Scale $99) provide tiered access.`,
        `Every coach receives a personal storefront with an auto-generated landing page by Aurora — including Hero, benefits, testimonials, value proposition, FAQ, and CTA. Includes SEO support and a lead capture form feeding directly into the CRM.`,
      ],
    },
    {
      id: 'gamification',
      number: '10',
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
          title: he ? '10.1 מערכת מיומנויות' : '10.1 Skill Tree System',
          paragraphs: he ? [
            `מערכת Skills מאפשרת למשתמשים לצבור ניסיון בתחומים ספציפיים. כל פעולה מחולקת למשקלים שמשפיעים על מיומנויות רלוונטיות לפי סוג, עמוד חיים, ותחום. מעקב גרנולרי אחרי התפתחות מיומנויות חוצות-תחומים.`,
          ] : [
            `The Skills system allows users to gain experience in specific domains. Each action is weighted to affect relevant skills based on type, life pillar, and domain. Enables granular tracking of cross-domain skill development.`,
          ],
        },
      ],
    },
    {
      id: 'subscription',
      number: '11',
      title: he ? 'מודל מנויים' : 'Subscription Model',
      paragraphs: he ? [
        `${brandName} מציע שלוש רמות מנוי בהיררכיית "עומק הכוח":`,
        `Awakening (חינמי): מבנה בסיסי, XP ורמות, 5 הודעות Aurora ביום, בחירת עד 2 עמודי חיים, וגישה מלאה ל-Play Hub לעידוד מומנטום יומי.`,
        `Optimization ($69/חודש): Aurora ללא הגבלת זיכרון, 6 עמודי חיים, מערכת טרנספורמציה של 100 יום, והיפנוזה AI.`,
        `Command ($199/חודש): כל 14 עמודי החיים, מנוע פרואקטיבי, ועדכוני תוכנית מודולריים — השלמת הערכות מזריקה אסטרטגיות חדשות לתוכנית הפעילה.`,
      ] : [
        `${brandName} offers three subscription tiers in a "Depth of Power" hierarchy:`,
        `Awakening (Free): Basic structure, XP/leveling, 5 daily Aurora messages, up to 2 pillars, and full access to the Play Hub for daily momentum.`,
        `Optimization ($69/mo): Unlimited Aurora memory, 6 pillars, the 100-Day Transformation OS, and AI Hypnosis.`,
        `Command ($199/mo): All 14 pillars, the proactive engine, and modular plan updates — completing assessments injects new strategies into the active plan.`,
      ],
    },
    {
      id: 'data-privacy',
      number: '12',
      title: he ? 'פרטיות ואבטחת מידע' : 'Data Privacy & Security',
      paragraphs: he ? [
        `${brandName} מחויב לפרטיות המשתמשים. כל הנתונים מוצפנים, מאוחסנים בתשתית ענן מאובטחת, ונגישים רק למשתמש עצמו דרך מערכת הרשאות מדורגת. המערכת לא מוכרת נתונים לצדדים שלישיים.`,
        `נתוני AI משמשים אך ורק לשיפור חווית המשתמש. המשתמש יכול למחוק את כל הנתונים שלו בכל עת. שוק הנתונים מבוסס על הסכמה גרנולרית ואנונימיזציה מלאה עם סף 10 תורמים.`,
      ] : [
        `${brandName} is committed to user privacy. All data is encrypted, stored in secure cloud infrastructure, and accessible only to the user through a tiered permission system. The system does not sell data to third parties.`,
        `AI data is used solely to improve user experience. Users can delete all their data at any time. The data marketplace is based on granular consent and full anonymization with a 10-contributor threshold.`,
      ],
    },
    {
      id: 'onboarding',
      number: '13',
      title: he ? 'אונבורדינג וטקס כניסה' : 'Onboarding & Initiation Ceremony',
      paragraphs: he ? [
        `${brandName} כולל מערכת אונבורדינג רב-שלבית: (1) הרשמה עם אימייל ואימות, (2) שיחת היכרות עם Aurora לזיהוי מצב, מטרות, ואתגרים, (3) בחירת עמודי חיים ראשוניים, (4) יצירת תוכנית 100 ימים ראשונה.`,
        `טקס הכניסה: חוויה ויזואלית אימרסיבית שמסמנת את תחילת המסע — אנימציות, מוזיקת רקע, ויצירת ה-Soul Avatar האישי הראשון. הטקס בונה מחויבות רגשית ומבדל את ${brandName} מכל אפליקציה אחרת.`,
        `לאחר האונבורדינג, ויזארד מנטינג ה-Soul Avatar NFT מופעל אוטומטית — מחבר את המשתמש לכלכלת Web3 ומעניק בעלות דיגיטלית על האווטר.`,
      ] : [
        `${brandName} includes a multi-step onboarding system: (1) email signup with verification, (2) introductory conversation with Aurora for state, goals, and challenge identification, (3) initial life pillar selection, (4) first 100-day plan creation.`,
        `Initiation Ceremony: An immersive visual experience marking the start of the journey — animations, background music, and creation of the first personal Soul Avatar. The ceremony builds emotional commitment and differentiates ${brandName} from any other app.`,
        `After onboarding, the Soul Avatar NFT minting wizard is automatically triggered — connecting the user to the Web3 economy and granting digital ownership of their avatar.`,
      ],
    },
    {
      id: 'affiliate',
      number: '14',
      title: he ? 'תוכנית שותפים' : 'Affiliate Program',
      paragraphs: he ? [
        `תוכנית שותפים מלאה שמאפשרת למשתמשים להרוויח עמלות על הפניית לקוחות חדשים. כל שותף מקבל קוד הפניה ייחודי עם שיעור עמלה מותאם.`,
        `כולל: דשבורד שותפים עם סטטיסטיקות רווחים, ניהול לינקים, מעקב הפניות עם סטטוס אישור, והיסטוריית תשלומים. דף הצטרפות פתוח לכולם.`,
      ] : [
        `A full affiliate program enabling users to earn commissions for referring new customers. Each affiliate receives a unique referral code with a customizable commission rate.`,
        `Includes: affiliate dashboard with earnings statistics, link management, referral tracking with approval status, and payout history. Open enrollment for everyone.`,
      ],
    },
    {
      id: 'tech-stack',
      number: '15',
      title: he ? 'טכנולוגיה וארכיטקטורה' : 'Technology & Architecture',
      paragraphs: he ? [
        `Frontend: React + TypeScript + Tailwind CSS + Framer Motion + Three.js (Soul Avatar rendering). Backend: PostgreSQL, אימות, פונקציות שרת, אחסון, ו-Realtime. AI: Gemini 2.5 Pro/Flash, GPT-5, מודלים מולטימודליים.`,
        `ארכיטקטורת Mobile-First: כל ה-UI מתוכנן קודם כל למובייל עם breakpoints אדפטיביים. כולל PWA מלא עם התקנה למסך הבית, תמיכת offline, ו-push notifications. חוויה native-like ללא צורך ב-App Store.`,
        `הפלטפורמה responsive לחלוטין עם תמיכה מלאה בעברית (RTL) ואנגלית. ארכיטקטורת אבטחה מדורגת עם הרשאות ברמת שורה מבטיחה שכל משתמש רואה רק את הנתונים שלו.`,
      ] : [
        `Frontend: React + TypeScript + Tailwind CSS + Framer Motion + Three.js (Soul Avatar rendering). Backend: PostgreSQL, Authentication, Server Functions, Storage, and Realtime subscriptions. AI: Gemini 2.5 Pro/Flash, GPT-5, multimodal models.`,
        `Mobile-First Architecture: All UI is designed mobile-first with adaptive breakpoints. Includes full PWA with home screen installation, offline support, and push notifications. Native-like experience without App Store dependency.`,
        `The platform is fully responsive with complete Hebrew (RTL) and English support. Row-level security architecture ensures every user only sees their own data.`,
      ],
    },
    {
      id: 'roadmap',
      number: '16',
      title: he ? 'מפת דרכים' : 'Roadmap',
      paragraphs: he ? [
        `Q1 2026: השקת Beta ציבורי, 5 חוויות ליבה פעילות (Play, Aurora, FreeMarket, Community, Study), מנוע כרייה MOS, היפנוזה AI, תוכנית 100 ימים, הערכות עמודים מבוססות שיחה, משא ומתן על התוכנית, התאמת מאמן AI, היפנוזה אישית, בלוג, תוכנית שותפים, אונבורדינג עם טקס כניסה, מנטינג Soul Avatar NFT עם Web3 Wallet, PWA מלא, חנויות מאמנים, סטוריז, יומן Aurora (חלומות, רפלקציה, הכרת תודה), מצב קולי.`,
        `Q2 2026: פלטפורמת מאמנים מתקדמת, שוק נתונים, API פתוח, אנליטיקס מתקדם. Q3 2026: ייצוא Soul Avatar NFT ל-blockchain, אפליקציית מובייל native, אינטגרציות חיצוניות. Q4 2026: שותפויות B2B, הרחבה גלובלית, שפות נוספות.`,
        `2027: Blockchain integration מלא, DAO governance, MOS על רשת Solana, שוק NFT חיצוני, יישוב Stripe לפיאט, Aurora Voice Agent עצמאי.`,
      ] : [
        `Q1 2026: Public Beta launch, 5 active core experiences (Play, Aurora, FreeMarket, Community, Study), MOS Mining Engine, AI Hypnosis, 100-Day Plan, chat-based pillar assessments, plan negotiation, AI coach matching, personal hypnosis, blog, affiliate program, onboarding with ceremony, Soul Avatar NFT minting with Web3 Wallet, full PWA, coach storefronts, Stories, Aurora Journal (dreams, reflection, gratitude), voice mode.`,
        `Q2 2026: Advanced coach platform, Data Marketplace, open API, advanced analytics. Q3 2026: Soul Avatar NFT export to blockchain, native mobile app, external integrations. Q4 2026: B2B partnerships, global expansion, additional languages.`,
        `2027: Full blockchain integration, DAO governance, MOS on Solana network, external NFT marketplace, Stripe fiat settlement, standalone Aurora Voice Agent.`,
      ],
    },
    {
      id: 'team',
      number: '17',
      title: he ? 'מייסד' : 'Founder',
      paragraphs: he ? [
        `מייסד ומנכ"ל: ${founderName} — ${he ? theme.founder_title : theme.founder_title_en}`,
        `${brandName} נבנה מאפס על ידי מייסד יחיד מאז ספטמבר 2024 — ללא שותפים, ללא פשרות על החזון. כל שורת קוד, כל החלטת עיצוב, כל מנגנון AI — נוצרו מתוך תשוקה עמוקה לבניית מערכת ההפעלה האנושית הטובה ביותר שאפשר. הבחירה לבנות סולו מבטיחה שהחזון לעולם לא יושחת.`,
        `ישות משפטית: ${theme.company_legal_name}, ${theme.company_country}.`,
      ] : [
        `Founder & CEO: ${founderName} — ${theme.founder_title_en}`,
        `${brandName} has been built from the ground up by a solo founder since September 2024 — no partners, no compromises on the vision. Every line of code, every design decision, every AI mechanism — crafted with deep passion for building the best Human Operating System possible. The choice to build solo ensures the vision can never be corrupted.`,
        `Legal entity: ${theme.company_legal_name}, ${theme.company_country}.`,
      ],
    },
    {
      id: 'conclusion',
      number: '18',
      title: he ? 'סיכום' : 'Conclusion',
      paragraphs: he ? [
        `${brandName} אינו עוד מוצר בשוק רווי. הוא קטגוריה חדשה — Human Operating System — שמאחדת AI תודעתי עם מודעות הקשרית מלאה, כלכלה דיגיטלית מבוססת Proof of Growth, פלטפורמת קריירה מאוחדת עם 5 מסלולים מקצועיים, זהות Soul Avatar NFT דינמית, Web3 Wallet עם מנטינג אמיתי, ומערכת אונבורדינג אימרסיבית — לתוך חוויה אחת שעוטפת את חיי המשתמש.`,
        `הפלטפורמה מציעה: מנוע AI שמכיר אותך לעומק, תוכנית 100 ימים עם מתודולוגיית Why-How-Now, הערכות מבוססות שיחת AI ל-14 עמודי חיים, משא ומתן חכם עם התוכנית, התאמת מאמן מבוססת AI, היפנוזה ומדיטציה מונחית, מערכת למידה אדפטיבית, שוק פנימי עם כלכלת כרייה אמיתית, פלטפורמת קריירה מאוחדת עם חנויות אישיות, קהילה פעילה, יומן Aurora עם חלומות ורפלקציה, מצב קולי, Soul Avatar NFT עם Web3 Wallet, תוכנית שותפים, ו-PWA מלא. הכל מחובר, הכל גיימיפי, הכל בשירות הצמיחה האישית.`,
        `בעולם שבו אנשים מוצפים, מנותקים, ומחפשים כיוון — ${brandName} הוא מערכת ההפעלה שתנהל את ההכל. לא רק פרודוקטיביות. לא רק מיינדפולנס. את החיים עצמם.`,
      ] : [
        `${brandName} is not just another product in a saturated market. It is a new category — Human Operating System — that unifies consciousness AI with full contextual awareness, a Proof of Growth digital economy, a unified career platform with 5 professional paths, dynamic Soul Avatar NFT identity, Web3 Wallet with real minting, and an immersive onboarding system — into a single experience that wraps around the user's life.`,
        `The platform offers: an AI engine that deeply knows you, a 100-day plan with the Why-How-Now methodology, chat-based AI assessments for 14 life pillars, smart plan negotiation, AI-powered coach matching, guided hypnosis and meditation, an adaptive learning system, an internal marketplace with real mining economy, a unified career platform with personal storefronts, an active community, Aurora Journal with dreams and reflection, voice mode, Soul Avatar NFT with Web3 Wallet, affiliate program, and full PWA. Everything connected, everything gamified, everything in service of personal growth.`,
        `In a world where people are overwhelmed, disconnected, and searching for direction — ${brandName} is the operating system that will manage everything. Not just productivity. Not just mindfulness. Life itself.`,
      ],
    },
    {
      id: 'tokenomics',
      number: '19',
      title: he ? 'טוקנומיקס — כלכלת MOS' : 'Tokenomics — MOS Economy',
      paragraphs: [],
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

          <button
            onClick={downloadPDF}
            disabled={capturing}
            className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {capturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span className="text-xs hidden sm:inline">{he ? 'הורד PDF' : 'Download PDF'}</span>
          </button>

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
        {/* Main content */}
        <main ref={contentRef} dir={isRTL ? 'rtl' : 'ltr'} className={cn("flex-1 min-w-0", isRTL ? "order-1" : "order-2")}>
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
                  ? 'ספר לבן — AI · Soul Avatar NFT · Play-to-Earn · גיימיפיקציה · היפנוזה · למידה · שוק פנימי · קריירה מאוחדת · Web3'
                  : 'White Paper — AI · Soul Avatar NFT · Play-to-Earn · Gamification · Hypnosis · Learning · Marketplace · Unified Career · Web3'
                }
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{he ? `מאת ${founderName}` : `By ${founderName}`}</p>
                <p>{theme.company_legal_name} · {theme.company_country}</p>
                <p>{he ? 'גרסה 6.0 · מרץ 2026' : 'Version 6.0 · March 2026'}</p>
              </div>
            </motion.div>

            {/* Abstract */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3"
            >
              <h2 className="text-lg font-bold text-foreground">{he ? 'תקציר מנהלים' : 'Executive Summary'}</h2>
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

                {/* Visual roadmap for roadmap section */}
                {section.id === 'roadmap' ? (
                  <Web3Roadmap isHe={he} />
                ) : section.id === 'tokenomics' ? (
                  <TokenomicsSection isHe={he} />
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

        {/* Sidebar */}
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
