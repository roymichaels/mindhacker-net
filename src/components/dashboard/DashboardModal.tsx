import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { UnifiedDashboardView } from './UnifiedDashboardView';
import CompactSessions from './CompactSessions';

interface DashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DashboardModal({ open, onOpenChange }: DashboardModalProps) {
  const { language, isRTL } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 bg-background border-border"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="p-4 pb-2 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {language === 'he' ? 'דאשבורד' : 'Dashboard'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <p className="text-lg font-semibold text-muted-foreground">
              {language === 'he' ? 'ברוך שובך' : 'Welcome back'}
            </p>
            
            {/* Unified Life Model + Gamification Dashboard */}
            <UnifiedDashboardView />

            {/* Sessions */}
            <div className="grid gap-6">
              <CompactSessions />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
