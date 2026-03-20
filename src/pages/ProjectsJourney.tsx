import { useNavigate, useParams } from 'react-router-dom';
import { ProjectsJourneyFlow } from '@/components/journeys/projects';

const ProjectsJourney = () => {
  const navigate = useNavigate();
  const { journeyId } = useParams<{ journeyId?: string }>();

  return (
    <ProjectsJourneyFlow 
      journeyId={journeyId}
      onComplete={() => navigate('/play')}
      onClose={() => navigate('/play')}
    />
  );
};

export default ProjectsJourney;
