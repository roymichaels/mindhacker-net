import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';

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

  const brandName = he ? theme.brand_name : theme.brand_name_en;
  const founderName = he ? theme.founder_name : theme.founder_name_en;
  const founderTitle = he ? theme.founder_title : theme.founder_title_en;

  const abstractText = he
    ? `${brandName} הוא מערכת הפעלה אישית מבוססת בינה מלאכותית, המשלבת מנגנוני Play-to-Earn (P2E), נכסים דיגיטליים ייחודיים (NFTs), וגיימיפיקציה עמוקה, לתוך פלטפורמה אחת שעוטפת את חיי המשתמש. המסמך מציג את הארכיטקטורה, הכלכלה הדיגיטלית, מערכת ה-AI התודעתית (Aurora), ומודל הצמיחה של הפרויקט. המטבע הפנימי MOS (100 MOS = $1.00) מבוסס על מנגנון Proof of Growth — מודל כריית נתונים שמתגמל פעילות אנושית אמיתית.`
    : `${brandName} is an AI-powered Personal Operating System that integrates Play-to-Earn (P2E) mechanics, unique digital assets (NFTs), and deep gamification into a single platform that wraps around the user's life. This paper presents the architecture, digital economy, consciousness AI engine (Aurora), and growth model of the project. The internal currency MOS (100 MOS = $1.00) is based on a Proof of Growth mechanism — a data mining model that rewards genuine human activity.`;

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
      title: he ? 'הפתרון' : 'The Solution',
      paragraphs: he ? [
        `${brandName} הוא Human Operating System — מערכת הפעלה אנושית שמאחדת את כל ממדי החיים תחת קורת גג אחת. הפלטפורמה בנויה מחמישה Hubs:`,
      ] : [
        `${brandName} is a Human Operating System that unifies all life dimensions under one roof. The platform is built from five Hubs:`,
      ],
      subsections: [
        {
          title: he ? '3.1 Now Hub — מרכז השליטה' : '3.1 Now Hub — Command Center',
          paragraphs: he ? [
            `הדשבורד המרכזי מציג סטטוס יומי בזמן אמת: משימות, הרגלים, אנרגיה, streak, XP, וטוקנים. Aurora (ה-AI) מופיעה כאורב תלת-ממדי שמשתנה בהתאם למצב המשתמש ומציעה פעולות פרואקטיביות.`,
          ] : [
            `The central dashboard displays real-time daily status: tasks, habits, energy, streak, XP, and tokens. Aurora (the AI) appears as a 3D orb that changes based on user state and suggests proactive actions.`,
          ],
        },
        {
          title: he ? '3.2 Tactics Hub — ביצוע' : '3.2 Tactics Hub — Execution',
          paragraphs: he ? [
            `ניהול משימות, פרויקטים, Sprints, ו-Milestones. כולל תכנון יומי/שבועי/חודשי חכם עם תעדוף AI, זמן-בלוקינג, ו-subtasks היררכיים.`,
          ] : [
            `Task management, projects, sprints, and milestones. Includes smart daily/weekly/monthly planning with AI prioritization, time-blocking, and hierarchical subtasks.`,
          ],
        },
        {
          title: he ? '3.3 Strategy Hub — אסטרטגיה' : '3.3 Strategy Hub — Strategy',
          paragraphs: he ? [
            `מנתח את חיי המשתמש דרך 14 עמודי חיים (Pillars): נוכחות, כוח, חיוניות, פוקוס, לחימה, התרחבות, תודעה, עושר, השפעה, מערכות יחסים, עסקים, פרויקטים, משחק, ועוד. כל עמוד נסרק באמצעות AI, מקבל ציון (0-100), ומייצר תוכנית שיפור מותאמת אישית. כולל תכונות אופי (Traits) ומשימות חיים (Missions).`,
          ] : [
            `Analyzes the user's life through 14 Life Pillars: Presence, Power, Vitality, Focus, Combat, Expansion, Consciousness, Wealth, Influence, Relationships, Business, Projects, Play, and more. Each pillar is scanned by AI, scored (0-100), and generates a personalized improvement plan. Includes character Traits and life Missions.`,
          ],
        },
        {
          title: he ? '3.4 Community Hub — קהילה' : '3.4 Community Hub — Community',
          paragraphs: he ? [
            `פיד קהילתי עם פוסטים, תגובות, לייקים, אירועים, ודירוגים. כולל מערכת רמות קהילתיות, נקודות, ו-badges. Aurora משתתפת בשיחות כחברת קהילה AI.`,
          ] : [
            `Community feed with posts, comments, likes, events, and leaderboards. Includes community levels, points, and badges. Aurora participates in conversations as an AI community member.`,
          ],
        },
        {
          title: he ? '3.5 Learn Hub — למידה' : '3.5 Learn Hub — Learning',
          paragraphs: he ? [
            `קורסים, מסעות מונחים, ותוכן מותאם אישית. כולל מסע אונבורדינג, מסע עסקי, מסע אימון, ומסע פרויקטים — כולם עם AI שמלווה ומתאים את התוכן למשתמש.`,
          ] : [
            `Courses, guided journeys, and personalized content. Includes onboarding journey, business journey, coaching journey, and projects journey — all with AI that accompanies and adapts content to the user.`,
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
        `המודל משתמש ב-Gemini 2.5 Pro/Flash ו-GPT-5 עם system prompts מותאמים שכוללים את הפרופיל המלא של המשתמש, היסטוריית שיחות, ציוני עמודים, ומצב רגשי נוכחי.`,
      ] : [
        `Aurora is the intelligence core of ${brandName}. It is not a regular chatbot — but a consciousness engine that learns behavioral patterns, identifies emotional states, and generates proactive actions.`,
        `Aurora manages: (1) context-aware personal conversations, (2) daily/weekly action plans, (3) deep scans for 14 life pillars, (4) proactive reminders and nudges, (5) energy pattern analysis, (6) ego state and consciousness level detection.`,
        `The model uses Gemini 2.5 Pro/Flash and GPT-5 with custom system prompts that include the user's full profile, conversation history, pillar scores, and current emotional state.`,
      ],
    },
    {
      id: 'nft',
      number: '5',
      title: he ? 'מערכת ה-NFT — זהות דיגיטלית מתפתחת' : 'The NFT System — Evolving Digital Identity',
      paragraphs: he ? [
        `כל משתמש ב-${brandName} מחזיק ב-Orb — נכס דיגיטלי תלת-ממדי ייחודי שמייצג את הזהות, ההתקדמות, והתודעה שלו. ה-Orb אינו סטטי: הוא מתפתח בהתאם לפעולות המשתמש.`,
        `פרמטרי ה-Orb מחושבים מ: ציוני עמודי חיים (צבעים), רמת משתמש (geometry detail), streak (particle count), מצב רגשי (morph speed), ותכונות אופי פתוחות (secondary colors). ה-Orb מרונדר בזמן אמת באמצעות Three.js.`,
        `ה-Orb Gallery בדף הבית מציג ארכיטיפים — "עורות" שונים שמייצגים דפוסי התפתחות. בעתיד, Orbs יהיו ניתנים למסחר כ-NFTs על רשת Solana, ויישאו metadata של ההתקדמות האמיתית של המשתמש.`,
        `תכונות אופי (Traits) נפתחות דרך סריקות ומשימות, ומייצגות תעודות הישג דיגיטליות. כל Trait משפיע על המראה והיכולות של ה-Orb.`,
      ] : [
        `Every ${brandName} user holds an Orb — a unique 3D digital asset representing their identity, progress, and consciousness. The Orb is not static: it evolves based on user actions.`,
        `Orb parameters are computed from: life pillar scores (colors), user level (geometry detail), streak (particle count), emotional state (morph speed), and unlocked character traits (secondary colors). The Orb is rendered in real-time using Three.js.`,
        `The Orb Gallery on the homepage showcases archetypes — different "skins" representing development patterns. In the future, Orbs will be tradeable as NFTs on the Solana network, carrying metadata of the user's real progress.`,
        `Character Traits are unlocked through scans and missions, representing digital achievement certificates. Each Trait affects the Orb's appearance and capabilities.`,
      ],
    },
    {
      id: 'tokenomics',
      number: '6',
      title: he ? 'טוקנומיקס — כלכלת Proof of Growth' : 'Tokenomics — Proof of Growth Economy',
      paragraphs: he ? [
        `המטבע הפנימי של ${brandName} הוא MOS (Mind Operating System token). שער: 100 MOS = $1.00 USD.`,
        `מנגנון הכרייה (Mining Engine) מתגמל פעילות אנושית אמיתית:`,
        `• סשן היפנוזה/מדיטציה: 10 MOS\n• השלמת הרגל: 3 MOS\n• פוסט בקהילה: 8 MOS\n• תגובה בקהילה: 3 MOS\n• שיעור למידה: 5 MOS`,
        `תקרה יומית: 200 MOS ($2.00). כל פעולת כרייה נרשמת ב-fm_mining_logs לשקיפות מלאה.`,
        `מודל ההכנסה של הפלטפורמה כולל: (1) מנויים חודשיים (Freemium → Pro → Premium), (2) FreeMarket — שוק פנימי לשירותים ומוצרים, (3) Data Marketplace — מכירת תובנות אנונימיות עם חלוקת הכנסות 80/20 למשתמשים, (4) פלטפורמת מאמנים עם דמי subscription.`,
      ] : [
        `The internal currency of ${brandName} is MOS (Mind Operating System token). Rate: 100 MOS = $1.00 USD.`,
        `The Mining Engine rewards genuine human activity:`,
        `• Hypnosis/meditation session: 10 MOS\n• Habit completion: 3 MOS\n• Community post: 8 MOS\n• Community comment: 3 MOS\n• Learning lesson: 5 MOS`,
        `Daily cap: 200 MOS ($2.00). Every mining action is logged in fm_mining_logs for full transparency.`,
        `Platform revenue model includes: (1) Monthly subscriptions (Freemium → Pro → Premium), (2) FreeMarket — internal marketplace for services and products, (3) Data Marketplace — selling anonymized insights with 80/20 revenue share to users, (4) Coach platform with subscription fees.`,
      ],
      subsections: [
        {
          title: he ? '6.1 Data Marketplace' : '6.1 Data Marketplace',
          paragraphs: he ? [
            `המשתמשים יכולים להסכים למכירת נתונים אנונימיים (fm_data_consent). הנתונים עוברים צינור אנונימיזציה (fm_data_snapshots) עם סף מינימום של 10 משתתפים לשמירת פרטיות. הכנסות מופצות אוטומטית למשתתפים (80%) באמצעות fm_distribute_revenue.`,
          ] : [
            `Users can opt-in to anonymized data sales (fm_data_consent). Data passes through an anonymization pipeline (fm_data_snapshots) with a minimum 10-contributor threshold for privacy. Revenue is automatically distributed to contributors (80%) via fm_distribute_revenue.`,
          ],
        },
        {
          title: he ? '6.2 ארנק ותשלומים' : '6.2 Wallet & Settlement',
          paragraphs: he ? [
            `כל משתמש מחזיק ארנק פנימי (fm_wallets) עם ספר חשבונות (fm_transactions). Settlement אסינכרוני לפיאט (Stripe) או טוקנים (Solana SPL) דרך fm_settlement_outbox. ממשק המשתמש כולל "מצב פשוט" (נקודות/בנק) ו"מצב מתקדם" (כתובות Solana).`,
          ] : [
            `Each user holds an internal wallet (fm_wallets) with a ledger (fm_transactions). Asynchronous settlement to fiat (Stripe) or tokens (Solana SPL) via fm_settlement_outbox. UI includes "Simple Mode" (points/bank) and "Advanced Mode" (Solana addresses).`,
          ],
        },
      ],
    },
    {
      id: 'gamification',
      number: '7',
      title: he ? 'גיימיפיקציה — Build Your Empire' : 'Gamification — Build Your Empire',
      paragraphs: he ? [
        `${brandName} מפעיל נרטיב "בנה את האימפריה שלך" — כל משתמש בונה אימפריה דיגיטלית שמשקפת את חייו האמיתיים.`,
        `מנגנוני הגיימיפיקציה: (1) XP + Levels — כל פעולה מניבה XP, עלייה ברמה פותחת יכולות חדשות. (2) Streak — רצף יומי שמגביר בונוסים. (3) Tokens (MOS) — מטבע P2E אמיתי. (4) Character Traits — תכונות אופי שנפתחות דרך סריקות. (5) Missions — משימות חיים ארוכות טווח. (6) Orb Evolution — ה-NFT מתפתח עם כל התקדמות.`,
        `הסיפור מוצג דרך אסתטיקה קולנועית-גיימינג: Hero section עם Orb מרכזי, NFT Gallery עם ארכיטיפים, רשת "רבעים" (Districts) של פיצ'רים, כרטיסי Traits זוהרים, ו-Blueprint אנימציה של תוכנית AI.`,
      ] : [
        `${brandName} operates a "Build Your Empire" narrative — each user builds a digital empire that mirrors their real life.`,
        `Gamification mechanics: (1) XP + Levels — every action earns XP, leveling up unlocks new capabilities. (2) Streak — daily consistency that amplifies bonuses. (3) Tokens (MOS) — real P2E currency. (4) Character Traits — unlocked through scans. (5) Missions — long-term life quests. (6) Orb Evolution — the NFT evolves with every advancement.`,
        `The narrative is presented through cinematic gaming aesthetics: Hero section with a central Orb, NFT Gallery with archetypes, a "Districts" grid of features, glowing Trait cards, and an animated AI Blueprint sequence.`,
      ],
    },
    {
      id: 'architecture',
      number: '8',
      title: he ? 'ארכיטקטורה טכנית' : 'Technical Architecture',
      paragraphs: he ? [
        `Frontend: React 18 + TypeScript + Vite + Tailwind CSS. ממשק מלא RTL/LTR עם תמיכה דו-לשונית (עברית/אנגלית). PWA עם service worker, התקנה, ו-push notifications.`,
        `Backend: Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime). Row-Level Security (RLS) על כל הטבלאות. Edge Functions ל-AI, תשלומים, ולוגיקה עסקית.`,
        `AI: Gemini 2.5 Pro/Flash, GPT-5 — דרך Lovable AI gateway ללא צורך ב-API key. System prompts דינמיים עם context מלא של המשתמש.`,
        `3D Rendering: Three.js עם custom shaders ל-Orb. Morph targets, particle systems, ו-dynamic color mapping מציוני עמודים.`,
        `Payments: Stripe integration עם Solana roadmap. ארנק custodial פנימי עם settlement אסינכרוני.`,
      ] : [
        `Frontend: React 18 + TypeScript + Vite + Tailwind CSS. Full RTL/LTR interface with bilingual support (Hebrew/English). PWA with service worker, installation, and push notifications.`,
        `Backend: Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime). Row-Level Security (RLS) on all tables. Edge Functions for AI, payments, and business logic.`,
        `AI: Gemini 2.5 Pro/Flash, GPT-5 — through Lovable AI gateway without API key. Dynamic system prompts with full user context.`,
        `3D Rendering: Three.js with custom shaders for Orb. Morph targets, particle systems, and dynamic color mapping from pillar scores.`,
        `Payments: Stripe integration with Solana roadmap. Internal custodial wallet with asynchronous settlement.`,
      ],
    },
    {
      id: 'coaches',
      number: '9',
      title: he ? 'פלטפורמת מאמנים' : 'Coach Platform',
      paragraphs: he ? [
        `${brandName} כולל תשתית B2B2C למאמנים, מטפלים, ויועצים. כל מאמן מקבל: (1) דף נחיתה אישי עם slug ייחודי, (2) ניהול לקוחות עם תוכניות AI מותאמות, (3) ניהול שירותים, זמני פגישות, ותשלומים, (4) מערכת Leads + CRM.`,
        `המאמנים משתמשים באותה תשתית AI — Aurora מייצרת תוכניות מותאמות ללקוחות המאמן, מה שמגדיל retention ומאפשר מעקב בזמן אמת.`,
      ] : [
        `${brandName} includes a B2B2C infrastructure for coaches, therapists, and consultants. Each coach receives: (1) personal landing page with unique slug, (2) client management with AI-adapted plans, (3) service management, booking, and payments, (4) Leads + CRM system.`,
        `Coaches use the same AI infrastructure — Aurora generates plans adapted for each coach's clients, increasing retention and enabling real-time tracking.`,
      ],
    },
    {
      id: 'market',
      number: '10',
      title: he ? 'גודל שוק ותחרות' : 'Market Size & Competition',
      paragraphs: he ? [
        `TAM: שוק הפיתוח האישי הגלובלי — $44B (2024). שוק ה-Mental Wellness Apps — $7B. שוק ה-P2E Gaming — $15B. שוק ה-AI Coaching — $2.5B.`,
        `מתחרים ישירים: Headspace (מדיטציה בלבד), Notion (פרודוקטיביות בלבד), Habitica (גיימיפיקציה שטחית), BetterUp (אימון ארגוני). אף אחד מהם לא מאחד את כל התחומים עם AI אישי + כלכלה דיגיטלית + NFTs.`,
        `היתרון של ${brandName}: (1) מנוע AI תודעתי שמכיר את כל המשתמש, (2) P2E אמיתי עם ערך כלכלי, (3) NFT Orb כזהות דיגיטלית, (4) 14 ממדי חיים ולא רק פרודוקטיביות, (5) תשתית white-label, (6) פלטפורמת מאמנים משולבת.`,
      ] : [
        `TAM: Global personal development market — $44B (2024). Mental wellness apps — $7B. P2E gaming — $15B. AI coaching — $2.5B.`,
        `Direct competitors: Headspace (meditation only), Notion (productivity only), Habitica (shallow gamification), BetterUp (corporate coaching). None unifies all domains with personal AI + digital economy + NFTs.`,
        `${brandName}'s advantage: (1) Consciousness AI engine that knows the whole user, (2) real P2E with economic value, (3) NFT Orb as digital identity, (4) 14 life dimensions not just productivity, (5) white-label infrastructure, (6) integrated coach platform.`,
      ],
    },
    {
      id: 'roadmap',
      number: '11',
      title: he ? 'מפת דרכים' : 'Roadmap',
      paragraphs: he ? [
        `Q1 2026 — השקת MVP: 5 Hubs, Aurora AI, מערכת Orb, גיימיפיקציה בסיסית, פלטפורמת מאמנים.`,
        `Q2 2026 — P2E Launch: Mining Engine, ארנק MOS, FreeMarket, Data Marketplace (beta).`,
        `Q3 2026 — NFT Mint: Orb NFTs על Solana, Trait NFTs, שוק משני.`,
        `Q4 2026 — Scale: אפליקציה native (React Native), API ציבורי, white-label לארגונים, הרחבת שפות.`,
        `2027 — DAO: ממשל קהילתי, הצבעות על פיצ'רים, treasury management.`,
      ] : [
        `Q1 2026 — MVP Launch: 5 Hubs, Aurora AI, Orb system, basic gamification, coach platform.`,
        `Q2 2026 — P2E Launch: Mining Engine, MOS wallet, FreeMarket, Data Marketplace (beta).`,
        `Q3 2026 — NFT Mint: Orb NFTs on Solana, Trait NFTs, secondary marketplace.`,
        `Q4 2026 — Scale: Native app (React Native), public API, white-label for organizations, language expansion.`,
        `2027 — DAO: Community governance, feature voting, treasury management.`,
      ],
    },
    {
      id: 'team',
      number: '12',
      title: he ? 'צוות' : 'Team',
      paragraphs: he ? [
        `מייסד ומנכ"ל: ${founderName} — ${founderTitle}. חזון, ארכיטקטורה, ו-product.`,
        `AI & Development: ${brandName} נבנה בשיתוף עם Lovable AI — פלטפורמת פיתוח מבוססת AI שמאפשרת יצירת מוצרים מורכבים בקצב חסר תקדים.`,
        `ישות משפטית: ${theme.company_legal_name}, ${theme.company_country}.`,
      ] : [
        `Founder & CEO: ${founderName} — ${founderTitle}. Vision, architecture, and product.`,
        `AI & Development: ${brandName} is built in collaboration with Lovable AI — an AI-powered development platform enabling creation of complex products at unprecedented speed.`,
        `Legal entity: ${theme.company_legal_name}, ${theme.company_country}.`,
      ],
    },
    {
      id: 'conclusion',
      number: '13',
      title: he ? 'סיכום' : 'Conclusion',
      paragraphs: he ? [
        `${brandName} אינו עוד מוצר בשוק רווי. הוא קטגוריה חדשה — Human Operating System — שמאחדת AI תודעתי, כלכלה דיגיטלית, וזהות NFT לתוך חוויה אחת שעוטפת את חיי המשתמש.`,
        `בעולם שבו אנשים מוצפים, מנותקים, ומחפשים כיוון — ${brandName} הוא מערכת ההפעלה שתנהל את ההכל. לא רק פרודוקטיביות. לא רק מיינדפולנס. את החיים עצמם.`,
      ] : [
        `${brandName} is not just another product in a saturated market. It is a new category — Human Operating System — that unifies consciousness AI, digital economy, and NFT identity into a single experience that wraps around the user's life.`,
        `In a world where people are overwhelmed, disconnected, and searching for direction — ${brandName} is the operating system that will manage everything. Not just productivity. Not just mindfulness. Life itself.`,
      ],
    },
  ];

  const tocItems = sections.map(s => ({ id: s.id, number: s.number, title: s.title }));

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto flex items-center h-14 px-4 gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <AuroraOrbIcon className="w-7 h-7 text-foreground" size={28} />
          <span className="font-bold text-foreground text-sm">{brandName}</span>
          <span className="text-muted-foreground text-sm">—</span>
          <span className="text-muted-foreground text-sm">{he ? 'ספר לבן' : 'White Paper'}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
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
              ? 'ספר לבן — AI · NFT · Play-to-Earn · גיימיפיקציה · פיתוח אישי'
              : 'White Paper — AI · NFT · Play-to-Earn · Gamification · Personal Development'
            }
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{he ? `מאת ${founderName}` : `By ${founderName}`}</p>
            <p>{theme.company_legal_name} · {theme.company_country}</p>
            <p>{he ? 'גרסה 1.0 · מרץ 2026' : 'Version 1.0 · March 2026'}</p>
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
          <p className="text-muted-foreground leading-relaxed text-sm">{abstractText}</p>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-xl border border-border bg-card/50 p-6 space-y-3"
        >
          <h2 className="text-lg font-bold text-foreground">{he ? 'תוכן עניינים' : 'Table of Contents'}</h2>
          <nav className="grid gap-1.5">
            {tocItems.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
              >
                <span className="font-mono text-xs text-primary/60 w-6">{item.number}.</span>
                <span>{item.title}</span>
              </a>
            ))}
          </nav>
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
              <p key={j} className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                {p}
              </p>
            ))}

            {section.subsections?.map((sub, k) => (
              <div key={k} className="ms-4 border-s-2 border-primary/20 ps-4 space-y-2 pt-2">
                <h3 className="text-base font-semibold text-foreground">{sub.title}</h3>
                {sub.paragraphs.map((p, j) => (
                  <p key={j} className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{p}</p>
                ))}
              </div>
            ))}
          </motion.section>
        ))}

        {/* Disclaimer */}
        <div className="text-center pt-10 pb-24 border-t border-border space-y-3">
          <p className="text-xs text-muted-foreground/80 max-w-xl mx-auto">
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
    </div>
  );
}
