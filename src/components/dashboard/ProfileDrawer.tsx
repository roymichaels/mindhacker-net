import { useTranslation } from '@/hooks/useTranslation';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProfileContent } from './ProfileContent';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const { language, isRTL } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isRTL ? "right" : "left"} 
        className="w-full sm:max-w-lg p-0 bg-gradient-to-b from-background via-background to-muted/30"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            {language === 'he' ? 'כרטיס הזהות שלי' : 'My Identity Card'}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[100vh]">
          <ProfileContent onClose={() => onOpenChange(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default ProfileDrawer;
