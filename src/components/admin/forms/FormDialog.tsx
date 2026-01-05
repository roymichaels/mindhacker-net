import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(1, "נא להזין כותרת"),
  description: z.string().optional(),
  thank_you_message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string | null;
  onSuccess: () => void;
}

const FormDialog = ({
  open,
  onOpenChange,
  formId,
  onSuccess,
}: FormDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      thank_you_message: "תודה על מילוי הטופס!",
    },
  });

  const { data: existingForm } = useQuery({
    queryKey: ["custom-form", formId],
    queryFn: async () => {
      if (!formId) return null;
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("id", formId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!formId,
  });

  useEffect(() => {
    if (existingForm) {
      const settings = existingForm.settings as { thank_you_message?: string } | null;
      form.reset({
        title: existingForm.title,
        description: existingForm.description || "",
        thank_you_message: settings?.thank_you_message || "תודה על מילוי הטופס!",
      });
    } else if (!formId) {
      form.reset({
        title: "",
        description: "",
        thank_you_message: "תודה על מילוי הטופס!",
      });
    }
  }, [existingForm, formId, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const formData = {
        title: values.title,
        description: values.description || null,
        settings: {
          thank_you_message: values.thank_you_message || "תודה על מילוי הטופס!",
          show_progress: true,
        },
      };

      if (formId) {
        const { error } = await supabase
          .from("custom_forms")
          .update(formData)
          .eq("id", formId);
        if (error) throw error;
        toast({ title: "הטופס עודכן בהצלחה!" });
      } else {
        const { error } = await supabase.from("custom_forms").insert({
          ...formData,
          created_by: user.user?.id,
        });
        if (error) throw error;
        toast({ title: "הטופס נוצר בהצלחה!" });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving form:", error);
      toast({ title: "שגיאה בשמירת הטופס", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{formId ? "עריכת טופס" : "טופס חדש"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת הטופס</FormLabel>
                  <FormControl>
                    <Input placeholder="לדוגמה: טופס יצירת קשר" {...field} />
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
                  <FormLabel>תיאור (אופציונלי)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="תיאור קצר של הטופס..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thank_you_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הודעת תודה</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="תודה על מילוי הטופס!"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                ביטול
              </Button>
              <Button type="submit">{formId ? "עדכן" : "צור טופס"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;
