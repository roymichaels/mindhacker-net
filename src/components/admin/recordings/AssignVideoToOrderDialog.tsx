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
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Video, Check, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface Order {
  id: string;
  user_id: string;
  product_id: string;
  price_paid: number;
  purchase_date: string;
  profiles: { full_name: string | null } | null;
  products: { title: string; slug: string } | null;
}

interface VideoRecord {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
}

interface AssignVideoToOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}

export const AssignVideoToOrderDialog = ({
  open,
  onOpenChange,
  order,
}: AssignVideoToOrderDialogProps) => {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Fetch available videos
  const { data: videos, isLoading } = useQuery({
    queryKey: ["hypnosis-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hypnosis_videos")
        .select("id, title, description, duration_seconds")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as VideoRecord[];
    },
  });

  // Assign video mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVideoId) throw new Error("נא לבחור סרטון");

      // Create video access record
      const { error: accessError } = await supabase
        .from("user_video_access")
        .insert({
          user_id: order.user_id,
          video_id: selectedVideoId,
          notes: notes || null,
        });

      if (accessError) throw accessError;

      // Update order as fulfilled
      const { error: orderError } = await supabase
        .from("orders")
        .update({ 
          fulfilled_at: new Date().toISOString(),
          notes: notes || null 
        })
        .eq("id", order.id);

      if (orderError) throw orderError;

      // Create user notification
      await supabase.rpc('create_user_notification', {
        p_user_id: order.user_id,
        p_type: 'video_ready',
        p_title: 'הסרטון שלך מוכן!',
        p_message: 'סרטון האימון התודעתי האישי שלך מוכן לצפייה. לחץ כדי לצפות.',
        p_link: '/dashboard',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-pending-fulfillment"] });
      queryClient.invalidateQueries({ queryKey: ["hypnosis-videos"] });
      toast({
        title: t('common.success'),
        description: "הסרטון הוקצה בהצלחה והמשתמש קיבל התראה",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return t('common.unknown');
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>הקצה סרטון להזמנה</DialogTitle>
          <DialogDescription>
            בחר סרטון עבור {order.profiles?.full_name || "המשתמש"}
          </DialogDescription>
        </DialogHeader>

        {/* Order Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{order.profiles?.full_name || t('common.unknown')}</p>
                <p className="text-sm text-muted-foreground">
                  {order.products?.title} • ₪{order.price_paid}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.purchase_date), "dd/MM/yyyy HH:mm", { locale: language === 'he' ? he : undefined })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Selection */}
        <div className="flex-1 overflow-y-auto space-y-3">
          <Label>בחר סרטון:</Label>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : videos && videos.length > 0 ? (
            <div className="space-y-2">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className={`cursor-pointer transition-all ${
                    selectedVideoId === video.id
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedVideoId(video.id)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedVideoId === video.id ? "bg-primary/20" : "bg-accent/20"
                    }`}>
                      {selectedVideoId === video.id ? (
                        <Check className="h-5 w-5 text-primary" />
                      ) : (
                        <Video className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{video.title}</p>
                      {video.description && (
                        <p className="text-sm text-muted-foreground truncate">{video.description}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDuration(video.duration_seconds)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              אין סרטונים זמינים. העלה סרטון קודם.
            </p>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>הערות (אופציונלי):</Label>
            <Textarea
              placeholder="הערות פנימיות..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => assignMutation.mutate()}
            disabled={!selectedVideoId || assignMutation.isPending}
          >
            {assignMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-1" />}
            הקצה סרטון
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
