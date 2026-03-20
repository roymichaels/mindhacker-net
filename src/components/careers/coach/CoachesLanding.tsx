/**
 * Coaches Landing — dual-path marketplace entry for non-coach users.
 * Shows "Want a Coach" / "Be a Coach" cards that trigger Aurora dock wizards.
 */
import { Search, Briefcase } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { motion } from 'framer-motion';

export default function CoachesLanding() {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const auroraChat = useAuroraChatContextSafe();
  const isHe = language === 'he';

  const openFindCoachWizard = () => {
    if (!user) { navigate('/auth'); return; }
    if (!auroraChat) return;
    auroraChat.setActivePillar('coach-find');
    auroraChat.setIsDockVisible(true);
    auroraChat.setIsChatExpanded(true);
    auroraChat.setPendingAssistantGreeting(
      isHe
        ? '👋 שלום! אני Aurora, ואני אעזור לך למצוא את המאמן המושלם בשבילך.\n\n**ספר/י לי — מה הדבר שהכי רוצה לשפר בחיים שלך עכשיו?**\n\nזה יכול להיות:\n- 🧠 בריאות נפשית ומיינדסט\n- 💪 כושר ותזונה\n- 💼 קריירה ועסקים\n- ❤️ זוגיות ומערכות יחסים\n- 🎯 מטרות ומוטיבציה\n\nככל שתהיה ספציפי יותר, כך אמצא לך התאמה טובה יותר.'
        : "👋 Hey! I'm Aurora, and I'll help you find your perfect coach.\n\n**Tell me — what's the one thing you'd most like to improve in your life right now?**\n\nIt could be:\n- 🧠 Mental health & mindset\n- 💪 Fitness & nutrition\n- 💼 Career & business\n- ❤️ Relationships\n- 🎯 Goals & motivation\n\nThe more specific you are, the better match I'll find for you."
    );
  };

  const openBecomeCoachWizard = () => {
    if (!user) { navigate('/auth'); return; }
    navigate('/coaches?tab=pricing');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">
          {isHe ? 'מאמנים' : 'Coaches'}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {isHe
            ? 'מצא את המאמן שיעזור לך לצמוח — או הפוך בעצמך למאמן על הפלטפורמה'
            : 'Find the coach who will help you grow — or become one yourself'}
        </p>
      </div>

      {/* Dual Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Want a Coach */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openFindCoachWizard}
          className="group relative rounded-2xl border-2 border-primary/20 bg-card p-8 text-start space-y-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">
            {isHe ? 'אני מחפש/ת מאמן' : 'I Want a Coach'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isHe
              ? 'Aurora תבין מה אתה צריך ותמליץ על המאמנים שהכי מתאימים לך — חינם לגמרי.'
              : 'Aurora will understand what you need and recommend the coaches who fit you best — completely free.'}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
            {isHe ? 'בוא נתחיל →' : 'Let\'s start →'}
          </span>
        </motion.button>

        {/* Be a Coach */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openBecomeCoachWizard}
          className="group relative rounded-2xl border-2 border-amber-500/20 bg-card p-8 text-start space-y-4 transition-all hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold">
            {isHe ? 'אני רוצה להיות מאמן' : 'I Want to Be a Coach'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isHe
              ? 'בנה את העסק שלך כמאמן עם כלי AI, ניהול מתאמנים, דפי נחיתה ועוד — החל מ-$19 בחודש.'
              : 'Build your coaching business with AI tools, client management, landing pages & more — starting at $19/mo.'}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-amber-500 group-hover:underline">
            {isHe ? 'ראה תוכניות →' : 'See plans →'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
