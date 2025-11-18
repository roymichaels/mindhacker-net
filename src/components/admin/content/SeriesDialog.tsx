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

interface SeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series?: any;
  productId: string;
}

const SeriesDialog = ({ open, onOpenChange, series, productId }: SeriesDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      is_published: true,
      order_index: "0",
    },
  });

  useEffect(() => {
    if (series) {
      form.reset({
        title: series.title || "",
        description: series.description || "",
        is_published: series.is_published ?? true,
        order_index: series.order_index?.toString() || "0",
      });
    } else {
      form.reset();
    }
  }, [series, open]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const data = {
        ...values,
        order_index: parseInt(values.order_index) || 0,
        product_id: productId,
      };

      if (series) {
        const { error } = await supabase
          .from("content_series")
          .update(data)
          .eq("id", series.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("content_series")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      toast({
        title: series ? "הסדרה עודכנה בהצלחה" : "הסדרה נוצרה בהצלחה",
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {series ? "עריכת סדרה" : "יצירת סדרה חדשה"}
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

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-primary/20 p-4">
                  <div className="space-y-0.5">
                    <FormLabel>פרסם סדרה</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      סמן כדי להפוך את הסדרה לגלויה
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
                {mutation.isPending ? "שומר..." : series ? "עדכן" : "צור"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SeriesDialog;
