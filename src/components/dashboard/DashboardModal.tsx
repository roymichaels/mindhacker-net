import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { ProfileContent } from './ProfileContent';
import { User } from 'lucide-react';

interface DashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: string;
}

export function DashboardModal({ open, onOpenChange }: DashboardModalProps) {
  const { language, isRTL } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border-border/50"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="p-4 pb-2 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {language === 'he' ? 'כרטיס הזהות שלי' : 'My Identity Card'}
            <User className="h-5 w-5 text-primary" />
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          <ProfileContent onClose={() => onOpenChange(false)} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
