/**
 * @tab Life
 * @purpose Presence Scan — 4-step guided camera capture, then navigate to analyzing.
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import GuidedCapture from '@/components/presence/GuidedCapture';
import { useNavigate } from 'react-router-dom';

export default function PresenceScan() {
  const navigate = useNavigate();

  const handleComplete = (images: Record<string, string>) => {
    // Store images temporarily in sessionStorage for the analyzing page
    sessionStorage.setItem('presence_scan_images', JSON.stringify(images));
    navigate('/life/presence/analyzing');
  };

  return (
    <PageShell>
      <div className="pb-8">
        <GuidedCapture
          onComplete={handleComplete}
          onCancel={() => navigate('/life/presence')}
        />
      </div>
    </PageShell>
  );
}
