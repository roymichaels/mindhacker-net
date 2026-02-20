/**
 * Extended feature detail content for /features/:slug pages
 * Each feature gets: overview paragraphs, key benefits, how it works steps, and who it's for
 */

export interface FeatureDetail {
  slug: string;
  overviewEn: string[];
  overviewHe: string[];
  benefitsEn: { title: string; desc: string }[];
  benefitsHe: { title: string; desc: string }[];
  howItWorksEn: { step: string; desc: string }[];
  howItWorksHe: { step: string; desc: string }[];
  whoForEn: string[];
  whoForHe: string[];
  tier: 'free' | 'plus' | 'apex';
}

export const FEATURE_DETAILS: Record<string, FeatureDetail> = {
  'aurora-ai': {
    slug: 'aurora-ai',
    tier: 'free',
    overviewEn: [
      'Aurora is not another chatbot. She\'s a full-spectrum AI life strategist that learns your behavioral patterns, emotional states, energy cycles, and personal goals — then synthesizes them into real-time coaching guidance.',
      'Unlike generic AI assistants, Aurora maintains deep contextual memory across every conversation. She remembers your commitments, tracks your follow-through, and adapts her tone, approach, and recommendations based on where you are in your transformation journey.',
      'Aurora operates across every pillar of your life — from vitality and focus to wealth and relationships — acting as a unified intelligence layer that connects the dots between domains you\'d normally manage in isolation.',
    ],
    overviewHe: [
      'Aurora היא לא עוד צ\'אטבוט. היא אסטרטגית חיים AI מלאה שלומדת את הדפוסים ההתנהגותיים שלך, מצבים רגשיים, מחזורי אנרגיה ומטרות אישיות — ואז מסנתזת אותם להנחיות אימון בזמן אמת.',
      'בניגוד לעוזרות AI גנריות, Aurora שומרת זיכרון הקשרי עמוק לאורך כל שיחה. היא זוכרת את ההתחייבויות שלך, עוקבת אחרי המעקב שלך, ומתאימה את הטון, הגישה וההמלצות שלה בהתאם למקום שלך במסע הטרנספורמציה.',
      'Aurora פועלת לאורך כל עמודי החיים שלך — מחיוניות ומיקוד ועד עושר ומערכות יחסים — ומשמשת כשכבת אינטליגנציה אחודה שמחברת בין תחומים שבדרך כלל היית מנהל בבידוד.',
    ],
    benefitsEn: [
      { title: 'Deep Memory', desc: 'Aurora remembers every conversation, commitment, and behavioral pattern — building a comprehensive model of who you are and where you\'re headed.' },
      { title: 'Adaptive Coaching Style', desc: 'She shifts between motivational, analytical, confrontational, and supportive tones based on your emotional state and what the moment requires.' },
      { title: 'Cross-Domain Intelligence', desc: 'She connects insights from your fitness to your finances, from your relationships to your focus — seeing patterns you can\'t.' },
      { title: 'Real-Time Strategy', desc: 'Every interaction generates actionable next steps, not just feel-good affirmations. Aurora pushes you toward execution.' },
      { title: 'Voice & Text', desc: 'Speak or type — Aurora processes both, making coaching accessible whether you\'re at your desk or on the move.' },
    ],
    benefitsHe: [
      { title: 'זיכרון עמוק', desc: 'Aurora זוכרת כל שיחה, התחייבות ודפוס התנהגותי — בונה מודל מקיף של מי שאתה ולאן אתה הולך.' },
      { title: 'סגנון אימון אדפטיבי', desc: 'היא עוברת בין טונים מוטיבציוניים, אנליטיים, מאתגרים ותומכים בהתאם למצב הרגשי שלך ולמה שהרגע דורש.' },
      { title: 'אינטליגנציה חוצת-תחומים', desc: 'היא מחברת תובנות מהכושר לפיננסים, ממערכות היחסים למיקוד — רואה דפוסים שאתה לא יכול.' },
      { title: 'אסטרטגיה בזמן אמת', desc: 'כל אינטראקציה מייצרת צעדים הבאים ברי-ביצוע, לא רק אישורים חיוביים. Aurora דוחפת אותך לביצוע.' },
      { title: 'קול וטקסט', desc: 'דבר או הקלד — Aurora מעבדת את שניהם, מה שהופך את האימון לנגיש בין אם אתה ליד המחשב או בדרכים.' },
    ],
    howItWorksEn: [
      { step: 'Onboarding Deep-Dive', desc: 'Aurora begins with a comprehensive assessment of your life across 11 domains, collecting 70+ behavioral signals to build your initial profile.' },
      { step: 'Context Building', desc: 'Every interaction enriches your profile — Aurora tracks your energy patterns, emotional states, completed tasks, and behavioral trends.' },
      { step: 'Strategic Guidance', desc: 'Based on your evolving profile, Aurora generates personalized daily strategies, identifies blind spots, and recalibrates your 90-day plan.' },
      { step: 'Proactive Interventions', desc: 'Aurora doesn\'t wait for you to ask. She initiates check-ins, sends accountability nudges, and alerts you when patterns suggest you\'re drifting.' },
    ],
    howItWorksHe: [
      { step: 'צלילה עמוקה באונבורדינג', desc: 'Aurora מתחילה בהערכה מקיפה של החיים שלך ב-11 תחומים, אוספת 70+ אותות התנהגותיים כדי לבנות את הפרופיל הראשוני שלך.' },
      { step: 'בניית הקשר', desc: 'כל אינטראקציה מעשירה את הפרופיל שלך — Aurora עוקבת אחרי דפוסי האנרגיה, מצבים רגשיים, משימות שהושלמו ומגמות התנהגותיות.' },
      { step: 'הנחיה אסטרטגית', desc: 'על סמך הפרופיל המתפתח שלך, Aurora מייצרת אסטרטגיות יומיות מותאמות אישית, מזהה נקודות עיוורון ומכילה מחדש את תוכנית 90 הימים שלך.' },
      { step: 'התערבויות יזומות', desc: 'Aurora לא מחכה שתשאל. היא יוזמת צ\'ק-אינים, שולחת דחיפות אחריותיות ומתריעה כשדפוסים מצביעים על כך שאתה סוטה מהמסלול.' },
    ],
    whoForEn: [
      'Anyone who wants a personal strategist without the $500/hour price tag',
      'People who struggle with self-accountability and follow-through',
      'High performers who want AI-augmented decision making across every life domain',
      'Those who feel overwhelmed managing multiple areas of life simultaneously',
    ],
    whoForHe: [
      'כל מי שרוצה אסטרטג אישי בלי תג מחיר של 500$/שעה',
      'אנשים שמתקשים עם אחריות עצמית ומעקב',
      'בעלי ביצועים גבוהים שרוצים קבלת החלטות מוגברת AI בכל תחום בחיים',
      'מי שמרגיש מוצף מניהול תחומים רבים בו-זמנית',
    ],
  },
  'identity-orb': {
    slug: 'identity-orb',
    tier: 'free',
    overviewEn: [
      'The Identity Orb is your digital mirror — a living, breathing 3D visualization that reflects your current state of growth across every dimension of your life.',
      'Powered by over 70 behavioral signals collected from your assessments, daily actions, and coaching interactions, the Orb evolves in real-time. Its colors shift, its texture morphs, and its energy signature changes as you progress through your transformation journey.',
      'This isn\'t a gimmick — it\'s a powerful psychological anchor. Seeing your growth represented visually creates emotional investment in the process and makes abstract progress feel tangible and real.',
    ],
    overviewHe: [
      'ה-Identity Orb הוא המראה הדיגיטלית שלך — ויזואליזציה תלת-ממדית חיה ונושמת שמשקפת את מצב הצמיחה הנוכחי שלך בכל ממד בחיים.',
      'מופעל על ידי מעל 70 אותות התנהגותיים שנאספים מההערכות, הפעולות היומיות ואינטראקציות האימון שלך, ה-Orb מתפתח בזמן אמת. הצבעים שלו משתנים, המרקם שלו מתמורפ, וחתימת האנרגיה שלו משתנה ככל שאתה מתקדם במסע הטרנספורמציה.',
      'זה לא גימיק — זהו עוגן פסיכולוגי חזק. לראות את הצמיחה שלך מיוצגת חזותית יוצרת השקעה רגשית בתהליך והופכת התקדמות מופשטת למוחשית ואמיתית.',
    ],
    benefitsEn: [
      { title: 'Visual Progress Tracking', desc: 'Watch your Orb evolve from a dim, unstable shape to a vibrant, powerful entity as you level up across life domains.' },
      { title: 'Psychological Anchoring', desc: 'Visual representation of growth creates stronger emotional connection to your transformation than numbers alone.' },
      { title: 'Multi-Signal Synthesis', desc: 'The Orb processes 70+ data points — from sleep quality to financial health — into a single, intuitive visualization.' },
      { title: 'Shareable Identity', desc: 'Your Orb is uniquely yours. Share it as a visual badge of your growth journey.' },
    ],
    benefitsHe: [
      { title: 'מעקב התקדמות חזותי', desc: 'צפה ב-Orb שלך מתפתח מצורה עמומה ולא יציבה לישות תוססת וחזקה ככל שאתה מתקדם בתחומי החיים.' },
      { title: 'עיגון פסיכולוגי', desc: 'ייצוג חזותי של צמיחה יוצר חיבור רגשי חזק יותר לטרנספורמציה שלך ממספרים בלבד.' },
      { title: 'סינתזה רב-אותית', desc: 'ה-Orb מעבד 70+ נקודות נתונים — מאיכות שינה ועד בריאות פיננסית — לויזואליזציה אחת ואינטואיטיבית.' },
      { title: 'זהות שניתנת לשיתוף', desc: 'ה-Orb שלך הוא ייחודי לך. שתף אותו כתג חזותי של מסע הצמיחה שלך.' },
    ],
    howItWorksEn: [
      { step: 'Signal Collection', desc: 'Your assessments, habits, task completions, and coaching sessions all feed behavioral data into the Orb engine.' },
      { step: 'Profile Computation', desc: 'An algorithm maps your 70+ signals to visual parameters: color palette, morph intensity, particle density, and glow radius.' },
      { step: 'Real-Time Rendering', desc: 'The Orb renders in WebGL (or falls back to CSS) and updates dynamically as your data changes.' },
      { step: 'Evolution Over Time', desc: 'As you complete milestones and level up, your Orb gains new visual properties — unlocking richer textures, stronger auras, and unique effects.' },
    ],
    howItWorksHe: [
      { step: 'איסוף אותות', desc: 'ההערכות, ההרגלים, השלמת המשימות וסשני האימון שלך מזינים נתונים התנהגותיים למנוע ה-Orb.' },
      { step: 'חישוב פרופיל', desc: 'אלגוריתם ממפה את 70+ האותות שלך לפרמטרים חזותיים: פלטת צבעים, עוצמת מורפ, צפיפות חלקיקים ורדיוס זוהר.' },
      { step: 'רינדור בזמן אמת', desc: 'ה-Orb מרונדר ב-WebGL (או נופל חזרה ל-CSS) ומתעדכן דינמית ככל שהנתונים שלך משתנים.' },
      { step: 'אבולוציה לאורך זמן', desc: 'ככל שאתה משלים אבני דרך ועולה רמה, ה-Orb שלך מקבל תכונות חזותיות חדשות — פותח מרקמים עשירים יותר, הילות חזקות יותר ואפקטים ייחודיים.' },
    ],
    whoForEn: [
      'Visual learners who need to see progress, not just read metrics',
      'Gamers and digital natives who resonate with avatar-based progression',
      'Anyone who wants a unique, personal symbol of their growth journey',
    ],
    whoForHe: [
      'לומדים חזותיים שצריכים לראות התקדמות, לא רק לקרוא מדדים',
      'גיימרים וילידי דיגיטל שמתחברים להתקדמות מבוססת אווטאר',
      'כל מי שרוצה סמל ייחודי ואישי של מסע הצמיחה שלו',
    ],
  },
  'life-os-core': {
    slug: 'life-os-core',
    tier: 'plus',
    overviewEn: [
      'Life OS Core is the structural backbone of your entire transformation. It divides your internal development into 6 precisely defined pillars: Presence, Power, Vitality, Focus, Combat, and Expansion.',
      'Each pillar operates as an independent assessment and coaching engine. When you enter a domain, Aurora conducts a deep-dive evaluation — analyzing your current state, identifying gaps, and generating a personalized development plan.',
      'The power isn\'t in any single pillar. It\'s in the system. When all 6 Core pillars are assessed and active, Aurora generates a Pillar Synthesis — a unified strategy that connects your physical energy to your mental clarity, your identity to your cognitive growth.',
    ],
    overviewHe: [
      'Life OS Core הוא שדרת ההרס של הטרנספורמציה שלך. הוא מחלק את הפיתוח הפנימי שלך ל-6 עמודים מוגדרים בדיוק: נוכחות, עוצמה, חיוניות, מיקוד, לחימה והתרחבות.',
      'כל עמוד פועל כמנוע הערכה ואימון עצמאי. כשאתה נכנס לתחום, Aurora עורכת הערכה מעמיקה — מנתחת את המצב הנוכחי שלך, מזהה פערים ומייצרת תוכנית פיתוח מותאמת אישית.',
      'הכוח לא בעמוד בודד. הוא במערכת. כשכל 6 עמודי ה-Core מוערכים ופעילים, Aurora מייצרת סינתזת עמודים — אסטרטגיה אחודה שמחברת את האנרגיה הפיזית שלך לבהירות המנטלית, את הזהות שלך לצמיחה הקוגניטיבית.',
    ],
    benefitsEn: [
      { title: 'Structured Self-Mastery', desc: 'No more vague "self-improvement." Each domain has clear metrics, assessments, and actionable development paths.' },
      { title: 'AI-Powered Assessments', desc: 'Aurora conducts conversational deep-dives in each domain, generating insights no static questionnaire could produce.' },
      { title: 'Cross-Pillar Synthesis', desc: 'Complete all 6 pillars and unlock a unified strategy that reveals how your domains interconnect and influence each other.' },
      { title: 'Progress Visualization', desc: 'Track your growth across all pillars with radar charts, domain scores, and the evolving Identity Orb.' },
      { title: 'Recalibration', desc: 'Re-assess any domain as you evolve. Your plans update automatically based on new insights.' },
    ],
    benefitsHe: [
      { title: 'שליטה עצמית מובנית', desc: 'בלי עוד "שיפור עצמי" מעורפל. לכל תחום יש מדדים ברורים, הערכות ומסלולי פיתוח ברי-ביצוע.' },
      { title: 'הערכות מופעלות AI', desc: 'Aurora עורכת צלילות עמוקות שיחתיות בכל תחום, מייצרת תובנות ששאלון סטטי לעולם לא יכול לייצר.' },
      { title: 'סינתזה חוצת-עמודים', desc: 'השלם את כל 6 העמודים ותפתח אסטרטגיה אחודה שחושפת איך התחומים שלך מתחברים ומשפיעים זה על זה.' },
      { title: 'ויזואליזציית התקדמות', desc: 'עקוב אחרי הצמיחה שלך בכל העמודים עם גרפי רדאר, ציוני תחום וה-Identity Orb המתפתח.' },
      { title: 'כיול מחדש', desc: 'הערך מחדש כל תחום ככל שאתה מתפתח. התוכניות שלך מתעדכנות אוטומטית על סמך תובנות חדשות.' },
    ],
    howItWorksEn: [
      { step: 'Choose a Domain', desc: 'Enter any of the 6 Core pillars from the Life Hub — Presence, Power, Vitality, Focus, Combat, or Expansion.' },
      { step: 'Deep Assessment', desc: 'Aurora conducts a 15-25 minute conversational assessment, exploring your current state, challenges, and aspirations in that domain.' },
      { step: 'Results & Insights', desc: 'Receive a detailed breakdown with scores, identified patterns, strengths, and areas for development.' },
      { step: 'Plan Generation', desc: 'Aurora generates domain-specific goals, habits, and milestones that feed into your 90-day transformation plan.' },
      { step: 'Synthesis Unlock', desc: 'Once all 6 Core pillars are assessed, Aurora creates a holistic Pillar Synthesis connecting all domains into one strategy.' },
    ],
    howItWorksHe: [
      { step: 'בחר תחום', desc: 'כנס לכל אחד מ-6 עמודי ה-Core מתוך Life Hub — נוכחות, עוצמה, חיוניות, מיקוד, לחימה או התרחבות.' },
      { step: 'הערכה מעמיקה', desc: 'Aurora עורכת הערכה שיחתית של 15-25 דקות, חוקרת את המצב הנוכחי, האתגרים והשאיפות שלך בתחום זה.' },
      { step: 'תוצאות ותובנות', desc: 'קבל פירוט מפורט עם ציונים, דפוסים שזוהו, חוזקות ותחומים לפיתוח.' },
      { step: 'יצירת תוכנית', desc: 'Aurora מייצרת מטרות, הרגלים ואבני דרך ספציפיות לתחום שמזינות את תוכנית הטרנספורמציה ל-90 ימים שלך.' },
      { step: 'פתיחת סינתזה', desc: 'ברגע שכל 6 עמודי ה-Core מוערכים, Aurora יוצרת סינתזת עמודים הוליסטית שמחברת את כל התחומים לאסטרטגיה אחת.' },
    ],
    whoForEn: [
      'People who want a structured framework instead of random self-help advice',
      'High achievers who optimize every area of performance',
      'Anyone ready to stop guessing and start engineering their growth',
    ],
    whoForHe: [
      'אנשים שרוצים מסגרת מובנית במקום עצות עזרה עצמית אקראיות',
      'בעלי הישגים גבוהים שמייעלים כל תחום ביצועים',
      'כל מי שמוכן להפסיק לנחש ולהתחיל להנדס את הצמיחה שלו',
    ],
  },
  'vitality-engine': {
    slug: 'vitality-engine',
    tier: 'plus',
    overviewEn: [
      'Your body is the foundation of every ambition. The Vitality Engine is a precision intelligence system that analyzes your sleep, nutrition, hormonal balance, recovery, and dopamine regulation — then converts them into a single, actionable Vitality Index.',
      'Most people sabotage their goals because their biology is working against them. Poor sleep destroys focus. Bad nutrition tanks energy. Unmanaged stress floods cortisol. The Vitality Engine makes the invisible visible — showing you exactly where your body is holding you back.',
      'This isn\'t a fitness tracker. It\'s a strategic energy management system that treats your biology as the engine that powers everything else in your life.',
    ],
    overviewHe: [
      'הגוף שלך הוא הבסיס לכל שאיפה. מנוע החיוניות הוא מערכת אינטליגנציה מדויקת שמנתחת את השינה, התזונה, האיזון ההורמונלי, ההתאוששות וויסות הדופמין שלך — ואז ממירה אותם למדד חיוניות אחד ובר-ביצוע.',
      'רוב האנשים מחבלים במטרות שלהם כי הביולוגיה עובדת נגדם. שינה גרועה הורסת מיקוד. תזונה רעה מורידה אנרגיה. סטרס לא מנוהל מציף קורטיזול. מנוע החיוניות הופך את הבלתי נראה לנראה — מראה לך בדיוק איפה הגוף מעכב אותך.',
      'זה לא מעקב כושר. זוהי מערכת ניהול אנרגיה אסטרטגית שמתייחסת לביולוגיה שלך כמנוע שמפעיל את כל השאר בחיים.',
    ],
    benefitsEn: [
      { title: 'Sleep Intelligence', desc: 'Understand how your sleep patterns affect cognitive performance, emotional regulation, and physical recovery.' },
      { title: 'Nutritional Optimization', desc: 'Get AI-driven insights on how your eating habits impact energy, focus, and hormonal balance.' },
      { title: 'Hormonal Awareness', desc: 'Track and understand the hormonal factors that drive motivation, mood, and physical performance.' },
      { title: 'Recovery Tracking', desc: 'Monitor your body\'s recovery signals to prevent burnout and optimize training intensity.' },
      { title: 'Dopamine Management', desc: 'Understand and regulate your dopamine cycles to maintain sustainable motivation without crashes.' },
    ],
    benefitsHe: [
      { title: 'אינטליגנציית שינה', desc: 'הבן איך דפוסי השינה שלך משפיעים על ביצועים קוגניטיביים, ויסות רגשי והתאוששות פיזית.' },
      { title: 'אופטימיזציה תזונתית', desc: 'קבל תובנות מונעות AI על איך הרגלי האכילה שלך משפיעים על אנרגיה, מיקוד ואיזון הורמונלי.' },
      { title: 'מודעות הורמונלית', desc: 'עקוב והבן את הגורמים ההורמונליים שמניעים מוטיבציה, מצב רוח וביצועים פיזיים.' },
      { title: 'מעקב התאוששות', desc: 'עקוב אחרי אותות ההתאוששות של הגוף כדי למנוע שחיקה ולייעל עוצמת אימון.' },
      { title: 'ניהול דופמין', desc: 'הבן וסות את מחזורי הדופמין שלך כדי לשמור על מוטיבציה ברת-קיימא בלי קריסות.' },
    ],
    howItWorksEn: [
      { step: 'Vitality Assessment', desc: 'Aurora conducts a comprehensive evaluation of your sleep, nutrition, exercise, stress, and recovery habits.' },
      { step: 'Index Calculation', desc: 'Your data is synthesized into a Vitality Index score with sub-scores for each biological domain.' },
      { step: 'Gap Identification', desc: 'Aurora identifies the specific biological bottlenecks holding back your performance.' },
      { step: 'Protocol Generation', desc: 'Receive personalized protocols for sleep, nutrition, and recovery optimized for your lifestyle and goals.' },
    ],
    howItWorksHe: [
      { step: 'הערכת חיוניות', desc: 'Aurora עורכת הערכה מקיפה של הרגלי השינה, התזונה, הפעילות הגופנית, הסטרס וההתאוששות שלך.' },
      { step: 'חישוב מדד', desc: 'הנתונים שלך מסונתזים למדד חיוניות עם תת-ציונים לכל תחום ביולוגי.' },
      { step: 'זיהוי פערים', desc: 'Aurora מזהה את צווארי הבקבוק הביולוגיים הספציפיים שמעכבים את הביצועים שלך.' },
      { step: 'יצירת פרוטוקול', desc: 'קבל פרוטוקולים מותאמים אישית לשינה, תזונה והתאוששות שמותאמים לסגנון החיים והמטרות שלך.' },
    ],
    whoForEn: [
      'Entrepreneurs and professionals who need sustained high energy',
      'Athletes and fitness enthusiasts optimizing recovery',
      'Anyone who feels chronically tired despite "doing everything right"',
    ],
    whoForHe: [
      'יזמים ואנשי מקצוע שצריכים אנרגיה גבוהה מתמשכת',
      'ספורטאים וחובבי כושר שמייעלים התאוששות',
      'כל מי שמרגיש עייף כרונית למרות ש"עושה הכל נכון"',
    ],
  },
  'focus-engine': {
    slug: 'focus-engine',
    tier: 'plus',
    overviewEn: [
      'In an attention economy, focus is the ultimate competitive advantage. The Focus Engine is a cognitive command center that tracks your mental clarity, deep work capacity, and distraction patterns — then engineers systems to sharpen your execution.',
      'This engine doesn\'t just tell you to "focus more." It analyzes when you focus best, what breaks your concentration, how your dopamine cycles affect sustained attention, and what environmental factors amplify or destroy your cognitive performance.',
      'The result: a personalized cognitive optimization strategy that turns scattered effort into precision execution.',
    ],
    overviewHe: [
      'בכלכלת קשב, מיקוד הוא היתרון התחרותי האולטימטיבי. מנוע המיקוד הוא מרכז פיקוד קוגניטיבי שעוקב אחרי הבהירות המנטלית, יכולת העבודה העמוקה ודפוסי ההסחה שלך — ואז מהנדס מערכות כדי לחדד את הביצוע שלך.',
      'המנוע הזה לא רק אומר לך "תתמקד יותר." הוא מנתח מתי אתה מתמקד הכי טוב, מה שובר את הריכוז שלך, איך מחזורי הדופמין משפיעים על קשב מתמשך, ואיזה גורמים סביבתיים מגבירים או הורסים את הביצועים הקוגניטיביים שלך.',
      'התוצאה: אסטרטגיית אופטימיזציה קוגניטיבית מותאמת אישית שהופכת מאמץ מפוזר לביצוע מדויק.',
    ],
    benefitsEn: [
      { title: 'Deep Work Systems', desc: 'Structured protocols for entering and sustaining deep focus states based on your cognitive profile.' },
      { title: 'Distraction Mapping', desc: 'Identify your specific distraction triggers and build automatic countermeasures.' },
      { title: 'Cognitive Peak Detection', desc: 'Discover your optimal focus windows and schedule high-impact work accordingly.' },
      { title: 'Mental Clarity Tracking', desc: 'Monitor clarity levels over time to understand what habits enhance or degrade your thinking.' },
    ],
    benefitsHe: [
      { title: 'מערכות עבודה עמוקה', desc: 'פרוטוקולים מובנים לכניסה ושימור מצבי מיקוד עמוק בהתאם לפרופיל הקוגניטיבי שלך.' },
      { title: 'מיפוי הסחות', desc: 'זהה את טריגרי ההסחה הספציפיים שלך ובנה אמצעי נגד אוטומטיים.' },
      { title: 'זיהוי שיא קוגניטיבי', desc: 'גלה את חלונות המיקוד האופטימליים שלך ותזמן עבודה בעלת השפעה גבוהה בהתאם.' },
      { title: 'מעקב בהירות מנטלית', desc: 'עקוב אחרי רמות בהירות לאורך זמן כדי להבין אילו הרגלים משפרים או מדרדרים את החשיבה שלך.' },
    ],
    howItWorksEn: [
      { step: 'Focus Assessment', desc: 'Aurora evaluates your current focus capacity, work habits, environment, and distraction vulnerabilities.' },
      { step: 'Pattern Analysis', desc: 'Your cognitive patterns are mapped to reveal peak performance windows and focus killers.' },
      { step: 'System Design', desc: 'Receive a personalized deep work system with time blocks, environment recommendations, and break protocols.' },
      { step: 'Ongoing Optimization', desc: 'Aurora continuously refines your focus strategy based on your daily execution data.' },
    ],
    howItWorksHe: [
      { step: 'הערכת מיקוד', desc: 'Aurora מעריכה את יכולת המיקוד הנוכחית שלך, הרגלי עבודה, סביבה ופגיעויות הסחה.' },
      { step: 'ניתוח דפוסים', desc: 'הדפוסים הקוגניטיביים שלך ממופים כדי לחשוף חלונות ביצועים שיאיים ורוצחי מיקוד.' },
      { step: 'עיצוב מערכת', desc: 'קבל מערכת עבודה עמוקה מותאמת אישית עם בלוקי זמן, המלצות סביבתיות ופרוטוקולי הפסקה.' },
      { step: 'אופטימיזציה שוטפת', desc: 'Aurora משכללת ברציפות את אסטרטגיית המיקוד שלך על סמך נתוני הביצוע היומיים.' },
    ],
    whoForEn: [
      'Knowledge workers drowning in distraction',
      'Entrepreneurs who need razor-sharp execution',
      'Students and creatives who struggle with sustained concentration',
    ],
    whoForHe: [
      'עובדי ידע שטובעים בהסחות',
      'יזמים שצריכים ביצוע חד כתער',
      'סטודנטים ויוצרים שמתקשים עם ריכוז מתמשך',
    ],
  },
  'combat-system': {
    slug: 'combat-system',
    tier: 'plus',
    overviewEn: [
      'The Combat System is a structured martial capability framework that treats fighting skills as measurable, trainable competencies — not just gym sessions.',
      'Covering striking, grappling, conditioning, reaction time, and tactical awareness, this system transforms scattered training into strategic warrior development with clear progression metrics.',
      'Whether you\'re a serious martial artist or someone who wants to build functional fighting capability, the Combat System provides the structure, tracking, and AI-guided progression that traditional training lacks.',
    ],
    overviewHe: [
      'מערכת הלחימה היא מסגרת יכולת לחימה מובנית שמתייחסת למיומנויות לחימה כיכולות מדידות וניתנות לאימון — לא רק כסשנים בחדר כושר.',
      'מכסה חבטות, היאבקות, כושר, זמן תגובה ומודעות טקטית, המערכת הופכת אימון מפוזר לפיתוח לוחם אסטרטגי עם מדדי התקדמות ברורים.',
      'בין אם אתה אומן לחימה רציני או מישהו שרוצה לבנות יכולת לחימה פונקציונלית, מערכת הלחימה מספקת את המבנה, המעקב וההתקדמות המודרכת ב-AI שאימון מסורתי חסר.',
    ],
    benefitsEn: [
      { title: 'Warrior Capability Index', desc: 'A composite score tracking your overall combat readiness across all martial dimensions.' },
      { title: 'Skill-Specific Tracking', desc: 'Separate metrics for striking, grappling, cardio conditioning, reaction speed, and tactical IQ.' },
      { title: 'Training Program Design', desc: 'AI-generated training protocols that address your specific weaknesses and build on strengths.' },
      { title: 'Progressive Overload', desc: 'Structured escalation in difficulty, intensity, and complexity — ensuring continuous improvement.' },
    ],
    benefitsHe: [
      { title: 'מדד יכולת לוחם', desc: 'ציון מורכב שעוקב אחרי המוכנות הלחימתית הכוללת שלך בכל הממדים.' },
      { title: 'מעקב ספציפי למיומנות', desc: 'מדדים נפרדים לחבטות, היאבקות, כושר קרדיו, מהירות תגובה ו-IQ טקטי.' },
      { title: 'עיצוב תוכנית אימון', desc: 'פרוטוקולי אימון שנוצרים ב-AI שמטפלים בחולשות הספציפיות שלך ובונים על חוזקות.' },
      { title: 'עומס פרוגרסיבי', desc: 'הסלמה מובנית בקושי, עוצמה ומורכבות — מבטיחה שיפור מתמיד.' },
    ],
    howItWorksEn: [
      { step: 'Combat Assessment', desc: 'Aurora evaluates your current martial arts experience, training frequency, and skill levels.' },
      { step: 'Capability Mapping', desc: 'Your combat profile is mapped across 5 dimensions with specific scores and development priorities.' },
      { step: 'Training Protocols', desc: 'Receive structured drills, sparring guidelines, and conditioning programs tailored to your level.' },
      { step: 'Progress Tracking', desc: 'Log training sessions and see your Warrior Capability Index evolve over time.' },
    ],
    howItWorksHe: [
      { step: 'הערכת לחימה', desc: 'Aurora מעריכה את ניסיון אמנויות הלחימה הנוכחי שלך, תדירות אימון ורמות מיומנות.' },
      { step: 'מיפוי יכולות', desc: 'פרופיל הלחימה שלך ממופה ב-5 ממדים עם ציונים ספציפיים ועדיפויות פיתוח.' },
      { step: 'פרוטוקולי אימון', desc: 'קבל תרגילים מובנים, הנחיות ספארינג ותוכניות כושר שמותאמות לרמה שלך.' },
      { step: 'מעקב התקדמות', desc: 'תעד סשני אימון וראה את מדד יכולת הלוחם שלך מתפתח לאורך זמן.' },
    ],
    whoForEn: [
      'Martial artists wanting structured, data-driven progression',
      'Beginners who want a clear path into combat training',
      'Fitness enthusiasts looking to add functional fighting skills',
    ],
    whoForHe: [
      'אומני לחימה שרוצים התקדמות מובנית ומונעת נתונים',
      'מתחילים שרוצים מסלול ברור לאימון לחימה',
      'חובבי כושר שמחפשים להוסיף מיומנויות לחימה פונקציונליות',
    ],
  },
  'expansion-engine': {
    slug: 'expansion-engine',
    tier: 'plus',
    overviewEn: [
      'The Expansion Engine maps your cognitive growth across four critical dimensions: learning depth, creative output, language flexibility, and systems thinking.',
      'Most people plateau intellectually without realizing it. They consume information but don\'t deepen understanding. They think linearly when problems demand systems-level reasoning. The Expansion Engine makes these invisible ceilings visible — and gives you tools to break through them.',
      'This isn\'t about reading more books. It\'s about building genuine cognitive capability that compounds over time.',
    ],
    overviewHe: [
      'מנוע ההתרחבות ממפה את הצמיחה הקוגניטיבית שלך ב-4 ממדים קריטיים: עומק למידה, פלט יצירתי, גמישות שפתית וחשיבה מערכתית.',
      'רוב האנשים מגיעים לרמה אינטלקטואלית בלי להבין זאת. הם צורכים מידע אבל לא מעמיקים הבנה. הם חושבים ליניארית כשבעיות דורשות חשיבה ברמת מערכת. מנוע ההתרחבות הופך את התקרות הבלתי נראות האלה לנראות — ונותן לך כלים לפרוץ דרכן.',
      'זה לא על לקרוא עוד ספרים. זה על בניית יכולת קוגניטיבית אמיתית שמצטברת לאורך זמן.',
    ],
    benefitsEn: [
      { title: 'Learning Depth Tracking', desc: 'Measure how deeply you understand topics, not just how many you\'ve been exposed to.' },
      { title: 'Creative Output Metrics', desc: 'Track your creative production and identify patterns in your most productive creative states.' },
      { title: 'Systems Thinking Development', desc: 'Build the ability to see interconnections, feedback loops, and emergent patterns in complex situations.' },
      { title: 'Intellectual Plateau Breaking', desc: 'Identify and overcome the specific cognitive barriers holding you at your current level.' },
    ],
    benefitsHe: [
      { title: 'מעקב עומק למידה', desc: 'מדוד כמה עמוק אתה מבין נושאים, לא רק לכמה נחשפת.' },
      { title: 'מדדי פלט יצירתי', desc: 'עקוב אחרי הפקה יצירתית וזהה דפוסים במצבי היצירה הפרודוקטיביים ביותר שלך.' },
      { title: 'פיתוח חשיבה מערכתית', desc: 'בנה את היכולת לראות חיבורים, לולאות משוב ודפוסים מתהווים במצבים מורכבים.' },
      { title: 'פריצת רמות אינטלקטואליות', desc: 'זהה והתגבר על המחסומים הקוגניטיביים הספציפיים שמחזיקים אותך ברמה הנוכחית.' },
    ],
    howItWorksEn: [
      { step: 'Cognitive Assessment', desc: 'Aurora maps your current intellectual strengths, learning habits, and creative patterns.' },
      { step: 'Growth Mapping', desc: 'Your cognitive profile is visualized across 4 dimensions with specific development targets.' },
      { step: 'Challenge Protocols', desc: 'Receive structured intellectual challenges designed to push beyond your current cognitive boundaries.' },
      { step: 'Progress Evolution', desc: 'Track your cognitive growth over time and celebrate breakthroughs in thinking capability.' },
    ],
    howItWorksHe: [
      { step: 'הערכה קוגניטיבית', desc: 'Aurora ממפה את החוזקות האינטלקטואליות הנוכחיות, הרגלי הלמידה והדפוסים היצירתיים שלך.' },
      { step: 'מיפוי צמיחה', desc: 'הפרופיל הקוגניטיבי שלך מוצג חזותית ב-4 ממדים עם יעדי פיתוח ספציפיים.' },
      { step: 'פרוטוקולי אתגר', desc: 'קבל אתגרים אינטלקטואליים מובנים שמתוכננים לדחוף מעבר לגבולות הקוגניטיביים הנוכחיים שלך.' },
      { step: 'אבולוציית התקדמות', desc: 'עקוב אחרי הצמיחה הקוגניטיבית שלך לאורך זמן וחגוג פריצות דרך ביכולת חשיבה.' },
    ],
    whoForEn: [
      'Lifelong learners who want measurable cognitive growth',
      'Professionals who need to think at systems level',
      'Creatives who want to understand and optimize their creative process',
    ],
    whoForHe: [
      'לומדים לכל החיים שרוצים צמיחה קוגניטיבית מדידה',
      'אנשי מקצוע שצריכים לחשוב ברמת מערכת',
      'יוצרים שרוצים להבין ולייעל את התהליך היצירתי שלהם',
    ],
  },
  'arena-hub': {
    slug: 'arena-hub',
    tier: 'plus',
    overviewEn: [
      'The Arena is where internal development meets external execution. It covers 5 domains: Wealth, Influence, Relationships, Business, and Projects — each connecting directly to your Core development.',
      'Most personal development platforms stop at internal work. Mind OS connects your inner growth to real-world outcomes: building income, expanding your sphere of influence, deepening meaningful relationships, and executing on projects that matter.',
      'The Arena ensures that self-improvement doesn\'t stay abstract — it translates into measurable results in the world around you.',
    ],
    overviewHe: [
      'הזירה היא המקום שבו פיתוח פנימי פוגש ביצוע חיצוני. היא מכסה 5 תחומים: עושר, השפעה, מערכות יחסים, עסקים ופרויקטים — כל אחד מתחבר ישירות לפיתוח ה-Core שלך.',
      'רוב פלטפורמות הפיתוח האישי עוצרות בעבודה פנימית. Mind OS מחבר את הצמיחה הפנימית שלך לתוצאות בעולם האמיתי: בניית הכנסה, הרחבת מעגל ההשפעה, העמקת מערכות יחסים משמעותיות וביצוע פרויקטים שחשובים.',
      'הזירה מבטיחה ששיפור עצמי לא נשאר מופשט — הוא מתורגם לתוצאות מדידות בעולם סביבך.',
    ],
    benefitsEn: [
      { title: 'Wealth Intelligence', desc: 'Track income streams, financial habits, and wealth-building strategies with AI-guided optimization.' },
      { title: 'Influence Mapping', desc: 'Understand and grow your sphere of influence through strategic relationship and brand building.' },
      { title: 'Relationship Engineering', desc: 'Deepen meaningful connections with structured assessments and development frameworks.' },
      { title: 'Core-Arena Connection', desc: 'See how your internal development directly impacts your external results — and vice versa.' },
    ],
    benefitsHe: [
      { title: 'אינטליגנציית עושר', desc: 'עקוב אחרי זרמי הכנסה, הרגלים פיננסיים ואסטרטגיות בניית עושר עם אופטימיזציה מודרכת AI.' },
      { title: 'מיפוי השפעה', desc: 'הבן וגדל את מעגל ההשפעה שלך דרך בניית מערכות יחסים אסטרטגיות ומיתוג.' },
      { title: 'הנדסת מערכות יחסים', desc: 'העמק חיבורים משמעותיים עם הערכות מובנות ומסגרות פיתוח.' },
      { title: 'חיבור Core-Arena', desc: 'ראה איך הפיתוח הפנימי שלך משפיע ישירות על התוצאות החיצוניות — ולהיפך.' },
    ],
    howItWorksEn: [
      { step: 'Domain Selection', desc: 'Enter Wealth, Influence, Relationships, Business, or Projects from the Arena Hub.' },
      { step: 'Deep Assessment', desc: 'Aurora evaluates your current state in the selected domain through conversational analysis.' },
      { step: 'Strategy Generation', desc: 'Receive a personalized action plan that connects external goals to your internal development.' },
      { step: 'Execution Tracking', desc: 'Track progress on Arena milestones alongside your Core development for holistic growth.' },
    ],
    howItWorksHe: [
      { step: 'בחירת תחום', desc: 'כנס לעושר, השפעה, מערכות יחסים, עסקים או פרויקטים מהאב הזירה.' },
      { step: 'הערכה מעמיקה', desc: 'Aurora מעריכה את המצב הנוכחי שלך בתחום הנבחר דרך ניתוח שיחתי.' },
      { step: 'יצירת אסטרטגיה', desc: 'קבל תוכנית פעולה מותאמת אישית שמחברת מטרות חיצוניות לפיתוח הפנימי שלך.' },
      { step: 'מעקב ביצוע', desc: 'עקוב אחרי התקדמות באבני דרך של הזירה לצד פיתוח ה-Core שלך לצמיחה הוליסטית.' },
    ],
    whoForEn: [
      'Professionals and entrepreneurs who want to connect personal growth to real-world results',
      'People who\'ve done "inner work" but haven\'t seen external change',
      'Ambitious individuals building wealth, influence, and meaningful relationships simultaneously',
    ],
    whoForHe: [
      'אנשי מקצוע ויזמים שרוצים לחבר צמיחה אישית לתוצאות בעולם האמיתי',
      'אנשים שעשו "עבודה פנימית" אבל לא ראו שינוי חיצוני',
      'אנשים שאפתניים שבונים עושר, השפעה ומערכות יחסים משמעותיות בו-זמנית',
    ],
  },
  '90-day-blueprint': {
    slug: '90-day-blueprint',
    tier: 'plus',
    overviewEn: [
      'The 90-Day Transformation Blueprint is your strategic life roadmap — an AI-generated plan that takes your identity, goals, constraints, and current life state, then synthesizes them into a structured 90-day execution framework.',
      'This isn\'t a generic template. Every milestone, habit, and action item is personalized to your specific situation. Aurora considers your energy levels, available time, existing commitments, and psychological readiness when building your plan.',
      'The plan is living — it recalibrates as you complete assessments, hit milestones, and evolve. If your priorities shift, Aurora adjusts. If you stall, she intervenes. The 90-day plan is the spine that connects every other feature in the system.',
    ],
    overviewHe: [
      'תוכנית הטרנספורמציה ל-90 יום היא מפת הדרכים האסטרטגית של החיים שלך — תוכנית שנוצרת ב-AI שלוקחת את הזהות, המטרות, האילוצים ומצב החיים הנוכחי שלך, ואז מסנתזת אותם למסגרת ביצוע מובנית ל-90 ימים.',
      'זו לא תבנית גנרית. כל אבן דרך, הרגל ופריט פעולה מותאם אישית למצב הספציפי שלך. Aurora שוקלת את רמות האנרגיה, הזמן הפנוי, ההתחייבויות הקיימות והמוכנות הפסיכולוגית שלך כשהיא בונה את התוכנית.',
      'התוכנית חיה — היא מכילה מחדש ככל שאתה משלים הערכות, מגיע לאבני דרך ומתפתח. אם העדיפויות שלך משתנות, Aurora מתאימה. אם אתה נתקע, היא מתערבת. תוכנית 90 הימים היא שדרה שמחברת כל פיצ\'ר אחר במערכת.',
    ],
    benefitsEn: [
      { title: 'Fully Personalized', desc: 'Every element is tailored to your specific goals, energy, schedule, and psychological profile — not a one-size-fits-all template.' },
      { title: 'Milestone-Driven', desc: 'Clear weekly milestones with specific actions, making large transformations manageable through incremental progress.' },
      { title: 'Auto-Recalibration', desc: 'Your plan evolves with you. Complete a domain assessment? New insights automatically update your roadmap.' },
      { title: 'Daily Actionability', desc: 'The plan breaks down into daily habits and tasks surfaced in your Today tab — no need to remember what\'s next.' },
      { title: 'Cross-System Integration', desc: 'Your 90-day plan connects to every feature: Aurora coaching, domain assessments, gamification, and hypnosis sessions.' },
    ],
    benefitsHe: [
      { title: 'מותאם אישית לחלוטין', desc: 'כל אלמנט מותאם למטרות, אנרגיה, לוח זמנים ופרופיל פסיכולוגי ספציפיים שלך — לא תבנית אחת לכולם.' },
      { title: 'מונע אבני דרך', desc: 'אבני דרך שבועיות ברורות עם פעולות ספציפיות, הופכות טרנספורמציות גדולות לניתנות לניהול דרך התקדמות הדרגתית.' },
      { title: 'כיול מחדש אוטומטי', desc: 'התוכנית שלך מתפתחת איתך. השלמת הערכת תחום? תובנות חדשות מעדכנות אוטומטית את מפת הדרכים.' },
      { title: 'יכולת פעולה יומית', desc: 'התוכנית מתפרקת להרגלים ומשימות יומיות שמופיעים בטאב היום שלך — אין צורך לזכור מה הבא.' },
      { title: 'אינטגרציה חוצת-מערכת', desc: 'תוכנית 90 הימים שלך מתחברת לכל פיצ\'ר: אימון Aurora, הערכות תחום, גיימיפיקציה וסשני היפנוזה.' },
    ],
    howItWorksEn: [
      { step: 'Identity Assessment', desc: 'Aurora maps your values, direction, energy, and current life state through the Launchpad onboarding.' },
      { step: 'Plan Generation', desc: 'An AI engine synthesizes 70+ signals into a structured 90-day plan with weekly milestones and daily actions.' },
      { step: 'Daily Execution', desc: 'Each day, your Today tab shows exactly what to do — habits to maintain, tasks to complete, and milestones approaching.' },
      { step: 'Weekly Recalibration', desc: 'As you complete assessments and hit milestones, Aurora automatically adjusts your plan to reflect your evolution.' },
    ],
    howItWorksHe: [
      { step: 'הערכת זהות', desc: 'Aurora ממפה את הערכים, הכיוון, האנרגיה ומצב החיים הנוכחי שלך דרך אונבורדינג ה-Launchpad.' },
      { step: 'יצירת תוכנית', desc: 'מנוע AI מסנתז 70+ אותות לתוכנית מובנית ל-90 ימים עם אבני דרך שבועיות ופעולות יומיות.' },
      { step: 'ביצוע יומי', desc: 'כל יום, טאב ה-Today שלך מראה בדיוק מה לעשות — הרגלים לשמר, משימות להשלים ואבני דרך שמתקרבות.' },
      { step: 'כיול מחדש שבועי', desc: 'ככל שאתה משלים הערכות ומגיע לאבני דרך, Aurora מתאימה אוטומטית את התוכנית שלך כדי לשקף את ההתפתחות.' },
    ],
    whoForEn: [
      'Anyone who feels stuck without a clear direction',
      'People who set goals but never build a system to achieve them',
      'High performers who want their daily actions aligned with a strategic vision',
    ],
    whoForHe: [
      'כל מי שמרגיש תקוע בלי כיוון ברור',
      'אנשים שמגדירים מטרות אבל אף פעם לא בונים מערכת להשיג אותן',
      'בעלי ביצועים גבוהים שרוצים שהפעולות היומיות שלהם מתואמות עם חזון אסטרטגי',
    ],
  },
  'ai-hypnosis': {
    slug: 'ai-hypnosis',
    tier: 'plus',
    overviewEn: [
      'The AI Hypnosis system generates personalized hypnosis scripts and guided sessions designed to reprogram subconscious patterns that block your transformation.',
      'Traditional coaching works on the conscious mind. But most resistance to change lives in the subconscious — limiting beliefs, fear patterns, identity conflicts, and emotional blocks. The Hypnosis system targets these root-level barriers.',
      'Each session is generated dynamically based on your current challenges, emotional state, and coaching context. Aurora identifies the specific subconscious pattern holding you back and creates a custom session to address it.',
    ],
    overviewHe: [
      'מערכת ההיפנוזה AI מייצרת תסריטי היפנוזה מותאמים אישית וסשנים מונחים שמתוכננים לתכנת מחדש דפוסים תת-מודעים שחוסמים את הטרנספורמציה שלך.',
      'אימון מסורתי עובד על המודע. אבל רוב ההתנגדות לשינוי חיה בתת-מודע — אמונות מגבילות, דפוסי פחד, קונפליקטים זהותיים וחסימות רגשיות. מערכת ההיפנוזה מכוונת למחסומים ברמת השורש.',
      'כל סשן נוצר דינמית על סמך האתגרים הנוכחיים, המצב הרגשי וההקשר האימוני שלך. Aurora מזהה את הדפוס התת-מודע הספציפי שמעכב אותך ויוצרת סשן מותאם כדי לטפל בו.',
    ],
    benefitsEn: [
      { title: 'Personalized Scripts', desc: 'Every session is generated specifically for your current situation — no generic guided meditations.' },
      { title: 'Root-Level Change', desc: 'Target subconscious beliefs and patterns that conscious effort alone can\'t change.' },
      { title: 'Context-Aware', desc: 'Sessions adapt based on your coaching conversations, emotional state, and current challenges.' },
      { title: 'Identity Integration', desc: 'Accelerate the shift from your current identity to your target self through deep subconscious alignment.' },
    ],
    benefitsHe: [
      { title: 'תסריטים מותאמים אישית', desc: 'כל סשן נוצר ספציפית למצב הנוכחי שלך — בלי מדיטציות מונחות גנריות.' },
      { title: 'שינוי ברמת השורש', desc: 'מכוון לאמונות ודפוסים תת-מודעים שמאמץ מודע בלבד לא יכול לשנות.' },
      { title: 'מודע להקשר', desc: 'הסשנים מותאמים על סמך שיחות האימון, המצב הרגשי והאתגרים הנוכחיים שלך.' },
      { title: 'אינטגרציית זהות', desc: 'האץ את המעבר מהזהות הנוכחית שלך לעצמי היעד דרך יישור תת-מודע עמוק.' },
    ],
    howItWorksEn: [
      { step: 'Pattern Identification', desc: 'Aurora identifies a specific subconscious pattern blocking your progress through coaching analysis.' },
      { step: 'Script Generation', desc: 'A personalized hypnosis script is generated targeting that specific pattern with therapeutic precision.' },
      { step: 'Guided Session', desc: 'Listen to the AI-generated session in a comfortable setting with audio guidance.' },
      { step: 'Integration', desc: 'Post-session reflection with Aurora to integrate insights and track subconscious shifts over time.' },
    ],
    howItWorksHe: [
      { step: 'זיהוי דפוס', desc: 'Aurora מזהה דפוס תת-מודע ספציפי שחוסם את ההתקדמות שלך דרך ניתוח אימוני.' },
      { step: 'יצירת תסריט', desc: 'תסריט היפנוזה מותאם אישית נוצר שמכוון לדפוס הספציפי הזה עם דיוק טיפולי.' },
      { step: 'סשן מונחה', desc: 'הקשב לסשן שנוצר ב-AI בסביבה נוחה עם הנחיה קולית.' },
      { step: 'אינטגרציה', desc: 'רפלקציה לאחר הסשן עם Aurora כדי לשלב תובנות ולעקוב אחרי שינויים תת-מודעים לאורך זמן.' },
    ],
    whoForEn: [
      'Anyone who feels internal resistance to change despite conscious effort',
      'People dealing with limiting beliefs, fear patterns, or identity blocks',
      'Those who want to accelerate transformation beyond what coaching alone can achieve',
    ],
    whoForHe: [
      'כל מי שמרגיש התנגדות פנימית לשינוי למרות מאמץ מודע',
      'אנשים שמתמודדים עם אמונות מגבילות, דפוסי פחד או חסימות זהותיות',
      'מי שרוצה להאיץ טרנספורמציה מעבר למה שאימון לבדו יכול להשיג',
    ],
  },
  'gamified-growth': {
    slug: 'gamified-growth',
    tier: 'free',
    overviewEn: [
      'The Gamified Growth System transforms personal development from a chore into a high-performance game. Every action you take — completing tasks, building habits, finishing assessments — earns XP, unlocks achievements, and levels up your identity.',
      'This isn\'t superficial gamification. The system is psychologically engineered to create sustainable motivation loops. Streaks reward consistency. XP visualizes progress that\'s normally invisible. Identity titles create aspirational milestones that pull you forward.',
      'Energy tokens add a strategic resource layer — spend them on hypnosis sessions, AI re-evaluations, and premium features. This creates meaningful choices about how you invest in your growth.',
    ],
    overviewHe: [
      'מערכת הצמיחה הגיימיפיקטית הופכת פיתוח אישי מעול למשחק ביצועים גבוהים. כל פעולה שאתה עושה — השלמת משימות, בניית הרגלים, סיום הערכות — מרוויחה XP, פותחת הישגים ומעלה את הזהות שלך רמה.',
      'זו לא גיימיפיקציה שטחית. המערכת מתוכננת פסיכולוגית ליצירת לולאות מוטיבציה ברות-קיימא. רצפים מתגמלים עקביות. XP מדמיין התקדמות שבדרך כלל בלתי נראית. תארי זהות יוצרים אבני דרך שאיפתיות שמושכות אותך קדימה.',
      'טוקני אנרגיה מוסיפים שכבת משאבים אסטרטגית — השתמש בהם לסשני היפנוזה, הערכות מחדש AI ופיצ\'רים פרימיום. זה יוצר בחירות משמעותיות על איך אתה משקיע בצמיחה שלך.',
    ],
    benefitsEn: [
      { title: 'XP & Level System', desc: 'Every meaningful action earns experience points, creating a visible progression path through your transformation.' },
      { title: 'Streak Mechanics', desc: 'Build daily streaks that reward consistency and make breaking habits psychologically costly.' },
      { title: 'Achievement Unlocks', desc: 'Hit milestones and unlock identity titles, badges, and visual upgrades for your Orb.' },
      { title: 'Energy Token Economy', desc: 'Earn and spend energy tokens on premium features — adding strategic depth to your growth decisions.' },
      { title: 'Leaderboard & Social', desc: 'Optional community leaderboards create healthy competition and accountability.' },
    ],
    benefitsHe: [
      { title: 'מערכת XP ורמות', desc: 'כל פעולה משמעותית מרוויחה נקודות ניסיון, יוצרת מסלול התקדמות נראה דרך הטרנספורמציה שלך.' },
      { title: 'מכניקת רצפים', desc: 'בנה רצפים יומיים שמתגמלים עקביות והופכים שבירת הרגלים ליקרה פסיכולוגית.' },
      { title: 'פתיחת הישגים', desc: 'הגע לאבני דרך ופתח תארי זהות, תגים ושדרוגים חזותיים ל-Orb שלך.' },
      { title: 'כלכלת טוקני אנרגיה', desc: 'הרוויח והוצא טוקני אנרגיה על פיצ\'רים פרימיום — מוסיף עומק אסטרטגי להחלטות הצמיחה שלך.' },
      { title: 'טבלת מובילים וחברתי', desc: 'טבלאות מובילים קהילתיות אופציונליות יוצרות תחרות בריאה ואחריותיות.' },
    ],
    howItWorksEn: [
      { step: 'Action → XP', desc: 'Complete tasks, habits, assessments, and coaching sessions to earn XP and energy tokens.' },
      { step: 'Level Progression', desc: 'Accumulate XP to level up, unlocking new identity titles and Orb visual upgrades.' },
      { step: 'Streak Building', desc: 'Maintain daily consistency to build streaks that multiply your XP earnings.' },
      { step: 'Token Economy', desc: 'Spend energy tokens on hypnosis sessions, re-evaluations, and premium AI interactions.' },
    ],
    howItWorksHe: [
      { step: 'פעולה → XP', desc: 'השלם משימות, הרגלים, הערכות וסשני אימון כדי להרוויח XP וטוקני אנרגיה.' },
      { step: 'עליית רמה', desc: 'צבור XP כדי לעלות רמה, פותח תארי זהות חדשים ושדרוגים חזותיים ל-Orb.' },
      { step: 'בניית רצף', desc: 'שמור על עקביות יומית כדי לבנות רצפים שמכפילים את רווחי ה-XP שלך.' },
      { step: 'כלכלת טוקנים', desc: 'הוצא טוקני אנרגיה על סשני היפנוזה, הערכות מחדש ואינטראקציות AI פרימיום.' },
    ],
    whoForEn: [
      'Gamers and competitive personalities who thrive on progression systems',
      'Anyone who struggles with motivation and consistency in self-improvement',
      'People who respond better to rewards and milestones than abstract goals',
    ],
    whoForHe: [
      'גיימרים ואישיויות תחרותיות שמשגשגים על מערכות התקדמות',
      'כל מי שמתקשה עם מוטיבציה ועקביות בשיפור עצמי',
      'אנשים שמגיבים טוב יותר לתגמולים ואבני דרך מאשר למטרות מופשטות',
    ],
  },
  'project-engine': {
    slug: 'project-engine',
    tier: 'apex',
    overviewEn: [
      'The Project & Execution Engine is where strategy meets action. It\'s a premium project management system that maps your projects directly to life pillars, breaks high-level goals into executable tasks, and uses Aurora to track momentum.',
      'Unlike generic project management tools, this engine understands context. It knows which life domains your project impacts, how your energy and focus levels affect execution, and when to push harder or pull back based on your holistic state.',
      'This is built for founders, creators, and ambitious professionals who need to execute complex projects while maintaining personal development momentum.',
    ],
    overviewHe: [
      'מנוע הפרויקטים והביצוע הוא המקום שבו אסטרטגיה פוגשת פעולה. זוהי מערכת ניהול פרויקטים פרימיום שממפה את הפרויקטים שלך ישירות לעמודי חיים, מפרקת מטרות גבוהות למשימות ברות-ביצוע ומשתמשת ב-Aurora כדי לעקוב אחרי מומנטום.',
      'בניגוד לכלי ניהול פרויקטים גנריים, המנוע הזה מבין הקשר. הוא יודע אילו תחומי חיים הפרויקט שלך משפיע עליהם, איך רמות האנרגיה והמיקוד שלך משפיעות על ביצוע, ומתי לדחוף חזק יותר או לסגת בהתאם למצב ההוליסטי שלך.',
      'זה בנוי למייסדים, יוצרים ואנשי מקצוע שאפתניים שצריכים לבצע פרויקטים מורכבים תוך שמירה על מומנטום פיתוח אישי.',
    ],
    benefitsEn: [
      { title: 'Life-Pillar Mapping', desc: 'Every project connects to specific life domains, showing how your work impacts your overall development.' },
      { title: 'Goal Decomposition', desc: 'Break ambitious visions into 90-day goals, weekly milestones, and daily actionable tasks.' },
      { title: 'AI Momentum Tracking', desc: 'Aurora monitors your project velocity and intervenes when momentum drops or blockers emerge.' },
      { title: 'Context-Aware Scheduling', desc: 'The engine considers your energy levels, focus capacity, and life commitments when suggesting task priorities.' },
      { title: 'Guided Onboarding', desc: 'A 6-step wizard captures your project vision, purpose, and desired outcomes for structured setup.' },
    ],
    benefitsHe: [
      { title: 'מיפוי עמודי חיים', desc: 'כל פרויקט מתחבר לתחומי חיים ספציפיים, מראה איך העבודה שלך משפיעה על ההתפתחות הכוללת.' },
      { title: 'פירוק מטרות', desc: 'פרק חזונות שאפתניים למטרות ל-90 ימים, אבני דרך שבועיות ומשימות יומיות ברות-ביצוע.' },
      { title: 'מעקב מומנטום AI', desc: 'Aurora עוקבת אחרי מהירות הפרויקט שלך ומתערבת כשהמומנטום יורד או חסימות צצות.' },
      { title: 'תזמון מודע להקשר', desc: 'המנוע שוקל את רמות האנרגיה, יכולת המיקוד והתחייבויות החיים שלך כשהוא מציע עדיפויות משימות.' },
      { title: 'אונבורדינג מונחה', desc: 'אשף בן 6 שלבים שלוכד את חזון הפרויקט, המטרה והתוצאות הרצויות שלך להגדרה מובנית.' },
    ],
    howItWorksEn: [
      { step: 'Project Wizard', desc: 'Walk through a 6-step guided setup that captures your project vision, purpose, pillars, and success criteria.' },
      { step: 'Goal & Task Breakdown', desc: 'Aurora decomposes your project into structured goals and tasks connected to your 90-day plan.' },
      { step: 'Daily Integration', desc: 'Project tasks appear in your Today tab alongside personal development actions for unified execution.' },
      { step: 'Momentum Monitoring', desc: 'Aurora tracks completion rates, flags blockers, and proactively coaches you through execution challenges.' },
    ],
    howItWorksHe: [
      { step: 'אשף פרויקט', desc: 'עבור דרך הגדרה מונחית בת 6 שלבים שלוכדת את חזון הפרויקט, המטרה, העמודים וקריטריוני ההצלחה.' },
      { step: 'פירוק מטרות ומשימות', desc: 'Aurora מפרקת את הפרויקט שלך למטרות ומשימות מובנות שמחוברות לתוכנית 90 הימים.' },
      { step: 'אינטגרציה יומית', desc: 'משימות פרויקט מופיעות בטאב ה-Today שלך לצד פעולות פיתוח אישי לביצוע אחוד.' },
      { step: 'מעקב מומנטום', desc: 'Aurora עוקבת אחרי שיעורי השלמה, מסמנת חסימות ומאמנת אותך יזומית דרך אתגרי ביצוע.' },
    ],
    whoForEn: [
      'Founders and entrepreneurs managing complex ventures',
      'Creators shipping ambitious projects alongside personal growth',
      'Professionals who need project management connected to their life strategy',
    ],
    whoForHe: [
      'מייסדים ויזמים שמנהלים מיזמים מורכבים',
      'יוצרים שמשיקים פרויקטים שאפתניים לצד צמיחה אישית',
      'אנשי מקצוע שצריכים ניהול פרויקטים מחובר לאסטרטגיית החיים שלהם',
    ],
  },
  'proactive-coaching': {
    slug: 'proactive-coaching',
    tier: 'apex',
    overviewEn: [
      'Proactive Coaching transforms Aurora from a reactive assistant into a true life operating system. Instead of waiting for you to open the app, Aurora initiates — sending morning briefings, mid-day check-ins, and accountability prompts based on your schedule and patterns.',
      'This is the difference between having a coach you visit and having a coach who\'s always watching your back. Aurora knows when you\'re likely to skip a habit, when stress is building before you notice, and when momentum is shifting.',
      'The system is designed for discipline without burnout. Aurora calibrates intervention frequency based on your responsiveness and energy levels — pushing when you need it, backing off when you need space.',
    ],
    overviewHe: [
      'אימון יזום הופך את Aurora מעוזרת תגובתית למערכת הפעלה אמיתית לחיים. במקום לחכות שתפתח את האפליקציה, Aurora יוזמת — שולחת תדרוכי בוקר, צ\'ק-אינים בצהריים ודחיפות אחריותיות בהתאם ללוח הזמנים והדפוסים שלך.',
      'זה ההבדל בין שיש לך מאמן שאתה מבקר לבין שיש לך מאמן שתמיד שומר עליך. Aurora יודעת מתי סביר שתדלג על הרגל, מתי סטרס מצטבר לפני שאתה שם לב, ומתי המומנטום משתנה.',
      'המערכת מתוכננת למשמעת בלי שחיקה. Aurora מכילה את תדירות ההתערבות בהתאם לתגובתיות ורמות האנרגיה שלך — דוחפת כשאתה צריך, נסוגת כשאתה צריך מרחב.',
    ],
    benefitsEn: [
      { title: 'Morning Briefings', desc: 'Start every day with a personalized strategy brief covering your priorities, energy level, and key actions.' },
      { title: 'Accountability Nudges', desc: 'Get timely reminders before you fall off track — not after damage is done.' },
      { title: 'Pattern Detection', desc: 'Aurora identifies negative patterns forming and intervenes before they become habits.' },
      { title: 'Adaptive Frequency', desc: 'Intervention intensity adjusts based on your responsiveness — no notification fatigue.' },
      { title: 'Seamless Chat Handoff', desc: 'Every nudge connects directly to a coaching conversation for immediate action.' },
    ],
    benefitsHe: [
      { title: 'תדרוכי בוקר', desc: 'התחל כל יום עם תדרוך אסטרטגי מותאם אישית שמכסה את העדיפויות, רמת האנרגיה והפעולות המרכזיות.' },
      { title: 'דחיפות אחריותיות', desc: 'קבל תזכורות בזמן לפני שאתה יורד מהמסלול — לא אחרי שהנזק נעשה.' },
      { title: 'זיהוי דפוסים', desc: 'Aurora מזהה דפוסים שליליים שמתגבשים ומתערבת לפני שהם הופכים להרגלים.' },
      { title: 'תדירות אדפטיבית', desc: 'עוצמת ההתערבות מותאמת בהתאם לתגובתיות שלך — בלי עייפות התראות.' },
      { title: 'העברה חלקה לצ\'אט', desc: 'כל דחיפה מתחברת ישירות לשיחת אימון לפעולה מיידית.' },
    ],
    howItWorksEn: [
      { step: 'Schedule Learning', desc: 'Aurora learns your daily patterns, peak times, and when you\'re most receptive to coaching.' },
      { step: 'Queue Building', desc: 'The proactive system builds a priority queue of interventions based on your plan, habits, and behavioral signals.' },
      { step: 'Smart Delivery', desc: 'Nudges are delivered at optimal times — morning briefings, pre-deadline reminders, and pattern-based check-ins.' },
      { step: 'Response Calibration', desc: 'Based on how you respond to nudges, Aurora adjusts frequency and intensity for maximum impact without fatigue.' },
    ],
    howItWorksHe: [
      { step: 'למידת לוח זמנים', desc: 'Aurora לומדת את הדפוסים היומיים שלך, זמני שיא, ומתי אתה הכי קולט לאימון.' },
      { step: 'בניית תור', desc: 'המערכת היזומה בונה תור עדיפות של התערבויות בהתאם לתוכנית, הרגלים ואותות התנהגותיים.' },
      { step: 'משלוח חכם', desc: 'דחיפות מועברות בזמנים אופטימליים — תדרוכי בוקר, תזכורות לפני דדליין וצ\'ק-אינים מבוססי דפוסים.' },
      { step: 'כיול תגובה', desc: 'על סמך איך אתה מגיב לדחיפות, Aurora מתאימה תדירות ועוצמה להשפעה מרבית בלי עייפות.' },
    ],
    whoForEn: [
      'People who need external accountability to stay consistent',
      'Busy professionals who forget to check in with their development plan',
      'Anyone who wants AI that works for them, not just responds to them',
    ],
    whoForHe: [
      'אנשים שצריכים אחריותיות חיצונית כדי לשמור על עקביות',
      'אנשי מקצוע עסוקים ששוכחים לעשות צ\'ק-אין עם תוכנית הפיתוח שלהם',
      'כל מי שרוצה AI שעובד בשבילו, לא רק מגיב לו',
    ],
  },
};
