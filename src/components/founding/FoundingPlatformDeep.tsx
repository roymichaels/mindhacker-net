import { motion } from 'framer-motion';
import {
  Heart, Zap, Brain, Gem, Sparkles, Swords,
  Globe, Radio, Users, Briefcase, FolderKanban, Gamepad2,
  Target, Dumbbell, BookOpen,
} from 'lucide-react';

const pillars = [
  { icon: Heart, label: 'חיוניות', desc: 'תזונה, שינה, אנרגיה', color: '#f43f5e' },
  { icon: Dumbbell, label: 'כוח', desc: 'אימון גופני ועוצמה', color: '#f97316' },
  { icon: Brain, label: 'מיקוד', desc: 'ריכוז, זמן עמוק, פרודוקטיביות', color: '#3b82f6' },
  { icon: Gem, label: 'עושר', desc: 'ניהול כספי, השקעות, חיסכון', color: '#10b981' },
  { icon: Sparkles, label: 'תודעה', desc: 'מדיטציה, רפלקציה, צמיחה רוחנית', color: '#8b5cf6' },
  { icon: Swords, label: 'לחימה', desc: 'אומנויות לחימה, חוסן מנטלי', color: '#ef4444' },
  { icon: Globe, label: 'התרחבות', desc: 'למידה, מיומנויות חדשות, סקרנות', color: '#6366f1' },
  { icon: Radio, label: 'השפעה', desc: 'מנהיגות, תקשורת, נוכחות', color: '#f59e0b' },
  { icon: Users, label: 'מערכות יחסים', desc: 'קשרים, משפחה, חברויות', color: '#ec4899' },
  { icon: Briefcase, label: 'עסקים', desc: 'יזמות, קריירה, פרנסה', color: '#06b6d4' },
  { icon: FolderKanban, label: 'פרויקטים', desc: 'ניהול יעדים ומשימות', color: '#14b8a6' },
  { icon: Gamepad2, label: 'משחק', desc: 'הנאה, יצירתיות, חוויות', color: '#d946ef' },
];

const features = [
  {
    emoji: '🧠',
    title: 'AION — הגרסה העתידית שלך',
    desc: 'בינה מלאכותית שמכירה אותך לעומק — את החוזקות, את הדפוסים, את החלומות. היא לא נותנת עצות גנריות. היא בונה לך תוכנית מותאמת אישית ל-100 יום ומנווטת אותך בכל יום מחדש.',
  },
  {
    emoji: '🗺️',
    title: 'תוכנית 100 יום',
    desc: 'לא עוד רשימת משימות. תוכנית אמיתית שנבנית ממי שאתה, מה המטרות שלך, ומה קורה בחיים שלך. כל יום מקבל משימות ספציפיות עם הנחיות צעד-אחר-צעד, מחולקות לפי תחומי חיים.',
  },
  {
    emoji: '🎮',
    title: 'גיימיפיקציה אמיתית',
    desc: 'XP, רמות, אבני דרך, סטריקים, אווטאר אישי — כל פעולה שלך מתורגמת להתקדמות ממשית. המערכת הופכת את המסע שלך לחוויה מעורבת ומניעה לפעול.',
  },
  {
    emoji: '🏪',
    title: 'FreeMarket — שוק פנימי',
    desc: 'מכור שירותים, ידע, וכלים לחברי הקהילה. קנה ממומחים אחרים. הטוקנים שאתה צובר הופכים לערך אמיתי — אפשר לקנות שירותי קואצ\'ינג, קורסים, ותוכן פרימיום.',
  },
  {
    emoji: '👥',
    title: 'קהילה פעילה',
    desc: 'לא עוד קבוצת וואטסאפ ריקה. קהילה של אנשים שפועלים — עם אירועים, שיתופי פעולה, אתגרים משותפים, ומנטורינג. כאן כולם מתקדמים ביחד.',
  },
  {
    emoji: '📚',
    title: 'למידה מובנית',
    desc: 'גישה לספריית תרגולים, שיטות עבודה מוכחות, ומסלולי למידה מותאמים. כל דבר שהמערכת מציעה לך — מבוסס על מתודולוגיות שעובדות.',
  },
];

const FoundingPlatformDeep = () => {
  return (
    <div className="flex flex-col items-center px-6 py-20 relative z-10" dir="rtl">
      {/* Section: What is this system */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        className="text-center max-w-2xl mb-16"
      >
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
          אז מה זה בעצם?
        </h2>
        <p className="text-base md:text-lg text-white/55 leading-relaxed">
          MindOS היא <span className="text-white/90 font-semibold">מערכת הפעלה לחיים</span>. 
          לא אפליקציית פרודוקטיביות, לא עוד קורס אונליין — 
          אלא פלטפורמה שלמה שמנהלת את כל תחומי החיים שלך במקום אחד.
          <br /><br />
          היא משלבת בינה מלאכותית, תוכנית 100 יום מותאמת אישית, 
          מערכת גיימיפיקציה, קהילה פעילה, ושוק פנימי שבו אתה יכול גם להרוויח.
        </p>
      </motion.div>

      {/* Section: The 12 Pillars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        className="w-full max-w-2xl mb-20"
      >
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 text-center">
          <Target className="inline w-5 h-5 ml-2 text-cyan-400" />
          12 תחומי חיים — הכל במקום אחד
        </h3>
        <p className="text-sm text-white/40 text-center mb-8">
          המערכת מנהלת עבורך את כל התחומים הקריטיים בחיים
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-white/8"
              style={{ background: `${p.color}08` }}
            >
              <p.icon className="w-4.5 h-4.5 shrink-0" style={{ color: p.color }} />
              <div className="min-w-0">
                <div className="text-white/90 font-semibold text-sm truncate">{p.label}</div>
                <div className="text-white/35 text-[10px] truncate">{p.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Section: Core Features Deep Dive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        className="w-full max-w-2xl"
      >
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 text-center">
          <BookOpen className="inline w-5 h-5 ml-2 text-violet-400" />
          מה כלול במערכת
        </h3>
        <p className="text-sm text-white/40 text-center mb-8">
          כל הכלים שצריך כדי לבנות את החיים שרוצים
        </p>

        <div className="flex flex-col gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-5 rounded-2xl border border-white/10 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.03))',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{f.emoji}</span>
                <h4 className="text-white font-bold text-base">{f.title}</h4>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Closing statement */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-white/60 text-center mt-16 text-lg max-w-md font-medium leading-relaxed"
        style={{ textShadow: '0 0 20px rgba(124,58,237,0.2)' }}
      >
        זה לא עוד רעיון.
        <br />
        <span className="text-white/90 font-bold">זה כבר עובד.</span>
        <br />
        ואנחנו מחפשים את ה-100 הראשונים שיהיו חלק מזה.
      </motion.p>
    </div>
  );
};

export default FoundingPlatformDeep;
