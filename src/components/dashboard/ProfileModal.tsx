import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { ProfileContent } from './ProfileContent';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { language, isRTL } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-lg max-h-[90vh] p-0 bg-gradient-to-b from-background via-background to-muted/30 overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            {language === 'he' ? 'כרטיס הזהות שלי' : 'My Identity Card'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[85vh]">
          <ProfileContent onClose={() => onOpenChange(false)} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileModal;
