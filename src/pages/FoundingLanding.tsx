import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FoundingBackground from '@/components/founding/FoundingBackground';
import FoundingHero from '@/components/founding/FoundingHero';
import FoundingNotAnotherApp from '@/components/founding/FoundingNotAnotherApp';
import FoundingPlatformDeep from '@/components/founding/FoundingPlatformDeep';
import FoundingSystem from '@/components/founding/FoundingSystem';
import FoundingBenefits from '@/components/founding/FoundingBenefits';
import FoundingMembers from '@/components/founding/FoundingMembers';
import FoundingRole from '@/components/founding/FoundingRole';
import FoundingEarning from '@/components/founding/FoundingEarning';
import FoundingWhyNow from '@/components/founding/FoundingWhyNow';
import FoundingFinalCTA from '@/components/founding/FoundingFinalCTA';
import FoundingApplyForm from '@/components/founding/FoundingApplyForm';
import { X, ArrowRight } from 'lucide-react';

const FoundingLanding = () => {
  const [showApply, setShowApply] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <FoundingBackground />

      {/* ═══ Fixed Exit Button ═══ */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 start-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/15 text-white/60 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all"
      >
        <ArrowRight className="w-4 h-4" />
        <span className="text-xs font-medium">חזרה</span>
      </button>

      {/* ═══ Scrollable Landing ═══ */}
      <div ref={topRef} className="relative z-10">
        {/* 1. Hero */}
        <FoundingHero />

        {/* 2. "This is not another app" */}
        <FoundingNotAnotherApp />

        {/* Divider glow */}
        <div className="h-px w-full max-w-md mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)' }} />

        {/* 2.5 Deep dive — what is this platform */}
        <FoundingPlatformDeep />

        {/* Divider glow */}
        <div className="h-px w-full max-w-md mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)' }} />

        {/* 3. How it works */}
        <FoundingSystem />

        {/* 4. What you get */}
        <FoundingBenefits />

        {/* Divider glow */}
        <div className="h-px w-full max-w-md mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)' }} />

        {/* 5. Founding Members — the big one */}
        <FoundingMembers />

        {/* 6. Your role */}
        <FoundingRole />

        {/* 7. Earning */}
        <FoundingEarning />

        {/* 8. Why now */}
        <FoundingWhyNow />

        {/* Divider glow */}
        <div className="h-px w-full max-w-md mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)' }} />

        {/* 9. Final CTA */}
        <FoundingFinalCTA onApply={() => setShowApply(true)} />

        {/* Footer spacer */}
        <div className="h-20" />
      </div>

      {/* ═══ Apply Form Overlay (Wizard Phase) ═══ */}
      <AnimatePresence>
        {showApply && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] overflow-y-auto"
            style={{ background: 'rgba(5,5,5,0.97)' }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowApply(false)}
              className="fixed top-4 end-4 z-50 p-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <FoundingApplyForm />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoundingLanding;
