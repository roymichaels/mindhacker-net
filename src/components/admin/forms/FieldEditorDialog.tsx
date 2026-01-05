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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const fieldTypes = [
  { value: "text", label: "טקסט קצר" },
  { value: "email", label: "אימייל" },
  { value: "phone", label: "טלפון" },
  { value: "textarea", label: "טקסט ארוך" },
  { value: "select", label: "בחירה מרשימה" },
  { value: "radio", label: "בחירה יחידה" },
  { value: "checkbox", label: "תיבות סימון" },
  { value: "rating", label: "דירוג כוכבים" },
  { value: "date", label: "תאריך" },
  { value: "number", label: "מספר" },
];

const formSchema = z.object({
  type: z.string().min(1, "נא לבחור סוג שדה"),
  label: z.string().min(1, "נא להזין כותרת"),
  placeholder: z.string().optional(),
  is_required: z.boolean(),
  options: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FormField {
  id: string;
  form_id: string;
  type: string;
  label: string;
  placeholder: string | null;
  is_required: boolean;
  options: string[];
  order_index: number;
}

interface FieldEditorDialogProps {
  formId: string;
  field: FormField | null;
  nextIndex: number;
  onClose: () => void;
  onSuccess: () => void;
}

const FieldEditorDialog = ({
  formId,
  field,
  nextIndex,
  onClose,
  onSuccess,
}: FieldEditorDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "text",
      label: "",
      placeholder: "",
      is_required: false,
      options: "",
    },
  });

  const selectedType = form.watch("type");
  const showOptions = ["select", "radio", "checkbox"].includes(selectedType);

  useEffect(() => {
    if (field) {
      form.reset({
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || "",
        is_required: field.is_required,
        options: Array.isArray(field.options) ? field.options.join("\n") : "",
      });
    } else {
      form.reset({
        type: "text",
        label: "",
        placeholder: "",
        is_required: false,
        options: "",
      });
    }
  }, [field, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const options = values.options
        ? values.options.split("\n").filter((o) => o.trim())
        : [];

      const fieldData = {
        form_id: formId,
        type: values.type,
        label: values.label,
        placeholder: values.placeholder || null,
        is_required: values.is_required,
        options,
      };

      if (field) {
        const { error } = await supabase
          .from("form_fields")
          .update(fieldData)
          .eq("id", field.id);
        if (error) throw error;
        toast({ title: "השדה עודכן!" });
      } else {
        const { error } = await supabase.from("form_fields").insert({
          ...fieldData,
          order_index: nextIndex,
        });
        if (error) throw error;
        toast({ title: "השדה נוסף!" });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving field:", error);
      toast({ title: "שגיאה בשמירה", variant: "destructive" });
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{field ? "עריכת שדה" : "הוספת שדה"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סוג השדה</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סוג שדה" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fieldTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>כותרת השאלה</FormLabel>
                  <FormControl>
                    <Input placeholder="לדוגמה: מה השם שלך?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>טקסט עזר (Placeholder)</FormLabel>
                  <FormControl>
                    <Input placeholder="לדוגמה: הכנס את שמך כאן..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showOptions && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אפשרויות</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="הכנס כל אפשרות בשורה נפרדת"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      כל אפשרות בשורה נפרדת
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="is_required"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>שדה חובה</FormLabel>
                    <FormDescription>
                      המשתמש חייב למלא שדה זה
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

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                ביטול
              </Button>
              <Button type="submit">{field ? "עדכן" : "הוסף"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FieldEditorDialog;
