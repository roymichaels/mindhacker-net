import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FoundingAvatarGroup } from '@/components/founding/FoundingAvatarGroup';

const FoundingHero = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] px-6 text-center relative z-10" dir="rtl">
      {/* Avatar group — 5 characters as friends */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="mb-4 w-full max-w-xl"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl blur-[80px] opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.5), rgba(6,182,212,0.2), transparent)' }} />
          <div className="relative z-10">
            <FoundingAvatarGroup />
          </div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6"
        style={{ textShadow: '0 0 40px rgba(124,58,237,0.3)' }}
      >
        אני בונה מערכת חדשה לחיים —
        <br />
        ואני פותח את המעגל הראשון
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="text-lg md:text-xl text-white/60 leading-relaxed mb-14 max-w-lg"
      >
        מערכת שעוזרת לך להתקדם,
        <br />
        לבנות את עצמך,
        <br />
        ואפילו להתחיל להרוויח תוך כדי
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-sm text-white/30">גלול למטה כדי לגלות</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FoundingHero;
