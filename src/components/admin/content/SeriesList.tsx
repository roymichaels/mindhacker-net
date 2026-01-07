import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, FolderOpen, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EpisodesManager from "./EpisodesManager";

interface SeriesListProps {
  series: any[];
  onEdit: (series: any) => void;
}

const SeriesList = ({ series, onEdit }: SeriesListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_series")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      toast({
        title: t("admin.series.deleted"),
      });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: t("admin.series.deleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (series.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 glass-panel rounded-lg border border-primary/20">
        <Layers className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">אין סדרות עדיין</h3>
        <p className="text-muted-foreground">התחל ליצור סדרה ראשונה למוצר זה</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {series.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 glass-panel rounded-lg border border-primary/20"
          >
            <div className="flex-1">
              <h3 className="font-bold">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant={item.is_published ? "default" : "secondary"}>
                  {item.is_published ? "מפורסם" : "טיוטה"}
                </Badge>
                <Badge variant="outline">מיקום: {item.order_index}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSeriesId(item.id)}
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(item)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteId(item.id)}
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
              פעולה זו תמחק את הסדרה לצמיתות. לא ניתן לשחזר את הפעולה.
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

      <Dialog open={!!selectedSeriesId} onOpenChange={() => setSelectedSeriesId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSeriesId && (
            <EpisodesManager 
              seriesId={selectedSeriesId}
              productId={series.find(s => s.id === selectedSeriesId)?.product_id}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SeriesList;
