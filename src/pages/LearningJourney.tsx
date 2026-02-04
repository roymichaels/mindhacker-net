import { useNavigate, useParams } from 'react-router-dom';
import LearningJourneyFlow from '@/components/learning-journey/LearningJourneyFlow';

const LearningJourney = () => {
  const navigate = useNavigate();
  const { journeyId } = useParams<{ journeyId?: string }>();

  const handleComplete = () => {
    navigate('/learning');
  };

  const handleClose = () => {
    navigate('/learning');
  };

  return (
    <LearningJourneyFlow 
      journeyId={journeyId}
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
};

export default LearningJourney;
