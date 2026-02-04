import { useNavigate } from 'react-router-dom';
import { BusinessJourneyFlow } from '@/components/business-journey';

const BusinessJourney = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/business');
  };

  const handleClose = () => {
    navigate('/business');
  };

  return (
    <BusinessJourneyFlow 
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
};

export default BusinessJourney;
