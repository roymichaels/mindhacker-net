import { useNavigate, useParams } from 'react-router-dom';
import RelationshipsJourneyFlow from '@/components/relationships-journey/RelationshipsJourneyFlow';

const RelationshipsJourney = () => {
  const navigate = useNavigate();
  const { journeyId } = useParams<{ journeyId?: string }>();

  const handleComplete = () => {
    navigate('/relationships');
  };

  const handleClose = () => {
    navigate('/relationships');
  };

  return (
    <RelationshipsJourneyFlow 
      journeyId={journeyId}
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
};

export default RelationshipsJourney;
