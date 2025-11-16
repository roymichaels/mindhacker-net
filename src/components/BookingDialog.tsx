import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandling";
import BookingCalendar from "./BookingCalendar";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: string;
  onBookingSuccess?: () => void;
}

const BookingDialog = ({ isOpen, onClose, purchaseId, onBookingSuccess }: BookingDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookingSubmit = async (date: Date | undefined, time: string, notes: string) => {
    if (!date) return;

    setIsSubmitting(true);

    try {
      // Update the purchase with booking information
      const { error } = await supabase
        .from("purchases")
        .update({
          booking_status: "pending",
          scheduled_date: date.toISOString().split('T')[0],
          scheduled_time: time,
          booking_notes: notes || null,
        })
        .eq("id", purchaseId);

      if (error) throw error;

      toast({
        title: "🎉 בקשת הפגישה נשלחה בהצלחה!",
        description: "נחזור אליך בהקדם עם אישור",
      });

      onBookingSuccess?.();
      onClose();
    } catch (error) {
      handleError(error, "שגיאה בשליחת בקשת הפגישה", "BookingDialog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl cyber-glow text-center">
            קבע את הפגישה שלך
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            הצעד הראשון לשינוי כבר נעשה. עכשיו בוא נקבע את הפגישה שתשנה הכל.
          </DialogDescription>
        </DialogHeader>

        <BookingCalendar 
          onSubmit={handleBookingSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
