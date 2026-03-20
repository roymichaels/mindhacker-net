import { motion } from 'framer-motion';
import { Clock, Shield, Sparkles } from 'lucide-react';

const reasons = [
  { icon: Clock, text: 'המעגל הראשון נפתח עכשיו', color: '#7c3aed' },
  { icon: Shield, text: 'מספר המקומות מוגבל', color: '#06b6d4' },
  { icon: Sparkles, text: 'מי שנכנס ראשון — מקבל את היתרון הכי גדול', color: '#f59e0b' },
];

const FoundingWhyNow = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 text-center relative z-10" dir="rtl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-4xl font-bold text-white mb-12"
      >
        למה דווקא עכשיו?
      </motion.h2>

      <div className="flex flex-col gap-6 max-w-md w-full">
        {reasons.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 backdrop-blur-sm"
            style={{ background: `radial-gradient(circle at right, ${r.color}10, transparent)` }}
          >
            <r.icon className="w-6 h-6 shrink-0" style={{ color: r.color }} />
            <span className="text-white/80 text-lg text-start">{r.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FoundingWhyNow;
