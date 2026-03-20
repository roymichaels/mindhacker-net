import { motion } from 'framer-motion';

interface Props {
  onApply: () => void;
}

const FoundingFinalCTA = ({ onApply }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 text-center relative z-10" dir="rtl">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl md:text-2xl text-white/60 leading-relaxed mb-8 max-w-md"
      >
        אם זה מדבר אליך —
        <br />
        תגיש בקשה להצטרף למייסדים
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        onClick={onApply}
        className="py-5 px-12 rounded-2xl text-white font-bold text-xl"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(6,182,212,0.2)',
        }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.04 }}
      >
        הצטרף עכשיו
      </motion.button>
    </div>
  );
};

export default FoundingFinalCTA;
