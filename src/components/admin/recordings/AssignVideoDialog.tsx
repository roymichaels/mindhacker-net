import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Video, User, Check, Copy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedVideoId?: string | null;
}

export const AssignVideoDialog = ({
  open,
  onOpenChange,
  preselectedVideoId,
}: AssignVideoDialogProps) => {
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (preselectedVideoId) {
      setSelectedVideoId(preselectedVideoId);
    }
  }, [preselectedVideoId]);

  useEffect(() => {
    if (!open) {
      setSelectedVideoId("");
      setSelectedUserId("");
      setNotes("");
      setGeneratedLink(null);
      setCopied(false);
    }
  }, [open]);

  const { data: videos } = useQuery({
    queryKey: ["hypnosis-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hypnosis_videos")
        .select("id, title")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("user_video_access")
        .insert({
          video_id: selectedVideoId,
          user_id: selectedUserId || null,
          granted_by: currentUser.user?.id,
          notes,
        })
        .select("access_token")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["video-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["user-videos"] });
      
      const link = `${window.location.origin}/video/${data.access_token}`;
      setGeneratedLink(link);
      
      toast({ 
        title: selectedUserId ? "הסרטון הוקצה בהצלחה!" : "הקישור נוצר בהצלחה!",
      });
    },
    onError: () => {
      toast({ title: "שגיאה בהקצאת הסרטון", variant: "destructive" });
    },
  });

  const handleCopyLink = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({ title: "הקישור הועתק!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            הקצאת סרטון למשתמש
          </DialogTitle>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>בחר סרטון</Label>
              <Select value={selectedVideoId} onValueChange={setSelectedVideoId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סרטון..." />
                </SelectTrigger>
                <SelectContent>
                  {videos?.map((video) => (
                    <SelectItem key={video.id} value={video.id}>
                      {video.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>בחר משתמש (אופציונלי)</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="ללא משתמש ספציפי (קישור אנונימי)..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">קישור אנונימי</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {user.full_name || "משתמש ללא שם"}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                אם לא נבחר משתמש, יווצר קישור שכל אחד יכול לגשת אליו
              </p>
            </div>

            <div className="space-y-2">
              <Label>הערות (אופציונלי)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות פנימיות..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                ביטול
              </Button>
              <Button
                onClick={() => assignMutation.mutate()}
                disabled={!selectedVideoId || assignMutation.isPending}
              >
                {assignMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                )}
                הקצה סרטון
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Check className="h-5 w-5" />
                <span className="font-medium">הסרטון הוקצה בהצלחה!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedUserId 
                  ? "המשתמש יכול לגשת לסרטון מהאזור האישי שלו"
                  : "שתף את הקישור הבא כדי לאפשר גישה לסרטון"
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label>קישור לסרטון</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border"
                  dir="ltr"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => onOpenChange(false)}>סגור</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
