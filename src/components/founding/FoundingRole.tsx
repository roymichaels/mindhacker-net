import { motion } from 'framer-motion';
import { Pen, Share2, UserPlus, MessageSquare } from 'lucide-react';

const roles = [
  { icon: Pen, label: 'ליצור תוכן', desc: 'כתיבה, סרטונים, שיתוף ידע', color: '#7c3aed' },
  { icon: Share2, label: 'להפיץ', desc: 'לספר לאנשים שמתאימים', color: '#06b6d4' },
  { icon: UserPlus, label: 'להביא אנשים', desc: 'להזמין את מי שצריך להיות כאן', color: '#3b82f6' },
  { icon: MessageSquare, label: 'לתת פידבק', desc: 'לבדוק, לשפר, להשפיע', color: '#10b981' },
];

const FoundingRole = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 relative z-10" dir="rtl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-4xl font-bold text-white mb-4 text-center"
      >
        איך אתה יכול לקחת חלק
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/50 mb-10 text-center"
      >
        לא חובות — הזדמנויות
      </motion.p>

      <div className="flex flex-col gap-4 max-w-md w-full">
        {roles.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
            className="flex items-start gap-4 p-5 rounded-2xl border border-white/10"
            style={{ background: `linear-gradient(135deg, ${r.color}08, transparent)` }}
          >
            <div className="p-2 rounded-xl" style={{ background: `${r.color}20` }}>
              <r.icon className="w-5 h-5" style={{ color: r.color }} />
            </div>
            <div className="text-start">
              <div className="text-white font-semibold">{r.label}</div>
              <div className="text-white/50 text-sm">{r.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-white/70 text-center mt-8 text-sm max-w-sm"
        style={{ textShadow: '0 0 20px rgba(124,58,237,0.3)' }}
      >
        מי שלוקח חלק בהקמה — מקבל את היתרון הכי גדול
      </motion.p>
    </div>
  );
};

export default FoundingRole;
