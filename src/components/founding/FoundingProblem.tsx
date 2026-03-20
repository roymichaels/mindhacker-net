import { motion } from 'framer-motion';

const problems = [
  { emoji: '😶‍🌫️', text: 'אין כיוון ברור' },
  { emoji: '🧩', text: 'הכל מפוזר — אפליקציות, קורסים, רעיונות' },
  { emoji: '🔄', text: 'רוצים להתקדם אבל אין מערכת אמיתית' },
];

const FoundingProblem = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70svh] px-6 text-center relative z-10" dir="rtl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-4xl font-bold text-white mb-12"
      >
        מכירים את ההרגשה?
      </motion.h2>

      <div className="flex flex-col gap-6 max-w-md w-full">
        {problems.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="text-3xl">{p.emoji}</span>
            <span className="text-white/80 text-lg text-start">{p.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FoundingProblem;
