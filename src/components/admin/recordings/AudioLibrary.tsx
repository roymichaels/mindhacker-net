import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Music, Clock, Calendar } from "lucide-react";
import { AudioUploadDialog } from "./AudioUploadDialog";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HypnosisAudio {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  duration_seconds: number | null;
  created_at: string;
}

export const AudioLibrary = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState<HypnosisAudio | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: audios, isLoading } = useQuery({
    queryKey: ["hypnosis-audios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hypnosis_audios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HypnosisAudio[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const audio = audios?.find((a) => a.id === id);
      if (audio?.file_path) {
        await supabase.storage.from("hypnosis-audios").remove([audio.file_path]);
      }
      const { error } = await supabase.from("hypnosis_audios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hypnosis-audios"] });
      toast({ title: "ההקלטה נמחקה בהצלחה" });
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: "שגיאה במחיקת ההקלטה", variant: "destructive" });
    },
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "לא ידוע";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted/50" />
            <CardContent className="h-16 bg-muted/30" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">כל ההקלטות ({audios?.length || 0})</h2>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          העלה הקלטה חדשה
        </Button>
      </div>

      {audios?.length === 0 ? (
        <Card className="p-12 text-center">
          <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">אין הקלטות עדיין</h3>
          <p className="text-muted-foreground mt-2">העלה את ההקלטה הראשונה שלך</p>
          <Button onClick={() => setIsUploadOpen(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            העלה הקלטה
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {audios?.map((audio) => (
            <Card key={audio.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-start justify-between gap-2">
                  <span className="line-clamp-2">{audio.title}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditingAudio(audio)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeletingId(audio.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {audio.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {audio.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(audio.duration_seconds)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(audio.created_at), "d MMM yyyy", { locale: he })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AudioUploadDialog
        open={isUploadOpen || !!editingAudio}
        onOpenChange={(open) => {
          if (!open) {
            setIsUploadOpen(false);
            setEditingAudio(null);
          }
        }}
        editingAudio={editingAudio}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם למחוק את ההקלטה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את ההקלטה לצמיתות ותבטל את הגישה לכל המשתמשים שהוקצו אליה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
