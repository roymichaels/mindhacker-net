import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      id: 'solution',
      number: '3',
      title: he ? 'הפתרון — חמישה Hubs' : 'The Solution — Five Hubs',
      paragraphs: he ? [
        `${brandName} הוא Human Operating System — מערכת הפעלה אנושית שמאחדת את כל ממדי החיים תחת קורת גג אחת. הפלטפורמה בנויה מחמישה Hubs:`,
      ] : [
        `${brandName} is a Human Operating System that unifies all life dimensions under one roof. The platform is built from five Hubs:`,
      ],
      subsections: [
        {
          title: he ? '3.1 Now Hub — מרכז השליטה' : '3.1 Now Hub — Command Center',
          paragraphs: he ? [
            `הדשבורד המרכזי מציג סטטוס יומי בזמן אמת: משימות, הרגלים, אנרגיה, streak, XP, וטוקנים. Aurora (ה-AI) מופיעה כאורב תלת-ממדי שמשתנה בהתאם למצב המשתמש ומציעה פעולות פרואקטיביות. כולל כפתור "Dock" צף עם פעולות מהירות ומצב אנרגיה.`,
          ] : [
            `The central dashboard displays real-time daily status: tasks, habits, energy, streak, XP, and tokens. Aurora (the AI) appears as a 3D orb that changes based on user state and suggests proactive actions. Includes a floating "Dock" button with quick actions and energy state.`,
          ],
        },
        {
          title: he ? '3.2 Tactics Hub — טקטיקה וביצוע' : '3.2 Tactics Hub — Execution',
          paragraphs: he ? [
            `ניהול משימות, פרויקטים, Sprints, ו-Milestones. כולל תכנון יומי/שבועי/חודשי חכם עם תעדוף AI, זמן-בלוקינג, ו-subtasks היררכיים. ה-Tactics Hub פתוח לכל המשתמשים (כולל חינמיים) כדי לעודד מומנטום יומי.`,
          ] : [
            `Task management, projects, sprints, and milestones. Includes smart daily/weekly/monthly planning with AI prioritization, time-blocking, and hierarchical subtasks. The Tactics Hub is open to all users (including free tier) to encourage daily momentum.`,
          ],
        },
        {
          title: he ? '3.3 Strategy Hub — אסטרטגיה' : '3.3 Strategy Hub — Strategy',
          paragraphs: he ? [
            `מנתח את חיי המשתמש דרך 14 עמודי חיים (Pillars): נוכחות, כוח, חיוניות, פוקוס, לחימה, התרחבות, תודעה, עושר, השפעה, מערכות יחסים, עסקים, פרויקטים, משחק, ועוד. כל עמוד נסרק באמצעות AI, מקבל ציון (0-100), ומייצר תוכנית שיפור מותאמת אישית.`,
            `כולל: תכונות אופי (Traits), משימות חיים (Missions), ומערכת "כיול מחדש" (Recalibrate) שמאפשרת עדכון האסטרטגיה. Strategy מציג את ה"למה" (Why) — יעדים ומשימות חיים, בעוד Tactics מציג את ה"איך" (How) — פירוט משימות יומי.`,
          ] : [
            `Analyzes the user's life through 14 Life Pillars: Presence, Power, Vitality, Focus, Combat, Expansion, Consciousness, Wealth, Influence, Relationships, Business, Projects, Play, and more. Each pillar is scanned by AI, scored (0-100), and generates a personalized improvement plan.`,
            `Includes: character Traits, life Missions, and a "Recalibrate" system for strategy updates. Strategy shows the "Why" — goals and life missions, while Tactics shows the "How" — daily task breakdown.`,
          ],
        },
        {
          title: he ? '3.4 Community Hub — קהילה' : '3.4 Community Hub — Community',
          paragraphs: he ? [
            `פיד קהילתי עם פוסטים, תגובות, לייקים, אירועים, ודירוגים. כולל מערכת רמות קהילתיות, נקודות, ו-badges. Aurora משתתפת בשיחות כחברת קהילה AI. ניווט לפי 14 עמודי חיים ונושאים (Topics) דרך הסיידבר.`,
            `תמיכה דו-לשונית מלאה בתוכן (title_he, content_he) עם זיהוי שפה אוטומטי. אירועים קהילתיים עם RSVP, מפגשים וירטואליים, ולוח מובילים.`,
          ] : [
            `Community feed with posts, comments, likes, events, and leaderboards. Includes community levels, points, and badges. Aurora participates in conversations as an AI community member. Navigation by 14 life pillars and Topics via the sidebar.`,
            `Full bilingual content support (title_he, content_he) with automatic language detection. Community events with RSVP, virtual meetups, and leaderboards.`,
          ],
        },
        {
          title: he ? '3.5 Learn Hub — למידה' : '3.5 Learn Hub — Learning',
          paragraphs: he ? [
            `"Aurora מלמדת אותך" — מערכת למידה אדפטיבית שמייצרת קוריקולום מותאם אישית לכל משתמש. המערכת משתמשת במודל "Lazy Generation" — שלד הקורס נוצר מיידית, והתוכן מיוצר דינמית רק כשהמשתמש מגיע לשיעור ספציפי.`,
            `כל שיעור כולל תרגול מעשי שמסוכם אוטומטית ומסונכרן לתור הביצוע (Tactics Hub) כפעולות בתוכנית. כפתור "בנה את הקוריקולום!" נגיש מכל מקום במערכת דרך ה-Aurora Dock. כולל מסע אונבורדינג, מסע עסקי (10 שלבים), מסע אימון (10 שלבים), ומסע פרויקטים.`,
          ] : [
            `"Aurora Teaches You" — an adaptive learning system that generates personalized curriculum for each user. Uses a "Lazy Generation" model — course skeleton is created instantly, and content is generated dynamically only when the user reaches a specific lesson.`,
            `Each lesson includes practical exercises that are auto-summarized and synced to the execution queue (Tactics Hub) as plan actions. The "Build the Curriculum!" button is accessible from anywhere via the Aurora Dock. Includes onboarding journey, business journey (10 steps), coaching journey (10 steps), and projects journey.`,
          ],
        },
      ],
    },
    {
      id: 'aurora',
      number: '4',
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
          title: he ? '4.1 זיכרון שיחות וזיכרון ארוך טווח' : '4.1 Conversation Memory & Long-Term Memory',
          paragraphs: he ? [
            `Aurora שומרת זיכרון שיחות מלא — כולל סיכומי שיחה, נושאים מרכזיים, מצב רגשי, ופעולות שהוסכמו. הזיכרון מזורק לכל שיחה חדשה כקונטקסט, מה שמאפשר המשכיות אמיתית לאורך זמן. הזיכרון מודע לציר הזמן — אירועים אחרונים ושינויי זהות מקבלים עדיפות.`,
          ] : [
            `Aurora maintains full conversation memory — including conversation summaries, key topics, emotional state, and agreed-upon actions. Memory is injected into every new conversation as context, enabling true continuity over time. Memory is timeline-aware — recent events and identity shifts are prioritized.`,
          ],
        },
        {
          title: he ? '4.2 מערכת פרואקטיבית' : '4.2 Proactive System',
          paragraphs: he ? [
            `Aurora לא מחכה שתדבר אליה — היא פועלת פרואקטיבית. מערכת ה-Proactive Queue מזהה טריגרים (streak שנשבר, ירידה באנרגיה, משימה שנדחתה) ומייצרת דחיפות חכמות עם עדיפויות. כולל push notifications, תזכורות מתוזמנות, ומנגנון idempotency למניעת כפילויות.`,
          ] : [
            `Aurora doesn't wait for you to talk — it acts proactively. The Proactive Queue system detects triggers (broken streak, energy drop, postponed task) and generates smart nudges with priorities. Includes push notifications, scheduled reminders, and an idempotency mechanism to prevent duplicates.`,
          ],
        },
        {
          title: he ? '4.3 דפוסים התנהגותיים ואנרגטיים' : '4.3 Behavioral & Energy Patterns',
          paragraphs: he ? [
            `Aurora מנתחת דפוסי התנהגות ואנרגיה לאורך זמן — מזהה מתי המשתמש הכי פרודוקטיבי, מתי צריך מנוחה, ואילו פעילויות משפיעות על מצב הרוח. המידע משפיע על תזמון משימות, המלצות, ותוכן מותאם.`,
          ] : [
            `Aurora analyzes behavioral and energy patterns over time — identifying when the user is most productive, when rest is needed, and which activities affect mood. This data influences task timing, recommendations, and personalized content.`,
          ],
        },
      ],
    },
    {
      id: 'hypnosis',
      number: '5',
      title: he ? 'היפנוזה ומדיטציה מונחית AI' : 'AI-Guided Hypnosis & Meditation',
      paragraphs: he ? [
        `${brandName} כולל מערכת היפנוזה ומדיטציה מונחית בינה מלאכותית — סשנים מותאמים אישית שנוצרים בזמן אמת בהתבסס על מצב המשתמש, יעדיו, ודפוסי התודעה שלו.`,
        `הסשנים משלבים: (1) הנחיות קוליות מותאמות, (2) מוזיקת רקע ותדרים, (3) עבודה עם ego states ותת-מודע, (4) תרגול ויזואליזציה ואפירמציות. כל סשן מתגמל 10 MOS ומשפיע על ציון עמוד התודעה (Consciousness Pillar).`,
        `ההיפנוזה משולבת בליבת ה-AI — Aurora משתמשת בהיסטוריית סשנים קודמים כדי להתאים את התוכן, ומשלבת תובנות מעמודי חיים אחרים לתוך חווית הסשן.`,
      ] : [
        `${brandName} includes an AI-guided hypnosis and meditation system — personalized sessions generated in real-time based on the user's state, goals, and consciousness patterns.`,
        `Sessions combine: (1) personalized voice guidance, (2) background music and frequencies, (3) ego state and subconscious work, (4) visualization and affirmation practice. Each session rewards 10 MOS and affects the Consciousness Pillar score.`,
        `Hypnosis is integrated into the AI core — Aurora uses previous session history to tailor content, and weaves insights from other life pillars into the session experience.`,
      ],
    },
    {
      id: 'nft',
      number: '6',
      title: he ? 'מערכת ה-NFT — זהות דיגיטלית מתפתחת' : 'The NFT System — Evolving Digital Identity',
      paragraphs: he ? [
        `כל משתמש ב-${brandName} מחזיק ב-Orb — נכס דיגיטלי תלת-ממדי ייחודי שמייצג את הזהות, ההתקדמות, והתודעה שלו. ה-Orb אינו סטטי: הוא מתפתח בהתאם לפעולות המשתמש.`,
        `מאפייני ה-Orb: (1) צבעים — משתנים לפי עמודי חיים דומיננטיים, (2) מורפולוגיה — צורה שמתפתחת עם הרמה, (3) חלקיקים — מספר וצפיפות לפי streak ואנרגיה, (4) הילה — עוצמה וצבע לפי ציון כללי.`,
        `ה-Orb הוא גם ה-Avatar של המשתמש במערכת, מופיע בפרופיל, בקהילה, ובעתיד ייצוא כ-NFT אמיתי על blockchain.`,
      ] : [
        `Every ${brandName} user holds an Orb — a unique 3D digital asset representing their identity, progress, and consciousness. The Orb is not static: it evolves based on user actions.`,
        `Orb attributes: (1) Colors — change based on dominant life pillars, (2) Morphology — shape evolves with level, (3) Particles — count and density based on streak and energy, (4) Aura — intensity and color based on overall score.`,
        `The Orb also serves as the user's avatar in the system, appearing in profiles, community, and in the future exportable as a real NFT on blockchain.`,
      ],
    },
    {
      id: 'economy',
      number: '7',
      title: he ? 'כלכלה דיגיטלית — MOS Token' : 'Digital Economy — MOS Token',
      paragraphs: he ? [
        `MOS (Mind Operating System) הוא המטבע הפנימי של ${brandName}. שער קבוע: 100 MOS = $1.00. המטבע מבוסס על מנגנון Proof of Growth — כריית נתונים שמתגמלת פעילות אנושית אמיתית.`,
        `דרכי הרווחה: השלמת משימות (1-5 MOS), הרגלים יומיים (2-3 MOS), סשני היפנוזה (10 MOS), מכירת שירותים ב-FreeMarket, בונטי, גיגים, כרייה פאסיבית (Proof of Growth), ותוכנית שותפים.`,
        `שימושים: רכישת שירותים מקואצ'ים, רכישת קורסים, שדרוג מנוי, רכישת NFT skins, ובעתיד — המרה לכסף אמיתי דרך ה-FreeMarket.`,
      ] : [
        `MOS (Mind Operating System) is the internal currency of ${brandName}. Fixed rate: 100 MOS = $1.00. The currency is based on a Proof of Growth mechanism — data mining that rewards genuine human activity.`,
        `Earning methods: completing tasks (1-5 MOS), daily habits (2-3 MOS), hypnosis sessions (10 MOS), selling services on FreeMarket, bounties, gigs, passive mining (Proof of Growth), and affiliate program.`,
        `Uses: purchasing coach services, buying courses, upgrading subscription, purchasing NFT skins, and in the future — converting to real money via FreeMarket.`,
      ],
    },
    {
      id: 'freemarket',
      number: '8',
      title: he ? 'FreeMarket — שוק פנימי' : 'FreeMarket — Internal Marketplace',
      paragraphs: he ? [
        `FreeMarket הוא השוק הפנימי של ${brandName} — מקום בו משתמשים יכולים להרוויח MOS על ידי מכירת שירותים, ביצוע בונטי (משימות קהילתיות), וגיגים. השוק כולל שני טאבים: Earn (הרוויח) ו-Work (עבודה).`,
        `Earn כולל: בונטי (Bounties) — משימות עם תגמול MOS, גיגים (Gigs) — הצעות עבודה זמניות, ותוכנית שותפים (Partners). Work כולל: ניהול שירותים, הזמנות, ולוח בקרה לנותני שירות.`,
      ] : [
        `FreeMarket is the internal marketplace of ${brandName} — where users can earn MOS by selling services, completing bounties (community tasks), and gigs. The marketplace includes two tabs: Earn and Work.`,
        `Earn includes: Bounties — tasks with MOS rewards, Gigs — temporary work offers, and Partners (affiliate program). Work includes: service management, bookings, and a dashboard for service providers.`,
      ],
    },
    {
      id: 'coaches',
      number: '9',
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
      number: '10',
      title: he ? 'גיימיפיקציה עמוקה' : 'Deep Gamification',
      paragraphs: he ? [
        `${brandName} משתמש בגיימיפיקציה כמנוע מוטיבציה מרכזי: XP (ניקוד ניסיון), רמות (1-100+), Streaks (רצפים יומיים), Tokens (MOS), Badges, ולוחות מובילים.`,
        `כל פעולה במערכת מתגמלת XP ו-MOS: משימות, הרגלים, היפנוזה, למידה, פעילות קהילתית, ומכירות ב-FreeMarket. ה-Streak מעודד עקביות יומית ומכפיל תגמולים.`,
        `מערכת ה-Skills (מיומנויות) מאפשרת למשתמשים לצבור ניסיון בתחומים ספציפיים — כל פעולה מחולקת למשקלים שמשפיעים על מיומנויות רלוונטיות.`,
      ] : [
        `${brandName} uses gamification as a core motivation engine: XP (experience points), Levels (1-100+), Streaks (daily chains), Tokens (MOS), Badges, and Leaderboards.`,
        `Every action in the system rewards XP and MOS: tasks, habits, hypnosis, learning, community activity, and FreeMarket sales. The Streak encourages daily consistency and multiplies rewards.`,
        `The Skills system allows users to gain experience in specific domains — each action is weighted to affect relevant skills.`,
      ],
    },
    {
      id: 'subscription',
      number: '11',
      title: he ? 'מודל מנויים' : 'Subscription Model',
      paragraphs: he ? [
        `${brandName} מציע שלוש רמות מנוי: Free (חינמי), Pro, ו-Ultra. כל רמה פותחת יכולות נוספות.`,
        `Free: גישה ל-Tactics Hub, משימות בסיסיות, ו-streak. Pro: גישה מלאה לכל ה-Hubs, Aurora AI ללא הגבלה, היפנוזה, למידה, וקהילה. Ultra: כל היכולות + עדיפות AI, סשני היפנוזה VIP, ותמיכה אישית.`,
        `מחירון: Free = $0, Pro = $9.99/חודש, Ultra = $19.99/חודש. הנחות שנתיות זמינות.`,
      ] : [
        `${brandName} offers three subscription tiers: Free, Pro, and Ultra. Each tier unlocks additional capabilities.`,
        `Free: access to Tactics Hub, basic tasks, and streak. Pro: full access to all Hubs, unlimited Aurora AI, hypnosis, learning, and community. Ultra: all features + AI priority, VIP hypnosis sessions, and personal support.`,
        `Pricing: Free = $0, Pro = $9.99/month, Ultra = $19.99/month. Annual discounts available.`,
      ],
    },
    {
      id: 'data-privacy',
      number: '12',
      title: he ? 'פרטיות ואבטחת מידע' : 'Data Privacy & Security',
      paragraphs: he ? [
        `${brandName} מחויב לפרטיות המשתמשים. כל הנתונים מוצפנים, מאוחסנים בענן מאובטח (Supabase), ונגישים רק למשתמש עצמו דרך Row-Level Security (RLS).`,
        `המערכת לא מוכרת נתונים לצדדים שלישיים. נתוני AI משמשים אך ורק לשיפור חווית המשתמש. המשתמש יכול למחוק את כל הנתונים שלו בכל עת.`,
      ] : [
        `${brandName} is committed to user privacy. All data is encrypted, stored in secure cloud infrastructure (Supabase), and accessible only to the user through Row-Level Security (RLS).`,
        `The system does not sell data to third parties. AI data is used solely to improve user experience. Users can delete all their data at any time.`,
      ],
    },
    {
      id: 'tech-stack',
      number: '13',
      title: he ? 'סטאק טכנולוגי' : 'Technology Stack',
      paragraphs: he ? [
        `Frontend: React + TypeScript + Tailwind CSS + Framer Motion. Backend: Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime). AI: Gemini 2.5 Pro/Flash, GPT-5, מודלים מולטימודליים.`,
        `תשתית: Lovable AI לפיתוח מהיר, Vite כ-build tool, PWA support למובייל. הפלטפורמה responsive לחלוטין עם תמיכה מלאה ב-RTL (עברית).`,
      ] : [
        `Frontend: React + TypeScript + Tailwind CSS + Framer Motion. Backend: Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime). AI: Gemini 2.5 Pro/Flash, GPT-5, multimodal models.`,
        `Infrastructure: Lovable AI for rapid development, Vite as build tool, PWA support for mobile. The platform is fully responsive with complete RTL (Hebrew) support.`,
      ],
    },
    {
      id: 'roadmap',
      number: '14',
      title: he ? 'מפת דרכים' : 'Roadmap',
      paragraphs: he ? [
        `Q1 2026: השקת Beta ציבורי, 5 Hubs פעילים, מערכת MOS, היפנוזה AI. Q2 2026: פלטפורמת מאמנים, FreeMarket, תוכנית שותפים. Q3 2026: NFT Orb export, אפליקציית מובייל, integrations. Q4 2026: API פתוח, שותפויות B2B, הרחבה גלובלית.`,
        `2027: Blockchain integration, DAO governance, מטבע MOS על רשת מבוזרת, שוק NFT חיצוני.`,
      ] : [
        `Q1 2026: Public Beta launch, 5 active Hubs, MOS system, AI hypnosis. Q2 2026: Coach platform, FreeMarket, affiliate program. Q3 2026: NFT Orb export, mobile app, integrations. Q4 2026: Open API, B2B partnerships, global expansion.`,
        `2027: Blockchain integration, DAO governance, MOS token on decentralized network, external NFT marketplace.`,
      ],
    },
    {
      id: 'team',
      number: '15',
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
        `${brandName} אינו עוד מוצר בשוק רווי. הוא קטגוריה חדשה — Human Operating System — שמאחדת AI תודעתי, כלכלה דיגיטלית, וזהות NFT לתוך חוויה אחת שעוטפת את חיי המשתמש.`,
        `הפלטפורמה מציעה: מנוע AI שמכיר אותך לעומק, היפנוזה ומדיטציה מונחית, מערכת למידה אדפטיבית, שוק פנימי עם כלכלה אמיתית, פלטפורמת מאמנים מלאה, קהילה פעילה, ותוכנית שותפים. הכל מחובר, הכל גיימיפי, הכל בשירות הצמיחה האישית.`,
        `בעולם שבו אנשים מוצפים, מנותקים, ומחפשים כיוון — ${brandName} הוא מערכת ההפעלה שתנהל את ההכל. לא רק פרודוקטיביות. לא רק מיינדפולנס. את החיים עצמם.`,
      ] : [
        `${brandName} is not just another product in a saturated market. It is a new category — Human Operating System — that unifies consciousness AI, digital economy, and NFT identity into a single experience that wraps around the user's life.`,
        `The platform offers: an AI engine that deeply knows you, guided hypnosis and meditation, an adaptive learning system, an internal marketplace with real economy, a full coach platform, an active community, and an affiliate program. Everything connected, everything gamified, everything in service of personal growth.`,
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
                <p>{he ? 'גרסה 2.0 · מרץ 2026' : 'Version 2.0 · March 2026'}</p>
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

                {section.paragraphs.map((p, j) => (
                  <p key={j} dir={isRTL ? 'rtl' : 'ltr'} className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                    {p}
                  </p>
                ))}

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
