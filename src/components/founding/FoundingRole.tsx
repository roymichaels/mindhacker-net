import { motion } from 'framer-motion';
import { Pen, Share2, UserPlus, MessageSquare } from 'lucide-react';

const roles = [
  { icon: Pen, label: 'ליצור', desc: 'תוכן, ידע, כלים', color: '#7c3aed' },
  { icon: Share2, label: 'להשפיע', desc: 'לעצב את הכיוון מבפנים', color: '#06b6d4' },
  { icon: UserPlus, label: 'להפיץ', desc: 'להביא את מי שצריך להיות כאן', color: '#3b82f6' },
  { icon: MessageSquare, label: 'לבנות', desc: 'לתת פידבק, לשפר, להוביל', color: '#10b981' },
];

const FoundingRole = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80svh] px-6 relative z-10" dir="rtl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        className="text-2xl md:text-4xl font-bold text-white mb-3 text-center"
      >
        מה זה אומר להיות בפנים
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-white/40 mb-10 text-center"
      >
        לא חובות — הזדמנויות
      </motion.p>

      <div className="flex flex-col gap-4 max-w-md w-full">
        {roles.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="flex items-start gap-4 p-5 rounded-2xl border border-white/10"
            style={{ background: `linear-gradient(135deg, ${r.color}08, transparent)` }}
          >
            <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${r.color}18` }}>
              <r.icon className="w-5 h-5" style={{ color: r.color }} />
            </div>
            <div className="text-start">
              <div className="text-white font-semibold text-lg">{r.label}</div>
              <div className="text-white/45 text-sm">{r.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="text-white/60 text-center mt-10 text-base max-w-sm font-medium"
        style={{ textShadow: '0 0 20px rgba(124,58,237,0.3)' }}
      >
        מי שלוקח חלק בהקמה — מקבל את היתרון הכי גדול
      </motion.p>
    </div>
  );
};

export default FoundingRole;
