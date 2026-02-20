/**
 * Onboarding — Route page for /onboarding
 * Manual card-based LaunchpadFlow (not chat).
 */
import { LaunchpadFlow } from '@/components/launchpad';

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-background">
      <LaunchpadFlow />
    </div>
  );
};

export default Onboarding;
