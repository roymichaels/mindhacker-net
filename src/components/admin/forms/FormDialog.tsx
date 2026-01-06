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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(1, "נא להזין כותרת"),
  description: z.string().optional(),
  thank_you_message: z.string().optional(),
  show_intro: z.boolean().default(true),
  intro_title: z.string().optional(),
  intro_subtitle: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FormSettings {
  thank_you_message?: string;
  show_progress?: boolean;
  show_intro?: boolean;
  intro_title?: string;
  intro_subtitle?: string;
}

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
      show_intro: true,
      intro_title: "",
      intro_subtitle: "",
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
      const settings = existingForm.settings as FormSettings | null;
      form.reset({
        title: existingForm.title,
        description: existingForm.description || "",
        thank_you_message: settings?.thank_you_message || "תודה על מילוי הטופס!",
        show_intro: settings?.show_intro !== false,
        intro_title: settings?.intro_title || "",
        intro_subtitle: settings?.intro_subtitle || "",
      });
    } else if (!formId) {
      form.reset({
        title: "",
        description: "",
        thank_you_message: "תודה על מילוי הטופס!",
        show_intro: true,
        intro_title: "",
        intro_subtitle: "",
      });
    }
  }, [existingForm, formId, form]);

  const showIntro = form.watch("show_intro");

  const onSubmit = async (values: FormValues) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const formData = {
        title: values.title,
        description: values.description || null,
        settings: {
          thank_you_message: values.thank_you_message || "תודה על מילוי הטופס!",
          show_progress: true,
          show_intro: values.show_intro,
          intro_title: values.intro_title || "",
          intro_subtitle: values.intro_subtitle || "",
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

            {/* Intro Screen Settings */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <FormField
                control={form.control}
                name="show_intro"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>מסך פתיחה</FormLabel>
                      <FormDescription>
                        הצג מסך פתיחה לפני תחילת הטופס
                      </FormDescription>
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

              {showIntro && (
                <>
                  <FormField
                    control={form.control}
                    name="intro_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>כותרת מסך פתיחה (אופציונלי)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="השאר ריק לשימוש בכותרת הטופס"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="intro_subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>תת-כותרת / משפט השראה (אופציונלי)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="משפט מעורר השראה או הסבר קצר..."
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

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
