/**
 * Onboarding — Route page for /onboarding
 * Uses the כיול (Recalibrate) flow as the full onboarding experience.
 */
import { useState } from 'react';
import { RecalibrateModal } from '@/components/dashboard/RecalibrateModal';

const Onboarding = () => {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <RecalibrateModal
        open={open}
        onOpenChange={(val) => {
          // Keep it open — closing navigates away via the modal's own logic
          if (!val) {
            window.location.href = '/today';
          }
        }}
      />
    </div>
  );
};

export default Onboarding;
