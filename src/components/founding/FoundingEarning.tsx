import { motion } from 'framer-motion';

const paths = [
  { emoji: '🎯', label: 'מתקדמים', desc: 'כל צעד קדימה = ערך אמיתי' },
  { emoji: '💼', label: 'עובדים', desc: 'מציעים שירותים וידע' },
  { emoji: '🎨', label: 'יוצרים', desc: 'תוכן, כלים, חומרים' },
  { emoji: '🤝', label: 'מביאים אנשים פעילים', desc: 'שניכם מרוויחים' },
];

const FoundingEarning = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80svh] px-6 relative z-10" dir="rtl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        className="text-2xl md:text-4xl font-bold text-white mb-3 text-center"
      >
        איך מרוויחים כאן?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-white/40 mb-10 text-center"
      >
        פשוט מאוד
      </motion.p>

      <div className="flex flex-col gap-4 max-w-md w-full">
        {paths.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10"
            style={{ background: 'rgba(124,58,237,0.04)' }}
          >
            <span className="text-3xl">{p.emoji}</span>
            <div className="text-start">
              <div className="text-white font-semibold">{p.label}</div>
              <div className="text-white/45 text-sm">{p.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FoundingEarning;
