import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface EpisodesListProps {
  episodes: any[];
  onEdit: (episode: any) => void;
}

const EpisodesList = ({ episodes, onEdit }: EpisodesListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_episodes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-episodes"] });
      toast({
        title: "הפרק נמחק בהצלחה",
      });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "שגיאה במחיקת הפרק",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (episodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 glass-panel rounded-lg border border-primary/20">
        <Video className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">אין פרקים עדיין</h3>
        <p className="text-muted-foreground">התחל ליצור פרק ראשון לסדרה זו</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {episodes.map((episode) => (
          <div
            key={episode.id}
            className="flex items-center justify-between p-4 glass-panel rounded-lg border border-primary/20"
          >
            <div className="flex-1">
              <h3 className="font-bold">{episode.title}</h3>
              {episode.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {episode.description}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant={episode.is_preview ? "default" : "secondary"}>
                  {episode.is_preview ? "תצוגה מקדימה" : "רגיל"}
                </Badge>
                <Badge variant="outline">מיקום: {episode.order_index}</Badge>
                {episode.duration_seconds && (
                  <Badge variant="outline">
                    {Math.floor(episode.duration_seconds / 60)} דקות
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {episode.video_url && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(episode.video_url, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(episode)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(episode.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הפרק לצמיתות. לא ניתן לשחזר את הפעולה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EpisodesList;
