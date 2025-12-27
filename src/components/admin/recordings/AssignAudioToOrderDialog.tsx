import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, User, Video } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  user_id: string;
  product_id: string;
  profiles: {
    full_name: string | null;
  } | null;
  content_products: {
    title: string;
  } | null;
}

interface AssignAudioToOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}

export const AssignAudioToOrderDialog = ({
  open,
  onOpenChange,
  order,
}: AssignAudioToOrderDialogProps) => {
  const [selectedAudio, setSelectedAudio] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: audios } = useQuery({
    queryKey: ["hypnosis-audios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hypnosis_audios")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { data: currentUser } = await supabase.auth.getUser();

      // 1. Create user_audio_access
      const { error: accessError } = await supabase
        .from("user_audio_access")
        .insert({
          user_id: order.user_id,
          audio_id: selectedAudio,
          notes: notes || null,
          granted_by: currentUser.user?.id,
        });

      if (accessError) {
        if (accessError.message.includes("duplicate")) {
          throw new Error("המשתמש כבר קיבל גישה להקלטה זו");
        }
        throw accessError;
      }

      // 2. Update content_purchases.access_granted_at
      const { error: updateError } = await supabase
        .from("content_purchases")
        .update({ access_granted_at: new Date().toISOString() })
        .eq("id", order.id);

      if (updateError) throw updateError;

      // 3. Send notification to user
      const { error: notifError } = await supabase
        .from("user_notifications")
        .insert({
          user_id: order.user_id,
          type: "audio_ready",
          title: "ההקלטה שלך מוכנה! 🎧",
          message: "ההקלטה האישית שלך מוכנה להאזנה. היכנס לאזור האישי כדי להתחיל.",
          link: "/dashboard",
        });

      if (notifError) {
        console.error("Failed to send notification:", notifError);
      }

      return true;
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["pending-audio-orders"] });
      queryClient.invalidateQueries({ queryKey: ["audio-assignments"] });
      toast({ title: "ההקלטה הוקצתה בהצלחה והמשתמש קיבל התראה" });
    },
    onError: (error: Error) => {
      toast({
        title: "שגיאה בהקצאת ההקלטה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedAudio("");
    setNotes("");
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הקצאת סרטון להזמנה</DialogTitle>
          <DialogDescription>
            בחר סרטון/הקלטה להקצות למשתמש עבור הרכישה שביצע
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">הסרטון הוקצה בהצלחה!</h3>
              <p className="text-sm text-muted-foreground">
                המשתמש קיבל התראה וכעת יכול לגשת לתוכן
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              סגור
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Order Info */}
            <div className="p-4 bg-muted/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {order.profiles?.full_name || "משתמש ללא שם"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {order.content_products?.title}
                </span>
              </div>
            </div>

            {/* Audio/Video Selection */}
            <div className="space-y-2">
              <Label>בחר סרטון/הקלטה להקצאה</Label>
              <Select value={selectedAudio} onValueChange={setSelectedAudio}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מהספרייה..." />
                </SelectTrigger>
                <SelectContent>
                  {audios?.map((audio) => (
                    <SelectItem key={audio.id} value={audio.id}>
                      {audio.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>הערות (אופציונלי)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות פנימיות על ההקצאה..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                ביטול
              </Button>
              <Button
                className="flex-1"
                onClick={() => assignMutation.mutate()}
                disabled={!selectedAudio || assignMutation.isPending}
              >
                {assignMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    מקצה...
                  </>
                ) : (
                  "הקצה ושלח התראה"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
