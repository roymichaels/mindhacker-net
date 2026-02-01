import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { UnifiedDashboardView } from './UnifiedDashboardView';
import { ProfileContent } from './ProfileContent';
import CompactSessions from './CompactSessions';
import { ArrowLeft, LayoutDashboard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewType = 'dashboard' | 'profile';

interface DashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: ViewType;
}

export function DashboardModal({ open, onOpenChange, initialView = 'dashboard' }: DashboardModalProps) {
  const { language, isRTL } = useTranslation();
  const [currentView, setCurrentView] = useState<ViewType>(initialView);

  // Reset view when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCurrentView(initialView);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 bg-background border-border"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="p-4 pb-2 border-b border-border shrink-0">
          <div className="flex items-center justify-end gap-3">
            {currentView === 'profile' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setCurrentView('dashboard')}
              >
                <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </Button>
            )}
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              {currentView === 'dashboard' ? (
                <>
                  {language === 'he' ? 'דאשבורד' : 'Dashboard'}
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                </>
              ) : (
                <>
                  {language === 'he' ? 'כרטיס הזהות שלי' : 'My Identity Card'}
                  <User className="h-5 w-5 text-primary" />
                </>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          {currentView === 'dashboard' ? (
            <div className="p-4 space-y-6">
              <p className="text-lg font-semibold text-muted-foreground">
                {language === 'he' ? 'ברוך שובך' : 'Welcome back'}
              </p>
              
              {/* Unified Life Model + Gamification Dashboard */}
              <UnifiedDashboardView onOpenProfile={() => setCurrentView('profile')} />

              {/* Sessions */}
              <div className="grid gap-6">
                <CompactSessions />
              </div>
            </div>
          ) : (
            <ProfileContent onClose={() => onOpenChange(false)} />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
