import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import FieldEditorDialog from "./FieldEditorDialog";

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

interface FormFieldsEditorProps {
  formId: string;
  onClose: () => void;
}

const fieldTypeLabels: Record<string, string> = {
  text: "טקסט קצר",
  email: "אימייל",
  phone: "טלפון",
  textarea: "טקסט ארוך",
  select: "בחירה מרשימה",
  radio: "בחירה יחידה",
  checkbox: "תיבות סימון",
  rating: "דירוג כוכבים",
  date: "תאריך",
  number: "מספר",
};

const FormFieldsEditor = ({ formId, onClose }: FormFieldsEditorProps) => {
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);
  const queryClient = useQueryClient();

  const { data: form } = useQuery({
    queryKey: ["custom-form", formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("id", formId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: fields = [], refetch } = useQuery({
    queryKey: ["form-fields", formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", formId)
        .order("order_index");
      if (error) throw error;
      return data as FormField[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from("form_fields")
        .delete()
        .eq("id", fieldId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "השדה נמחק" });
      refetch();
    },
    onError: () => {
      toast({ title: "שגיאה במחיקה", variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({
      fieldId,
      newIndex,
    }: {
      fieldId: string;
      newIndex: number;
    }) => {
      const { error } = await supabase
        .from("form_fields")
        .update({ order_index: newIndex })
        .eq("id", fieldId);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const fieldIndex = fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const otherField = fields[newIndex];

    // Swap order indexes
    reorderMutation.mutate({ fieldId, newIndex: otherField.order_index });
    reorderMutation.mutate({ fieldId: otherField.id, newIndex: fields[fieldIndex].order_index });
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>עריכת שדות - {form?.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Button
            onClick={() => setIsAddingField(true)}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            הוסף שדה
          </Button>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>אין שדות עדיין</p>
              <p className="text-sm">לחץ "הוסף שדה" כדי להתחיל</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-3 flex items-center gap-2 group"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{field.label}</span>
                      {field.is_required && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          חובה
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {fieldTypeLabels[field.type] || field.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveField(field.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveField(field.id, "down")}
                      disabled={index === fields.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingField(field)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        if (confirm("למחוק את השדה?")) {
                          deleteMutation.mutate(field.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {(isAddingField || editingField) && (
          <FieldEditorDialog
            formId={formId}
            field={editingField}
            nextIndex={fields.length}
            onClose={() => {
              setIsAddingField(false);
              setEditingField(null);
            }}
            onSuccess={() => {
              setIsAddingField(false);
              setEditingField(null);
              refetch();
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FormFieldsEditor;
