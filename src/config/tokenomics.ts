export const tokenomicsConfig = {
  token: {
    name: 'MOS',
    totalSupply: 100_000_000,
    rate: '100 MOS = $1.00',
    description: {
      en: 'MOS is the native utility token of the MindOS ecosystem. It powers payments, rewards, access, and marketplace activity. MOS is earned through growth and contribution — not mining.',
      he: 'MOS הוא טוקן השימוש המקומי של אקוסיסטם MindOS. הוא מניע תשלומים, תגמולים, גישה ופעילות בשוק. MOS מרוויחים דרך צמיחה ותרומה — לא כרייה.',
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
    appliesTo: {
      en: ['Services', 'Coaching', 'Products', 'Bounties'],
      he: ['שירותים', 'אימון', 'מוצרים', 'באונטי'],
    },
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
    { icon: 'Database', en: 'Data Contribution', he: 'תרומת נתונים', descEn: 'Opt-in anonymized data sharing for MOS rewards.', descHe: 'שיתוף נתונים אנונימי בהסכמה עבור תגמולי MOS.' },
  ],

  spending: [
    { icon: 'ShoppingCart', en: 'Pay for Services', he: 'תשלום עבור שירותים', descEn: 'Book sessions, hire freelancers, buy products.', descHe: 'הזמן מפגשים, שכור פרילנסרים, רכוש מוצרים.' },
    { icon: 'GraduationCap', en: 'Pay Coaches', he: 'תשלום למאמנים', descEn: 'Access premium coaching and mentorship.', descHe: 'גישה לאימון ולחונכות פרמיום.' },
    { icon: 'Unlock', en: 'Unlock Features', he: 'פתיחת תכונות', descEn: 'Premium AI tools and advanced modes.', descHe: 'כלי AI פרמיום ומצבים מתקדמים.' },
    { icon: 'Rocket', en: 'Boost Visibility', he: 'שיפור נראות', descEn: 'Promote services in the marketplace.', descHe: 'קדם שירותים בשוק.' },
    { icon: 'Layers', en: 'Advanced Layers', he: 'שכבות מתקדמות', descEn: 'Access deeper analysis and system features.', descHe: 'גישה לניתוח עמוק ותכונות מערכת.' },
  ],

  sinkMechanisms: [
    { icon: 'Lock', en: 'Feature Unlocks', he: 'פתיחת תכונות', descEn: 'Tokens spent on features are removed from circulation.', descHe: 'טוקנים שהוצאו על תכונות מוצאים ממחזור.' },
    { icon: 'Zap', en: 'Boosts', he: 'שיפורים', descEn: 'Boost purchases permanently reduce supply.', descHe: 'רכישות שיפור מפחיתות לצמיתות את ההיצע.' },
    { icon: 'Crown', en: 'Premium Tiers', he: 'שכבות פרמיום', descEn: 'Higher tier access consumes tokens.', descHe: 'גישה לשכבות גבוהות צורכת טוקנים.' },
    { icon: 'Shield', en: 'Access Layers', he: 'שכבות גישה', descEn: 'Exclusive content and tools require MOS.', descHe: 'תוכן וכלים בלעדיים דורשים MOS.' },
  ],
  sinkFuture: {
    en: 'Future mechanisms may include staking and time-locked deposits.',
    he: 'מנגנונים עתידיים עשויים לכלול staking והפקדות נעולות-זמן.',
  },

  rewardControl: {
    description: {
      en: 'Rewards are algorithmically controlled to maintain economic balance. The system adjusts dynamically based on ecosystem activity.',
      he: 'התגמולים נשלטים אלגוריתמית לשמירה על איזון כלכלי. המערכת מתכווננת דינמית על בסיס פעילות האקוסיסטם.',
    },
    mechanisms: [
      { icon: 'Activity', en: 'Dynamic Rewards', he: 'תגמולים דינמיים', descEn: 'Reward amounts scale with real ecosystem activity.', descHe: 'סכומי התגמול מותאמים לפעילות אמיתית באקוסיסטם.' },
      { icon: 'Clock', en: 'Cooldowns', he: 'זמני המתנה', descEn: 'Time-based limits prevent reward abuse.', descHe: 'מגבלות מבוססות זמן מונעות ניצול לרעה.' },
      { icon: 'BarChart3', en: 'Scaling Curves', he: 'עקומות קנה מידה', descEn: 'Diminishing returns on repeated identical actions.', descHe: 'תשואה פוחתת על פעולות זהות חוזרות.' },
      { icon: 'ShieldAlert', en: 'Anti-Farming', he: 'מניעת ניצול', descEn: 'Automated detection of abuse patterns.', descHe: 'זיהוי אוטומטי של דפוסי ניצול.' },
    ],
  },

  reputation: {
    description: {
      en: 'Not all users are equal in the MOS economy. Rewards, opportunities, and access scale with reputation — earned through consistent, genuine engagement.',
      he: 'לא כל המשתמשים שווים בכלכלת MOS. תגמולים, הזדמנויות וגישה מותאמים למוניטין — שנרכש דרך מעורבות עקבית ואמיתית.',
    },
    factors: [
      { icon: 'Activity', en: 'Activity Level', he: 'רמת פעילות', descEn: 'Consistent daily engagement and contribution.', descHe: 'מעורבות ותרומה יומית עקבית.' },
      { icon: 'CheckCircle', en: 'Reliability', he: 'אמינות', descEn: 'Completed commitments and delivered services.', descHe: 'התחייבויות שהושלמו ושירותים שסופקו.' },
      { icon: 'Heart', en: 'Contribution', he: 'תרומה', descEn: 'Value added to the community and ecosystem.', descHe: 'ערך שנוסף לקהילה ולאקוסיסטם.' },
      { icon: 'Star', en: 'Experience', he: 'ניסיון', descEn: 'Time and depth of ecosystem participation.', descHe: 'זמן ועומק ההשתתפות באקוסיסטם.' },
    ],
  },

  dataContribution: {
    description: {
      en: 'Users can opt in to share anonymized behavioral data with the MindOS research layer and earn MOS in return. This is always optional, fully anonymized, and user-controlled.',
      he: 'משתמשים יכולים להצטרף לשיתוף נתונים התנהגותיים אנונימיים עם שכבת המחקר של MindOS ולהרוויח MOS בתמורה. זה תמיד אופציונלי, אנונימי לחלוטין ובשליטת המשתמש.',
    },
    principles: [
      { en: 'Opt-in only — never default-enabled.', he: 'הסכמה בלבד — אף פעם לא מופעל כברירת מחדל.' },
      { en: 'Fully anonymized — no personal identifiers.', he: 'אנונימי לחלוטין — ללא מזהים אישיים.' },
      { en: 'User-controlled — toggle on/off at any time.', he: 'בשליטת המשתמש — הפעלה/כיבוי בכל עת.' },
      { en: 'Transparent — users see what data is shared.', he: 'שקוף — המשתמשים רואים אילו נתונים משותפים.' },
    ],
  },

  sustainability: [
    { en: 'No guaranteed profits — MOS is a utility token, not a financial instrument.', he: 'אין רווחים מובטחים — MOS הוא טוקן שימוש, לא מכשיר פיננסי.' },
    { en: 'No speculative promises — value is tied to ecosystem utility.', he: 'אין הבטחות ספקולטיביות — הערך קשור לשימושיות האקוסיסטם.' },
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
