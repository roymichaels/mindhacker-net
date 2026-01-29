import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { UnifiedDashboardView } from '@/components/dashboard/UnifiedDashboardView';

interface AuroraDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuroraDashboardModal = ({ open, onOpenChange }: AuroraDashboardModalProps) => {
  const { t, isRTL } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle>{t('aurora.dashboard.title')}</DialogTitle>
        </DialogHeader>
        <UnifiedDashboardView />
      </DialogContent>
    </Dialog>
  );
};

export default AuroraDashboardModal;
