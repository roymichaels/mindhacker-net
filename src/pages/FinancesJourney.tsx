import { useNavigate, useParams } from 'react-router-dom';
import FinancesJourneyFlow from '@/components/finances-journey/FinancesJourneyFlow';

const FinancesJourney = () => {
  const navigate = useNavigate();
  const { journeyId } = useParams<{ journeyId?: string }>();

  const handleComplete = () => {
    navigate('/finances');
  };

  const handleClose = () => {
    navigate('/finances');
  };

  return (
    <FinancesJourneyFlow 
      journeyId={journeyId}
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
};

export default FinancesJourney;
