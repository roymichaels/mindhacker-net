import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import LeadCaptureForm from "./LeadCaptureForm";
import { Phone, Heart } from "lucide-react";

interface LeadCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
}

const LeadCaptureDialog = ({ open, onOpenChange, source }: LeadCaptureDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mb-3">
            <Phone className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black">
            בוא נדבר! 🤝
          </DialogTitle>
          <DialogDescription className="text-base">
            השאר פרטים ואחזור אליך בהקדם לשיחת היכרות קצרה
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <LeadCaptureForm 
            source={source} 
            variant="full"
            showPreferredTime
            onSuccess={() => {
              setTimeout(() => onOpenChange(false), 2500);
            }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
          <Heart className="w-4 h-4 text-secondary" />
          <span>15 דקות בלבד, ללא התחייבות</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureDialog;
