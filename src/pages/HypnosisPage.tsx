/**
 * HypnosisPage — flat top-level Hypnosis route.
 * Reuses the existing HypnosisModal as the experience surface (it already
 * renders full-viewport content). Closing returns to the previous route.
 */
import { useNavigate } from 'react-router-dom';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';

export default function HypnosisPage() {
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