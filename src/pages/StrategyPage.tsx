/**
 * StrategyPage — Journey realm host.
 *
 * The Journey realm now manifests a single next step instead of a tab grid.
 * Old tabs (Overview/Actions) are removed; LifeHub and PlayLayoutWrapper
 * stay reachable via direct URL or AION-summoned artifacts only.
 */
import JourneyView from '@/pages/JourneyView';
import { withLegacyGuard } from '@/shellv2/LegacyMountGuard';

function StrategyPageImpl() {
  return <JourneyView />;
}

export default withLegacyGuard('StrategyPage', StrategyPageImpl);