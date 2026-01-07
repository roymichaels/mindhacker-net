import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import BookingCalendar from "./BookingCalendar";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: string;
  onBookingSuccess?: () => void;
}

const BookingDialog = ({ isOpen, onClose, purchaseId, onBookingSuccess }: BookingDialogProps) => {
  const { t } = useTranslation();
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
        title: t('success.bookingRequestSuccess'),
        description: t('success.bookingRequestDesc'),
      });

      onBookingSuccess?.();
      onClose();
    } catch (error) {
      handleError(error, t('messages.bookingError'), "BookingDialog", t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl cyber-glow text-center">
            {t('success.scheduleSession')}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {t('success.firstStep')}
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
