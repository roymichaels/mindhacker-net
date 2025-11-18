import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { FileUpload } from "../FileUpload";

interface EpisodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episode?: any;
  seriesId: string;
  productId: string;
}

const EpisodeDialog = ({ open, onOpenChange, episode, seriesId, productId }: EpisodeDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      video_url: "",
      thumbnail_url: "",
      duration_seconds: "",
      is_preview: false,
      order_index: "0",
    },
  });

  useEffect(() => {
    if (episode) {
      form.reset({
        title: episode.title || "",
        description: episode.description || "",
        video_url: episode.video_url || "",
        thumbnail_url: episode.thumbnail_url || "",
        duration_seconds: episode.duration_seconds?.toString() || "",
        is_preview: episode.is_preview ?? false,
        order_index: episode.order_index?.toString() || "0",
      });
    } else {
      form.reset();
    }
  }, [episode, open]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const data = {
        ...values,
        duration_seconds: values.duration_seconds ? parseInt(values.duration_seconds) : null,
        order_index: parseInt(values.order_index) || 0,
        series_id: seriesId,
        product_id: productId,
      };

      if (episode) {
        const { error } = await supabase
          .from("content_episodes")
          .update(data)
          .eq("id", episode.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("content_episodes")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-episodes"] });
      toast({
        title: episode ? "הפרק עודכן בהצלחה" : "הפרק נוצר בהצלחה",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {episode ? "עריכת פרק" : "יצירת פרק חדש"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "שדה חובה" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_url"
              rules={{ required: "שדה חובה" }}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      bucket="content-videos"
                      accept="video/*"
                      label="קובץ וידאו"
                      value={field.value}
                      onChange={field.onChange}
                      maxSizeMB={500}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      bucket="content-thumbnails"
                      accept="image/*"
                      label="תמונת תצוגה מקדימה"
                      value={field.value}
                      onChange={field.onChange}
                      maxSizeMB={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>משך בשניות</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order_index"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מיקום בסדר</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_preview"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-primary/20 p-4">
                  <div className="space-y-0.5">
                    <FormLabel>תצוגה מקדימה חינמית</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      סמן כדי להפוך את הפרק לזמין לכולם
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ביטול
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "שומר..." : episode ? "עדכן" : "צור"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EpisodeDialog;
