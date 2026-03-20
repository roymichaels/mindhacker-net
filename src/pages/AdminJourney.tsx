import { useNavigate, useParams } from 'react-router-dom';
import { AdminJourneyFlow } from '@/components/journeys/admin';

const AdminJourney = () => {
  const navigate = useNavigate();
  const { journeyId } = useParams<{ journeyId?: string }>();

  return (
    <AdminJourneyFlow 
      journeyId={journeyId}
      onComplete={() => navigate('/admin-hub')}
      onClose={() => navigate('/admin-hub')}
    />
  );
};

export default AdminJourney;
