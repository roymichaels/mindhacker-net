import { motion } from 'framer-motion';
import { Compass, Zap, Coins, Users, Star } from 'lucide-react';

const benefits = [
  { icon: Compass, label: 'סדר וכיוון', color: '#7c3aed' },
  { icon: Zap, label: 'מערכת שעוזרת לפעול', color: '#06b6d4' },
  { icon: Coins, label: 'הזדמנויות להרוויח', color: '#f59e0b' },
  { icon: Users, label: 'קהילה איכותית', color: '#10b981' },
  { icon: Star, label: 'יתרון מוקדם', color: '#ec4899' },
];

const FoundingBenefits = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 relative z-10" dir="rtl">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-4xl font-bold text-white mb-10 text-center"
      >
        מה מחכה לך בפנים
      </motion.h2>

      <div className="grid grid-cols-2 gap-4 max-w-md w-full">
        {benefits.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 * i, duration: 0.5 }}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/10 backdrop-blur-sm ${i === 4 ? 'col-span-2' : ''}`}
            style={{
              background: `radial-gradient(circle at top, ${b.color}15, transparent)`,
              boxShadow: `0 0 20px ${b.color}10`,
            }}
          >
            <b.icon className="w-8 h-8" style={{ color: b.color }} />
            <span className="text-white/90 font-medium text-center">{b.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FoundingBenefits;
