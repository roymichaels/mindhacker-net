import { motion } from 'framer-motion';

interface WizardNavProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  nextLabel?: string;
  hideNext?: boolean;
}

const WizardNav = ({ currentStep, totalSteps, onNext, onBack, nextLabel, hideNext }: WizardNavProps) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pb-safe">
      <div className="flex flex-col items-center gap-3 px-6 py-4 bg-gradient-to-t from-black/80 to-transparent">
        {/* Dot progress */}
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === currentStep ? 24 : 8,
                height: 8,
                backgroundColor: i === currentStep ? '#8b5cf6' : i < currentStep ? '#6d28d9' : 'rgba(255,255,255,0.2)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full max-w-md">
          {currentStep > 0 && (
            <button
              onClick={onBack}
              className="flex-1 py-4 rounded-2xl text-white/60 text-sm font-medium border border-white/10 backdrop-blur-sm hover:bg-white/5 transition-colors"
            >
              חזור
            </button>
          )}
          {!hideNext && (
            <motion.button
              onClick={onNext}
              className="flex-1 py-4 rounded-2xl text-white font-bold text-base"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                boxShadow: '0 0 30px rgba(124,58,237,0.4), 0 0 60px rgba(6,182,212,0.2)',
              }}
              whileTap={{ scale: 0.97 }}
            >
              {nextLabel || 'המשך'}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardNav;
