/**
 * Onboarding — Route page for /onboarding
 * Simple splash + basic info collection.
 */
import { OnboardingIntro } from '@/components/onboarding/OnboardingIntro';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const navigate = useNavigate();

  const handleComplete = (basicInfo: { name: string; gender: string; ageBracket: string }) => {
    console.log('Onboarding complete:', basicInfo);
    navigate('/today');
  };

  return <OnboardingIntro onComplete={handleComplete} />;
};

export default Onboarding;
