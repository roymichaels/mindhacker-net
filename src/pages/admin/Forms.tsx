import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileEdit, Inbox, Clock, CheckCircle, FileText } from "lucide-react";
import FormsList from "@/components/admin/forms/FormsList";
import FormDialog from "@/components/admin/forms/FormDialog";
import FormFieldsEditor from "@/components/admin/forms/FormFieldsEditor";
import FormSubmissionsViewer from "@/components/admin/forms/FormSubmissionsViewer";
import AllFormSubmissions from "@/components/admin/forms/AllFormSubmissions";

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

  const { data: submissions = [] } = useQuery({
    queryKey: ["all-form-submissions-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_submissions")
        .select("id, status");
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    totalForms: forms?.length || 0,
    totalSubmissions: submissions.length,
    newSubmissions: submissions.filter((s) => s.status === "new").length,
    processed: submissions.filter((s) => s.status === "processed").length,
  };

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
          <p className="text-muted-foreground">יצירה וניהול טפסים ותשובות</p>
        </div>
        <Button onClick={() => setIsFormDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          טופס חדש
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">סה"כ טפסים</p>
                <p className="text-2xl font-bold text-primary">{stats.totalForms}</p>
              </div>
              <FileText className="h-6 w-6 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">סה"כ תשובות</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalSubmissions}</p>
              </div>
              <Inbox className="h-6 w-6 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">חדשות</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.newSubmissions}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">טופלו</p>
                <p className="text-2xl font-bold text-green-400">{stats.processed}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="forms" className="space-y-4">
        <TabsList className="glass-panel">
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FileEdit className="h-4 w-4" />
            טפסים ({stats.totalForms})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            תשובות ({stats.totalSubmissions})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms">
          <FormsList
            forms={forms || []}
            onEdit={handleEdit}
            onEditFields={setFieldEditorFormId}
            onViewSubmissions={setSubmissionsFormId}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="submissions">
          <AllFormSubmissions />
        </TabsContent>
      </Tabs>

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
