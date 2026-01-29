import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import AuroraProfileSettings from './AuroraProfileSettings';

interface AuroraSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuroraSettingsModal = ({ open, onOpenChange }: AuroraSettingsModalProps) => {
  const { t, isRTL } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle>{t('aurora.settings.title')}</DialogTitle>
        </DialogHeader>
        <AuroraProfileSettings />
      </DialogContent>
    </Dialog>
  );
};

export default AuroraSettingsModal;
