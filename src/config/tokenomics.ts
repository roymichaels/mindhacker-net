export const tokenomicsConfig = {
  token: {
    name: 'MOS',
    totalSupply: 100_000_000,
    description: {
      en: 'MOS is the native utility token of the MindOS ecosystem, used to power payments, rewards, access, and marketplace activity.',
      he: 'MOS הוא טוקן השימוש המקומי של אקוסיסטם MindOS, המשמש להנעת תשלומים, תגמולים, גישה ופעילות בשוק.',
    },
  },

  distribution: [
    { key: 'community', pct: 30, color: 'hsl(204, 88%, 53%)', en: 'Community & Rewards', he: 'קהילה ותגמולים', descEn: 'Incentives for active users, miners, and contributors.', descHe: 'תמריצים למשתמשים פעילים, כורים ותורמים.' },
    { key: 'treasury', pct: 20, color: 'hsl(270, 70%, 60%)', en: 'Treasury', he: 'אוצר', descEn: 'Strategic reserve for ecosystem development.', descHe: 'רזרבה אסטרטגית לפיתוח האקוסיסטם.' },
    { key: 'team', pct: 15, color: 'hsl(160, 70%, 45%)', en: 'Team (Vesting)', he: 'צוות (הבשלה)', descEn: 'Team allocation with multi-year vesting schedule.', descHe: 'הקצאת צוות עם לוח הבשלה רב-שנתי.' },
    { key: 'genesis', pct: 15, color: 'hsl(45, 90%, 55%)', en: 'Genesis / Early Contributors', he: 'ג׳נסיס / תורמים מוקדמים', descEn: 'Early supporters who believed in the vision.', descHe: 'תומכים מוקדמים שהאמינו בחזון.' },
    { key: 'liquidity', pct: 10, color: 'hsl(340, 75%, 55%)', en: 'Liquidity', he: 'נזילות', descEn: 'DEX and CEX liquidity provisioning.', descHe: 'הספקת נזילות ל-DEX ו-CEX.' },
    { key: 'partnerships', pct: 10, color: 'hsl(190, 80%, 50%)', en: 'Partnerships', he: 'שותפויות', descEn: 'Strategic integrations and co-development.', descHe: 'אינטגרציות אסטרטגיות ופיתוח משותף.' },
  ],

  platformFee: {
    rate: 2,
    example: { payment: 100, toSeller: 98, toFee: 2 },
    allocation: [
      { key: 'treasury', pct: 50, color: 'hsl(270, 70%, 60%)', en: 'Treasury', he: 'אוצר' },
      { key: 'rewards', pct: 25, color: 'hsl(204, 88%, 53%)', en: 'Rewards Pool', he: 'מאגר תגמולים' },
      { key: 'reserve', pct: 25, color: 'hsl(160, 70%, 45%)', en: 'Reserve', he: 'רזרבה' },
    ],
  },

  utility: [
    { icon: 'CreditCard', en: 'Payments', he: 'תשלומים', descEn: 'Pay for services, sessions, and products.', descHe: 'שלם עבור שירותים, מפגשים ומוצרים.' },
    { icon: 'Briefcase', en: 'Services', he: 'שירותים', descEn: 'Purchase coaching, therapy, and freelance work.', descHe: 'רכוש אימון, טיפול ועבודה פרילנס.' },
    { icon: 'GraduationCap', en: 'Coaching', he: 'אימון', descEn: 'Unlock premium coaching sessions.', descHe: 'גישה למפגשי אימון פרמיום.' },
    { icon: 'Unlock', en: 'Feature Unlocks', he: 'פתיחת תכונות', descEn: 'Access advanced tools and AI modes.', descHe: 'גישה לכלים מתקדמים ומצבי AI.' },
    { icon: 'Zap', en: 'Boosts', he: 'שיפורים', descEn: 'Accelerate progress with power-ups.', descHe: 'האץ התקדמות עם חיזוקים.' },
    { icon: 'Globe', en: 'Ecosystem Access', he: 'גישה לאקוסיסטם', descEn: 'Full participation in the MindOS economy.', descHe: 'השתתפות מלאה בכלכלת MindOS.' },
  ],

  earningSources: [
    { icon: 'TrendingUp', en: 'Growth Tasks', he: 'משימות צמיחה', descEn: 'Complete daily actions and milestones.', descHe: 'השלם פעולות יומיות ואבני דרך.' },
    { icon: 'Hammer', en: 'Work & Services', he: 'עבודה ושירותים', descEn: 'Sell services in the FreeMarket.', descHe: 'מכור שירותים ב-FreeMarket.' },
    { icon: 'Target', en: 'Bounties', he: 'באונטי', descEn: 'Complete community bounties for rewards.', descHe: 'השלם משימות קהילתיות עבור תגמולים.' },
    { icon: 'FileText', en: 'Content', he: 'תוכן', descEn: 'Create and share valuable content.', descHe: 'צור ושתף תוכן בעל ערך.' },
    { icon: 'Users', en: 'Community', he: 'קהילה', descEn: 'Engage, help others, and build reputation.', descHe: 'צור מעורבות, עזור ובנה מוניטין.' },
  ],

  sustainability: [
    { en: 'No guaranteed profits — MOS is a utility token, not a financial instrument.', he: 'אין רווחים מובטחים — MOS הוא טוקן שימוש, לא מכשיר פיננסי.' },
    { en: 'Rewards are tied to real activity — no artificial inflation or empty incentives.', he: 'תגמולים מבוססים על פעילות אמיתית — ללא אינפלציה מלאכותית.' },
    { en: 'The economy grows with usage — value is created by participants, not speculation.', he: 'הכלכלה גדלה עם השימוש — ערך נוצר על ידי המשתתפים.' },
    { en: 'Designed for ecosystem participation, not speculative trading.', he: 'מתוכנן להשתתפות באקוסיסטם, לא למסחר ספקולטיבי.' },
  ],

  walletPreview: {
    balance: 2_450,
    earned: 3_800,
    spent: 1_350,
    fees: 42,
  },
};
