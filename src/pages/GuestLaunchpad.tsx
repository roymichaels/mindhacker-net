import { useNavigate } from 'react-router-dom';
import { GuestLaunchpadFlow } from '@/components/launchpad/GuestLaunchpadFlow';

const GuestLaunchpad = () => {
  const navigate = useNavigate();

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
