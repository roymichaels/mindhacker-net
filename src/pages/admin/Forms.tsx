import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FormsList from "@/components/admin/forms/FormsList";
import FormDialog from "@/components/admin/forms/FormDialog";
import FormFieldsEditor from "@/components/admin/forms/FormFieldsEditor";
import FormSubmissionsViewer from "@/components/admin/forms/FormSubmissionsViewer";

const Forms = () => {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [fieldEditorFormId, setFieldEditorFormId] = useState<string | null>(null);
  const [submissionsFormId, setSubmissionsFormId] = useState<string | null>(null);

  const { data: forms, refetch } = useQuery({
    queryKey: ["custom-forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (formId: string) => {
    setEditingFormId(formId);
    setIsFormDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsFormDialogOpen(false);
    setEditingFormId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">טפסים</h1>
          <p className="text-muted-foreground">יצירה וניהול טפסים מותאמים אישית</p>
        </div>
        <Button onClick={() => setIsFormDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          טופס חדש
        </Button>
      </div>

      <FormsList
        forms={forms || []}
        onEdit={handleEdit}
        onEditFields={setFieldEditorFormId}
        onViewSubmissions={setSubmissionsFormId}
        onRefresh={refetch}
      />

      <FormDialog
        open={isFormDialogOpen}
        onOpenChange={handleDialogClose}
        formId={editingFormId}
        onSuccess={() => {
          handleDialogClose();
          refetch();
        }}
      />

      {fieldEditorFormId && (
        <FormFieldsEditor
          formId={fieldEditorFormId}
          onClose={() => setFieldEditorFormId(null)}
        />
      )}

      {submissionsFormId && (
        <FormSubmissionsViewer
          formId={submissionsFormId}
          onClose={() => setSubmissionsFormId(null)}
        />
      )}
    </div>
  );
};

export default Forms;
