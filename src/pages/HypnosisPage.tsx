/**
 * HypnosisPage — flat top-level Hypnosis route.
 * Reuses the existing HypnosisModal as the experience surface (it already
 * renders full-viewport content). Closing returns to the previous route.
 */
import { useNavigate } from 'react-router-dom';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';
import { withLegacyGuard } from '@/shellv2/LegacyMountGuard';

function HypnosisPageImpl() {
  const navigate = useNavigate();
  return (
    <HypnosisModal
      open
      onOpenChange={(next) => {
        if (!next) navigate(-1);
      }}
    />
  );
}

export default withLegacyGuard('HypnosisPage', HypnosisPageImpl);