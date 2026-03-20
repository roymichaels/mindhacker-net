import { motion } from 'framer-motion';

interface Props {
  onApply: () => void;
}

const FoundingFinalCTA = ({ onApply }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70svh] px-6 text-center relative z-10" dir="rtl">
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 60%)' }} />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        className="text-xl md:text-2xl text-white/50 leading-relaxed mb-10 max-w-md"
      >
        אם זה מדבר אליך —
        <br />
        הגיע הזמן לקחת חלק
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        onClick={onApply}
        className="py-5 px-14 rounded-2xl text-white font-bold text-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(6,182,212,0.15)',
        }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.04 }}
      >
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
        />
        <span className="relative z-10">הגש בקשה להצטרף למייסדים</span>
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="text-white/25 text-sm mt-6"
      >
        100 מקומות בלבד · כניסה דרך בקשה
      </motion.p>
    </div>
  );
};

export default FoundingFinalCTA;
