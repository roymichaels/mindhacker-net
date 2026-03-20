import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FoundingBackground from '@/components/founding/FoundingBackground';
import WizardNav from '@/components/founding/WizardNav';
import FoundingHero from '@/components/founding/FoundingHero';
import FoundingProblem from '@/components/founding/FoundingProblem';
import FoundingSystem from '@/components/founding/FoundingSystem';
import FoundingBenefits from '@/components/founding/FoundingBenefits';
import FoundingMembers from '@/components/founding/FoundingMembers';
import FoundingRole from '@/components/founding/FoundingRole';
import FoundingEarning from '@/components/founding/FoundingEarning';
import FoundingWhyNow from '@/components/founding/FoundingWhyNow';
import FoundingFinalCTA from '@/components/founding/FoundingFinalCTA';
import FoundingApplyForm from '@/components/founding/FoundingApplyForm';

const TOTAL_STEPS = 10;

const FoundingLanding = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((target: number) => {
    if (target < 0 || target >= TOTAL_STEPS) return;
    setDirection(target > step ? 1 : -1);
    setStep(target);
  }, [step]);

  const next = useCallback(() => goTo(step + 1), [step, goTo]);
  const back = useCallback(() => goTo(step - 1), [step, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next();
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, back]);

  const variants = {
    enter: (dir: number) => ({ y: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (dir: number) => ({ y: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const sections = [
    <FoundingHero key="hero" onCTA={next} />,
    <FoundingProblem key="problem" />,
    <FoundingSystem key="system" />,
    <FoundingBenefits key="benefits" />,
    <FoundingMembers key="members" />,
    <FoundingRole key="role" />,
    <FoundingEarning key="earning" />,
    <FoundingWhyNow key="whynow" />,
    <FoundingFinalCTA key="cta" onApply={next} />,
    <FoundingApplyForm key="apply" />,
  ];

  return (
    <div className="fixed inset-0 overflow-hidden">
      <FoundingBackground />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0 overflow-y-auto"
        >
          {sections[step]}
        </motion.div>
      </AnimatePresence>

      <WizardNav
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        onNext={next}
        onBack={back}
        hideNext={step === 0 || step === 8 || step === 9}
      />
    </div>
  );
};

export default FoundingLanding;
