import { useNavigate, useParams } from 'react-router-dom';
import { CoachingJourneyFlow } from '@/components/coaching-journey';

const CoachingJourney = () => {
  const navigate = useNavigate();
  const { journeyId } = useParams<{ journeyId?: string }>();

  const handleComplete = () => {
    navigate('/practitioners');
  };

  const handleClose = () => {
    navigate('/practitioners');
  };

  return (
    <CoachingJourneyFlow 
      journeyId={journeyId}
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
};

export default CoachingJourney;
