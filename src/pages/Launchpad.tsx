import { useNavigate } from 'react-router-dom';
import { LaunchpadFlow } from '@/components/launchpad';

const Launchpad = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/launchpad/complete');
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  return (
    <LaunchpadFlow 
      mode="authenticated"
      onComplete={handleComplete} 
      onClose={handleClose}
    />
  );
};

export default Launchpad;
