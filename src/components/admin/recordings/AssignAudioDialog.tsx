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
import { Loader2, Copy, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AssignAudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedAudioId?: string | null;
}

export const AssignAudioDialog = ({
  open,
  onOpenChange,
  preselectedAudioId,
}: AssignAudioDialogProps) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAudio, setSelectedAudio] = useState("");
  const [notes, setNotes] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set preselected audio when dialog opens
  useEffect(() => {
    if (open && preselectedAudioId) {
      setSelectedAudio(preselectedAudioId);
    }
  }, [open, preselectedAudioId]);

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
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("user_audio_access")
        .insert({
          user_id: selectedUser,
          audio_id: selectedAudio,
          notes: notes || null,
          granted_by: user.user?.id,
        })
        .select("access_token")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["audio-assignments"] });
      const link = `${window.location.origin}/audio/${data.access_token}`;
      setGeneratedLink(link);
      toast({ title: "ההקלטה הוקצתה בהצלחה" });
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast({ 
          title: "המשתמש כבר מקבל גישה להקלטה זו", 
          variant: "destructive" 
        });
      } else {
        toast({ title: "שגיאה בהקצאת ההקלטה", variant: "destructive" });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedAudio) {
      toast({ title: "יש לבחור משתמש והקלטה", variant: "destructive" });
      return;
    }
    assignMutation.mutate();
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast({ title: "הקישור הועתק ללוח" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSelectedUser("");
    setSelectedAudio("");
    setNotes("");
    setGeneratedLink(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הקצאת הקלטה למשתמש</DialogTitle>
        </DialogHeader>

        {generatedLink ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400 font-medium mb-2">
                ההקלטה הוקצתה בהצלחה! 🎉
              </p>
              <p className="text-xs text-muted-foreground">
                שלח את הקישור הבא למשתמש:
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border"
                dir="ltr"
              />
              <Button size="icon" onClick={copyLink}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Button onClick={handleClose} className="w-full">
              סיום
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>בחר משתמש</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר משתמש..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || "משתמש ללא שם"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>בחר הקלטה</Label>
              <Select value={selectedAudio} onValueChange={setSelectedAudio}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר הקלטה..." />
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

            <div className="space-y-2">
              <Label>הערות (אופציונלי)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות פנימיות על ההקצאה..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                ביטול
              </Button>
              <Button type="submit" disabled={assignMutation.isPending}>
                {assignMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                )}
                הקצה וצור קישור
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
