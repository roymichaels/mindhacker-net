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
      number: '7',
      title: he ? 'טוקנומיקס — כלכלת Proof of Growth' : 'Tokenomics — Proof of Growth Economy',
      paragraphs: he ? [
        `המטבע הפנימי של ${brandName} הוא MOS (Mind Operating System token). שער: 100 MOS = $1.00 USD.`,
        `מנגנון הכרייה (Mining Engine) מתגמל פעילות אנושית אמיתית:`,
        `• סשן היפנוזה/מדיטציה: 10 MOS\n• השלמת הרגל: 3 MOS\n• פוסט בקהילה: 8 MOS\n• תגובה בקהילה: 3 MOS\n• שיעור למידה: 5 MOS`,
        `תקרה יומית: 200 MOS ($2.00). כל פעולת כרייה נרשמת ב-fm_mining_logs לשקיפות מלאה. המנגנון כולל cooldowns וולידציה למניעת ניצול.`,
      ] : [
        `The internal currency of ${brandName} is MOS (Mind Operating System token). Rate: 100 MOS = $1.00 USD.`,
        `The Mining Engine rewards genuine human activity:`,
        `• Hypnosis/meditation session: 10 MOS\n• Habit completion: 3 MOS\n• Community post: 8 MOS\n• Community comment: 3 MOS\n• Learning lesson: 5 MOS`,
        `Daily cap: 200 MOS ($2.00). Every mining action is logged in fm_mining_logs for full transparency. The engine includes cooldowns and validation to prevent exploitation.`,
      ],
      subsections: [
        {
          title: he ? '7.1 Data Marketplace — שוק נתונים' : '7.1 Data Marketplace',
          paragraphs: he ? [
            `המשתמשים יכולים להסכים למכירת נתונים אנונימיים דרך מערכת הסכמה גרנולרית (fm_data_consent). הנתונים עוברים צינור אנונימיזציה (fm_data_snapshots) עם סף מינימום של 10 משתתפים לשמירת פרטיות. הכנסות מופצות אוטומטית למשתתפים (80%) — המשתמש מרוויח מהנתונים שלו עצמו.`,
          ] : [
            `Users can opt-in to anonymized data sales through a granular consent system (fm_data_consent). Data passes through an anonymization pipeline (fm_data_snapshots) with a minimum 10-contributor threshold for privacy. Revenue is automatically distributed to contributors (80%) — users profit from their own data.`,
          ],
        },
        {
          title: he ? '7.2 ארנק ותשלומים' : '7.2 Wallet & Settlement',
          paragraphs: he ? [
            `כל משתמש מחזיק ארנק פנימי (fm_wallets) עם ספר חשבונות (fm_transactions). Settlement אסינכרוני לפיאט (Stripe) או טוקנים (Solana SPL) דרך fm_settlement_outbox. ממשק המשתמש כולל "מצב פשוט" (נקודות/בנק) למשתמשים רגילים ו"מצב מתקדם" (כתובות Solana) למשתמשים טכניים. כולל תמיכה ב-Cashout לפיאט וגשר (Bridge) ל-Solana.`,
          ] : [
            `Each user holds an internal wallet (fm_wallets) with a ledger (fm_transactions). Asynchronous settlement to fiat (Stripe) or tokens (Solana SPL) via fm_settlement_outbox. UI includes "Simple Mode" (points/bank) for regular users and "Advanced Mode" (Solana addresses) for technical users. Includes fiat Cashout and Solana Bridge support.`,
          ],
        },
        {
          title: he ? '7.3 מודל הכנסה' : '7.3 Revenue Model',
          paragraphs: he ? [
            `מודל ההכנסה של הפלטפורמה כולל: (1) מנויים חודשיים בשלוש רמות (ראו סעיף 12), (2) FreeMarket — שוק פנימי לשירותים ומוצרים (ראו סעיף 8), (3) Data Marketplace — מכירת תובנות אנונימיות עם חלוקת הכנסות 80/20, (4) פלטפורמת מאמנים עם דמי מנוי (ראו סעיף 10), (5) עמלות עסקאות בשוק הפנימי.`,
          ] : [
            `Platform revenue model includes: (1) Monthly subscriptions in three tiers (see section 12), (2) FreeMarket — internal marketplace (see section 8), (3) Data Marketplace — anonymized insights with 80/20 revenue share, (4) Coach platform with subscription fees (see section 10), (5) Internal marketplace transaction fees.`,
          ],
        },
      ],
    },
    {
      id: 'freemarket',
      number: '8',
      title: he ? 'FreeMarket — השוק הפנימי' : 'FreeMarket — Internal Marketplace',
      paragraphs: he ? [
        `FreeMarket הוא שוק פנימי שבו משתמשים יכולים לקנות, למכור, ולהחליף שירותים ומוצרים באמצעות טוקני MOS. השוק בנוי סביב שלושה טאבים:`,
        `(1) Home — סקירת שוק עם סטטיסטיקות, מוצרים מובילים, ופעילות אחרונה. (2) Earn — כרייה (Mining), Data Marketplace, ומשימות תגמול. (3) Work — פרסום שירותים, ניהול הזמנות, ומכירת מוצרים דיגיטליים. כולל Wallet מובנה עם היסטוריית עסקאות.`,
        `המשתמשים עוברים Onboarding ייעודי ל-FreeMarket עם הסבר על הכלכלה, הארנק, ומנגנוני הכרייה. Progressive Disclosure מבטיח שמשתמשים חדשים לא מוצפים.`,
      ] : [
        `FreeMarket is an internal marketplace where users can buy, sell, and exchange services and products using MOS tokens. The market is built around three tabs:`,
        `(1) Home — market overview with statistics, top products, and recent activity. (2) Earn — Mining, Data Marketplace, and reward quests. (3) Work — publish services, manage orders, and sell digital products. Includes a built-in Wallet with transaction history.`,
        `Users go through a dedicated FreeMarket onboarding explaining the economy, wallet, and mining mechanics. Progressive Disclosure ensures new users aren't overwhelmed.`,
      ],
    },
    {
      id: 'gamification',
      number: '9',
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
      subsections: [
        {
          title: he ? '9.1 תוכניות חיים ואבני דרך' : '9.1 Life Plans & Milestones',
          paragraphs: he ? [
            `${brandName} מייצר תוכניות חיים ארוכות טווח (100 ימי טרנספורמציה) עם אבני דרך שבועיות. כל אבן דרך כוללת משימות ספציפיות, תגמולי XP וטוקנים, ומדדי הצלחה. התוכנית נוצרת על ידי Aurora בהתאם לסריקות העמודים ומתעדכנת דינמית — השלמת סריקות חדשות מזריקה אסטרטגיות לתוכנית הפעילה ללא צורך בייצור מחדש.`,
          ] : [
            `${brandName} generates long-term life plans (100-day transformation) with weekly milestones. Each milestone includes specific tasks, XP and token rewards, and success metrics. The plan is generated by Aurora based on pillar scans and updates dynamically — completing new assessments injects strategies into the active plan without full regeneration.`,
          ],
        },
        {
          title: he ? '9.2 Daily Minimums — מינימום יומי' : '9.2 Daily Minimums',
          paragraphs: he ? [
            `מערכת "מינימום יומי" מאפשרת למשתמשים להגדיר פעולות בסיסיות שהם מתחייבים לעשות כל יום — גם בימים קשים. המנגנון שומר על streak פעיל ומונע "אפקט הכל-או-כלום".`,
          ] : [
            `The "Daily Minimums" system lets users define basic actions they commit to daily — even on tough days. This mechanism maintains an active streak and prevents the "all-or-nothing" effect.`,
          ],
        },
      ],
    },
    {
      id: 'coaches',
      number: '10',
      title: he ? 'פלטפורמת מאמנים (Coach OS)' : 'Coach Platform (Coach OS)',
      paragraphs: he ? [
        `${brandName} כולל תשתית B2B2C מלאה למאמנים, מטפלים, ויועצים. הפלטפורמה פועלת כשוק דו-צדדי: משתמשים מוצאים מאמנים, ומאמנים מנהלים את העסק שלהם.`,
      ] : [
        `${brandName} includes a full B2B2C infrastructure for coaches, therapists, and consultants. The platform operates as a two-sided marketplace: users find coaches, and coaches manage their business.`,
      ],
      subsections: [
        {
          title: he ? '10.1 Coach Hub — ניהול עסקי' : '10.1 Coach Hub — Business Management',
          paragraphs: he ? [
            `כל מאמן מקבל "Coach OS" משולב עם 10 טאבים: (1) CRM לקוחות — ניהול מחזור חיים מלא כולל היסטוריית סשנים, הערות פרטיות, ומעקב סטטוס. (2) ניהול Leads — מעקב לקוחות פוטנציאליים מדפי נחיתה. (3) תוכן ומוצרים — יצירת מאמרים, קורסים, וסרטונים. (4) שירותים — ניהול סוגי שירות, תמחור, ומשכי זמן. (5) הזמנות (Bookings) — ניהול לוח זמנים ופגישות. (6) Analytics — מדדי KPI בזמן אמת, לקוחות פעילים, דירוגים, ופאנל המרות.`,
          ] : [
            `Each coach receives an integrated "Coach OS" with 10 tabs: (1) Client CRM — full lifecycle management with session history, private notes, and status tracking. (2) Lead Management — tracking potential clients from landing pages. (3) Content & Products — creating articles, courses, and videos. (4) Services — managing service types, pricing, and durations. (5) Bookings — schedule and appointment management. (6) Analytics — real-time KPI metrics, active clients, ratings, and conversion funnel.`,
          ],
        },
        {
          title: he ? '10.2 דפי נחיתה ושוק מאמנים' : '10.2 Landing Pages & Coach Marketplace',
          paragraphs: he ? [
            `כל מאמן מקבל דף נחיתה אישי עם slug ייחודי, תבניות מעוצבות, ומטא-דאטה ל-SEO. משתמשים חדשים שנכנסים לשוק המאמנים יכולים לבחור: "מצא מאמן" (אשף התאמה AI בן 4 שלבים) או "הפוך למאמן" (ניתוב לעמוד מנויים).`,
            `המאמנים משתמשים באותה תשתית AI — Aurora מייצרת תוכניות מותאמות ללקוחות המאמן, מה שמגדיל retention ומאפשר מעקב בזמן אמת.`,
          ] : [
            `Each coach gets a personal landing page with unique slug, designed templates, and SEO metadata. New users entering the coach marketplace can choose: "Find a Coach" (4-step AI matching wizard) or "Become a Coach" (routed to subscription page).`,
            `Coaches use the same AI infrastructure — Aurora generates plans adapted for each coach's clients, increasing retention and enabling real-time tracking.`,
          ],
        },
        {
          title: he ? '10.3 מנויי מאמנים' : '10.3 Coach Subscriptions',
          paragraphs: he ? [
            `שלוש רמות מנוי למאמנים: Starter ($19/חודש, 10 לקוחות), Growth ($49/חודש, 100 לקוחות), Scale ($99/חודש, 500 לקוחות). תשלום מצליח ב-Stripe מפעיל אוטומטית את הרשאת "מאמן" ויוצר רשומת מנוי. כולל תמיכה בקופונים.`,
          ] : [
            `Three coach subscription tiers: Starter ($19/mo, 10 clients), Growth ($49/mo, 100 clients), Scale ($99/mo, 500 clients). Successful Stripe payment automatically provisions the "coach" role and subscription record. Includes coupon support.`,
          ],
        },
      ],
    },
    {
      id: 'affiliates',
      number: '11',
      title: he ? 'תוכנית שותפים (Affiliates)' : 'Affiliate Program',
      paragraphs: he ? [
        `${brandName} מפעיל תוכנית שותפים מלאה. כל שותף מקבל: (1) קוד שותף ייחודי, (2) עמלת רפרל על כל הזמנה, (3) פאנל ניהול עם מעקב הפניות, עמלות, ותשלומים. (4) מערכת payouts עם שיטות תשלום מגוונות.`,
        `שותפים יכולים לשלב את קוד השותף שלהם בדפי נחיתה, קמפיינים, ואפילו במערכת Consciousness Leap — פאנל מכירות מתקדם עם טפסי leads, אפליקציות, ומעקב סטטוס.`,
      ] : [
        `${brandName} operates a full affiliate program. Each affiliate receives: (1) unique affiliate code, (2) referral commission on every order, (3) management panel with referral tracking, commissions, and payouts. (4) Payout system with diverse payment methods.`,
        `Affiliates can embed their code in landing pages, campaigns, and even the Consciousness Leap system — an advanced sales funnel with lead forms, applications, and status tracking.`,
      ],
    },
    {
      id: 'subscriptions',
      number: '12',
      title: he ? 'מודל מנויים — עומק הכוח' : 'Subscription Model — Depth of Power',
      paragraphs: he ? [
        `${brandName} מציע מודל "עומק הכוח" בשלוש רמות:`,
        `Free (Awakening — $0): מבנה בסיסי, XP ורמות, 5 הודעות Aurora ביום, בחירת עד 2 עמודי חיים, וגישה מלאה ל-Tactics Hub.`,
        `Plus (Optimization — $69/חודש): זיכרון Aurora בלתי מוגבל, 6 עמודי חיים, מערכת טרנספורמציה של 100 ימים, והיפנוזה מונחית AI.`,
        `Apex (Command — $199/חודש): כל 14 עמודי החיים, מנוע "Jarvis" פרואקטיבי, ועדכוני תוכנית מודולריים — השלמת סריקות מזריקה אסטרטגיות לתוכנית הפעילה ללא ייצור מחדש מלא.`,
      ] : [
        `${brandName} offers a "Depth of Power" model in three tiers:`,
        `Free (Awakening — $0): Basic structure, XP and levels, 5 daily Aurora messages, up to 2 life pillars, and full Tactics Hub access.`,
        `Plus (Optimization — $69/mo): Unlimited Aurora memory, 6 pillars, 100-Day Transformation OS, and AI Hypnosis.`,
        `Apex (Command — $199/mo): All 14 pillars, proactive "Jarvis" engine, and modular plan updates — completing assessments injects strategies into the active plan without full regeneration.`,
      ],
    },
    {
      id: 'architecture',
      number: '13',
      title: he ? 'ארכיטקטורה טכנית' : 'Technical Architecture',
      paragraphs: he ? [
        `Frontend: React 18 + TypeScript + Vite + Tailwind CSS. ממשק מלא RTL/LTR עם תמיכה דו-לשונית (עברית/אנגלית).`,
        `Backend: Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime). Row-Level Security (RLS) על כל הטבלאות. Edge Functions ל-AI, תשלומים, ולוגיקה עסקית.`,
        `AI: Gemini 2.5 Pro/Flash, GPT-5 — דרך Lovable AI gateway ללא צורך ב-API key. System prompts דינמיים עם context מלא של המשתמש.`,
        `3D Rendering: Three.js עם custom shaders ל-Orb. Morph targets, particle systems, ו-dynamic color mapping מציוני עמודים.`,
        `Payments: Stripe integration עם Solana roadmap. ארנק custodial פנימי עם settlement אסינכרוני.`,
      ] : [
        `Frontend: React 18 + TypeScript + Vite + Tailwind CSS. Full RTL/LTR interface with bilingual support (Hebrew/English).`,
        `Backend: Supabase (PostgreSQL, Auth, Edge Functions, Storage, Realtime). Row-Level Security (RLS) on all tables. Edge Functions for AI, payments, and business logic.`,
        `AI: Gemini 2.5 Pro/Flash, GPT-5 — through Lovable AI gateway without API key. Dynamic system prompts with full user context.`,
        `3D Rendering: Three.js with custom shaders for Orb. Morph targets, particle systems, and dynamic color mapping from pillar scores.`,
        `Payments: Stripe integration with Solana roadmap. Internal custodial wallet with asynchronous settlement.`,
      ],
      subsections: [
        {
          title: he ? '13.1 PWA ואפליקציה מותקנת' : '13.1 PWA & Installable App',
          paragraphs: he ? [
            `${brandName} בנוי כ-Progressive Web App (PWA) עם: Service Worker לשמירת cache, יכולת התקנה על מכשירים ניידים ודסקטופ, Push Notifications, ועבודה חלקית במצב offline. האפליקציה מתנהגת כאפליקציה native ללא צורך בחנויות אפליקציות.`,
          ] : [
            `${brandName} is built as a Progressive Web App (PWA) with: Service Worker for caching, installability on mobile and desktop, Push Notifications, and partial offline functionality. The app behaves like a native app without app store requirements.`,
          ],
        },
        {
          title: he ? '13.2 אבטחה ופרטיות' : '13.2 Security & Privacy',
          paragraphs: he ? [
            `Row-Level Security (RLS) על כל טבלה מבטיח שמשתמשים רואים רק את הנתונים שלהם. תפקידים (roles) מנוהלים בטבלה נפרדת עם security definer functions למניעת privilege escalation. מערכת Data Consent גרנולרית מאפשרת למשתמשים לשלוט על אילו נתונים משותפים. אנונימיזציה מחייבת מינימום 10 משתתפים.`,
          ] : [
            `Row-Level Security (RLS) on every table ensures users only see their own data. Roles are managed in a separate table with security definer functions to prevent privilege escalation. Granular Data Consent system lets users control which data is shared. Anonymization requires a minimum of 10 contributors.`,
          ],
        },
        {
          title: he ? '13.3 ארכיטקטורה מולטי-טננט' : '13.3 Multi-Tenant Architecture',
          paragraphs: he ? [
            `פלטפורמת המאמנים פועלת בארכיטקטורת multi-tenant — כל מאמן מקבל סביבה עצמאית עם ניהול לקוחות, ברנדינג, ותוכן נפרדים. שכבת adapter מבטיחה בידוד נתונים מלא. תמיכה עתידית ב-white-label לארגונים.`,
          ] : [
            `The coach platform operates on multi-tenant architecture — each coach gets an independent environment with separate client management, branding, and content. An adapter layer ensures complete data isolation. Future support for white-label for organizations.`,
          ],
        },
      ],
    },
    {
      id: 'market',
      number: '14',
      title: he ? 'גודל שוק ותחרות' : 'Market Size & Competition',
      paragraphs: he ? [
        `TAM: שוק הפיתוח האישי הגלובלי — $44B (2024). שוק ה-Mental Wellness Apps — $7B. שוק ה-P2E Gaming — $15B. שוק ה-AI Coaching — $2.5B.`,
        `מתחרים ישירים: Headspace (מדיטציה בלבד), Notion (פרודוקטיביות בלבד), Habitica (גיימיפיקציה שטחית), BetterUp (אימון ארגוני). אף אחד מהם לא מאחד את כל התחומים עם AI אישי + כלכלה דיגיטלית + NFTs.`,
        `היתרון של ${brandName}: (1) מנוע AI תודעתי שמכיר את כל המשתמש, (2) P2E אמיתי עם ערך כלכלי, (3) NFT Orb כזהות דיגיטלית, (4) 14 ממדי חיים ולא רק פרודוקטיביות, (5) תשתית white-label, (6) פלטפורמת מאמנים משולבת, (7) היפנוזה מונחית AI, (8) Data Marketplace עם חלוקת הכנסות.`,
      ] : [
        `TAM: Global personal development market — $44B (2024). Mental wellness apps — $7B. P2E gaming — $15B. AI coaching — $2.5B.`,
        `Direct competitors: Headspace (meditation only), Notion (productivity only), Habitica (shallow gamification), BetterUp (corporate coaching). None unifies all domains with personal AI + digital economy + NFTs.`,
        `${brandName}'s advantage: (1) Consciousness AI engine that knows the whole user, (2) real P2E with economic value, (3) NFT Orb as digital identity, (4) 14 life dimensions not just productivity, (5) white-label infrastructure, (6) integrated coach platform, (7) AI-guided hypnosis, (8) Data Marketplace with revenue sharing.`,
      ],
    },
    {
      id: 'roadmap',
      number: '15',
      title: he ? 'מפת דרכים' : 'Roadmap',
      paragraphs: he ? [
        `Q1 2026 — השקת MVP: 5 Hubs, Aurora AI, מערכת Orb, גיימיפיקציה בסיסית, פלטפורמת מאמנים, היפנוזה מונחית AI, מערכת למידה, FreeMarket.`,
        `Q2 2026 — P2E Launch: Mining Engine, ארנק MOS, Data Marketplace (beta), תוכנית שותפים.`,
        `Q3 2026 — NFT Mint: Orb NFTs על Solana, Trait NFTs, שוק משני.`,
        `Q4 2026 — Scale: אפליקציה native (React Native), API ציבורי, white-label לארגונים, הרחבת שפות.`,
        `2027 — DAO: ממשל קהילתי, הצבעות על פיצ'רים, treasury management.`,
      ] : [
        `Q1 2026 — MVP Launch: 5 Hubs, Aurora AI, Orb system, basic gamification, coach platform, AI-guided hypnosis, learning system, FreeMarket.`,
        `Q2 2026 — P2E Launch: Mining Engine, MOS wallet, Data Marketplace (beta), affiliate program.`,
        `Q3 2026 — NFT Mint: Orb NFTs on Solana, Trait NFTs, secondary marketplace.`,
        `Q4 2026 — Scale: Native app (React Native), public API, white-label for organizations, language expansion.`,
        `2027 — DAO: Community governance, feature voting, treasury management.`,
      ],
    },
    {
      id: 'team',
      number: '16',
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
    </div>
  );
}
