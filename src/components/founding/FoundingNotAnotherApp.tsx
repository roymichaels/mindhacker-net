import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FoundingNotAnotherApp = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80svh] px-6 text-center relative z-10" dir="rtl">
      {/* Strikethrough lines */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className="space-y-4 mb-10"
      >
        <p className="text-xl md:text-2xl text-white/30 line-through decoration-white/20">
          זה לא עוד קורס
        </p>
        <p className="text-xl md:text-2xl text-white/30 line-through decoration-white/20">
          זה לא עוד אפליקציה
        </p>
        <p className="text-xl md:text-2xl text-white/30 line-through decoration-white/20">
          וזה בטח לא עוד קהילה ריקה
        </p>
      </motion.div>

      {/* The real line */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <p className="text-2xl md:text-4xl font-bold text-white leading-relaxed max-w-lg">
          זו מערכת שנבנתה כדי לקחת אותך קדימה —{' '}
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
            באמת
          </span>
        </p>
      </motion.div>

      {/* Subtle scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2 }}
        className="mt-16"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-white/20" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FoundingNotAnotherApp;
