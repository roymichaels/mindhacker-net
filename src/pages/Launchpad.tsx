import { useNavigate } from 'react-router-dom';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { LaunchpadFlow } from '@/components/launchpad';
import { useEffect } from 'react';

const Launchpad = () => {
  const navigate = useNavigate();
  const { isLaunchpadComplete } = useLaunchpadProgress();

  // If launchpad is complete, redirect to dashboard
  useEffect(() => {
    if (isLaunchpadComplete) {
      navigate('/dashboard');
    }
  }, [isLaunchpadComplete, navigate]);

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  return (
    <LaunchpadFlow 
      onComplete={handleComplete} 
      onClose={handleClose}
    />
  );
};

export default Launchpad;
