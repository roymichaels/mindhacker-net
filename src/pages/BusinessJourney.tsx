import { useNavigate, useParams } from 'react-router-dom';
import { BusinessJourneyFlow } from '@/components/business-journey';

const BusinessJourney = () => {
  const navigate = useNavigate();
  const { journeyId } = useParams<{ journeyId?: string }>();

  const handleComplete = () => {
    navigate('/business');
  };

  const handleClose = () => {
    navigate('/business');
  };

  return (
    <BusinessJourneyFlow 
      journeyId={journeyId}
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
};

export default BusinessJourney;
