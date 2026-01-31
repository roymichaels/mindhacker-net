import { useNavigate } from 'react-router-dom';
import { GuestLaunchpadFlow } from '@/components/launchpad/GuestLaunchpadFlow';
import { useSEO } from '@/hooks/useSEO';
import { useTranslation } from '@/hooks/useTranslation';

const GuestLaunchpad = () => {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();

  useSEO({
    title: isRTL ? 'מסע טרנספורמציה חינמי | MindOS' : 'Free Transformation Journey | MindOS',
    description: isRTL 
      ? 'גלה את עצמך עם ניתוח תודעה AI, תוכנית 90 יום ופרופיל זהות אישי - חינם!'
      : 'Discover yourself with AI consciousness analysis, 90-day plan and identity profile - free!',
  });

  const handleComplete = () => {
    navigate('/free-journey/complete');
  };

  const handleClose = () => {
    navigate('/free-journey');
  };

  return (
    <GuestLaunchpadFlow 
      onComplete={handleComplete} 
      onClose={handleClose}
    />
  );
};

export default GuestLaunchpad;
