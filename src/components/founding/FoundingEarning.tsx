import { motion } from 'framer-motion';

const paths = [
  { emoji: '🎯', label: 'התקדמות אישית', desc: 'כל צעד קדימה = ערך אמיתי' },
  { emoji: '💼', label: 'עבודה ושירותים', desc: 'הצע את מה שאתה יודע' },
  { emoji: '🎨', label: 'יצירה', desc: 'תוכן, ידע, כלים' },
  { emoji: '🤝', label: 'הזמנת אנשים פעילים', desc: 'הבא את מי שמתאים — שניכם מרוויחים' },
];

const FoundingEarning = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 relative z-10" dir="rtl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-4xl font-bold text-white mb-4 text-center"
      >
        אתה יכול להרוויח כאן
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-white/50 mb-10 text-center"
      >
        ארבע דרכים להתחיל
      </motion.p>

      <div className="flex flex-col gap-4 max-w-md w-full">
        {paths.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10"
            style={{ background: 'rgba(124,58,237,0.05)' }}
          >
            <span className="text-3xl">{p.emoji}</span>
            <div className="text-start">
              <div className="text-white font-semibold">{p.label}</div>
              <div className="text-white/50 text-sm">{p.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FoundingEarning;
