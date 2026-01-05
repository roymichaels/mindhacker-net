import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Eye, Inbox, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface FormSubmission {
  id: string;
  form_id: string;
  responses: Record<string, string | string[]>;
  metadata: Record<string, unknown>;
  submitted_at: string;
  status: string;
}

interface FormField {
  id: string;
  label: string;
  type: string;
}

interface FormSubmissionsViewerProps {
  formId: string;
  onClose: () => void;
}

const FormSubmissionsViewer = ({
  formId,
  onClose,
}: FormSubmissionsViewerProps) => {
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

  const { data: fields = [] } = useQuery({
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

  const { data: submissions = [], refetch } = useQuery({
    queryKey: ["form-submissions", formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as FormSubmission[];
    },
  });

  const markViewedMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from("form_submissions")
        .update({ status: "viewed" })
        .eq("id", submissionId);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from("form_submissions")
        .delete()
        .eq("id", submissionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "התשובה נמחקה" });
      refetch();
    },
    onError: () => {
      toast({ title: "שגיאה במחיקה", variant: "destructive" });
    },
  });

  const exportToCSV = () => {
    if (submissions.length === 0) {
      toast({ title: "אין תשובות לייצוא" });
      return;
    }

    const fieldLabels = fields.reduce(
      (acc, f) => ({ ...acc, [f.id]: f.label }),
      {} as Record<string, string>
    );

    const headers = ["תאריך", ...fields.map((f) => f.label)];
    const rows = submissions.map((sub) => {
      const date = format(new Date(sub.submitted_at), "dd/MM/yyyy HH:mm", {
        locale: he,
      });
      const values = fields.map((f) => {
        const val = sub.responses[f.id];
        if (Array.isArray(val)) return val.join(", ");
        return val || "";
      });
      return [date, ...values];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form?.title || "form"}-submissions.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "הקובץ הורד בהצלחה!" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500/20 text-blue-400">חדש</Badge>;
      case "viewed":
        return <Badge variant="secondary">נצפה</Badge>;
      case "processed":
        return <Badge className="bg-green-500/20 text-green-400">טופל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFieldLabel = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    return field?.label || fieldId;
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>תשובות - {form?.title}</SheetTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={submissions.length === 0}
            >
              <Download className="h-4 w-4 ml-2" />
              ייצוא CSV
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-120px)]">
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">אין תשובות עדיין</h3>
              <p className="text-muted-foreground">
                שתף את הקישור לטופס כדי לקבל תשובות
              </p>
            </div>
          ) : (
            <div className="space-y-4 pl-4">
              {submissions.map((submission) => (
                <Card
                  key={submission.id}
                  className="glass-panel border-white/10"
                  onClick={() => {
                    if (submission.status === "new") {
                      markViewedMutation.mutate(submission.id);
                    }
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(submission.status)}
                        <span className="text-sm text-muted-foreground">
                          {format(
                            new Date(submission.submitted_at),
                            "dd/MM/yyyy HH:mm",
                            { locale: he }
                          )}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("למחוק את התשובה?")) {
                            deleteMutation.mutate(submission.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(submission.responses).map(([fieldId, value]) => (
                      <div key={fieldId} className="text-sm">
                        <span className="font-medium text-muted-foreground">
                          {getFieldLabel(fieldId)}:
                        </span>{" "}
                        <span>
                          {Array.isArray(value) ? value.join(", ") : value}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default FormSubmissionsViewer;
