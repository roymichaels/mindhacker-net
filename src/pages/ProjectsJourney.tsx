import { useNavigate, useParams } from 'react-router-dom';
import { ProjectsJourneyFlow } from '@/components/projects-journey';

const ProjectsJourney = () => {
  const navigate = useNavigate();
  const { journeyId } = useParams<{ journeyId?: string }>();

  return (
    <ProjectsJourneyFlow 
      journeyId={journeyId}
      onComplete={() => navigate('/life')}
      onClose={() => navigate('/life')}
    />
  );
};

export default ProjectsJourney;
