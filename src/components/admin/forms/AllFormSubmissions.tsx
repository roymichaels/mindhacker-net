import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Download,
  Inbox,
  Trash2,
  ChevronDown,
  ChevronUp,
  Mail,
  Search,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { generateFormPDF } from "@/lib/pdfGenerator";

interface FormSubmission {
  id: string;
  form_id: string;
  responses: Record<string, string | string[]>;
  metadata: Record<string, unknown>;
  submitted_at: string;
  status: string;
  email: string | null;
  user_id: string | null;
}

interface Form {
  id: string;
  title: string;
}

interface FormField {
  id: string;
  form_id: string;
  label: string;
  type: string;
}

const AllFormSubmissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [formFilter, setFormFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());

  const { data: forms = [] } = useQuery({
    queryKey: ["custom-forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("id, title")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Form[];
    },
  });

  const { data: allFields = [] } = useQuery({
    queryKey: ["all-form-fields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_fields")
        .select("id, form_id, label, type")
        .order("order_index");
      if (error) throw error;
      return data as FormField[];
    },
  });

  const { data: submissions = [], isLoading, refetch } = useQuery({
    queryKey: ["all-form-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as FormSubmission[];
    },
  });

  const markProcessedMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from("form_submissions")
        .update({ status: "processed" })
        .eq("id", submissionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "סומן כטופל" });
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

  const getFormName = (formId: string) => {
    const form = forms.find((f) => f.id === formId);
    return form?.title || "טופס לא ידוע";
  };

  const getFieldsForForm = (formId: string) => {
    return allFields.filter((f) => f.form_id === formId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">חדש</Badge>;
      case "viewed":
        return <Badge variant="secondary" className="border-border">נצפה</Badge>;
      case "processed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">טופל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPreviewText = (submission: FormSubmission) => {
    const firstResponse = Object.entries(submission.responses).find(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value.trim().length > 0;
    });
    if (!firstResponse) return "אין תשובות";
    const value = firstResponse[1];
    const text = Array.isArray(value) ? value.join(", ") : value;
    return text.length > 50 ? text.slice(0, 50) + "..." : text;
  };

  const toggleExpanded = (id: string) => {
    setExpandedSubmissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast({ title: "אין תשובות לייצוא" });
      return;
    }

    const headers = ["טופס", "תאריך", "אימייל", "סטטוס"];
    const rows = filteredSubmissions.map((sub) => {
      const date = format(new Date(sub.submitted_at), "dd/MM/yyyy HH:mm", { locale: he });
      return [
        getFormName(sub.form_id),
        date,
        sub.email || "",
        sub.status,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `all-submissions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "הקובץ הורד בהצלחה!" });
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = !searchTerm || 
      (sub.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesForm = formFilter === "all" || sub.form_id === formFilter;
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesForm && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חפש לפי אימייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={formFilter} onValueChange={setFormFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="כל הטפסים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הטפסים</SelectItem>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="כל הסטטוסים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="new">חדש</SelectItem>
                <SelectItem value="viewed">נצפה</SelectItem>
                <SelectItem value="processed">טופל</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV} disabled={filteredSubmissions.length === 0}>
              <Download className="h-4 w-4 ml-2" />
              ייצוא CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-6">
          {filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">אין תשובות</h3>
              <p className="text-muted-foreground">לא נמצאו תשובות התואמות את החיפוש</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((submission) => {
                const isExpanded = expandedSubmissions.has(submission.id);
                const fields = getFieldsForForm(submission.form_id);

                return (
                  <Collapsible
                    key={submission.id}
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(submission.id)}
                  >
                    <Card
                      className={cn(
                        "border-white/10 transition-all",
                        submission.status === "new" && "border-blue-500/30 bg-blue-500/5",
                        isExpanded && "ring-1 ring-primary/30"
                      )}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="pb-2 cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium">{getFormName(submission.form_id)}</span>
                                <div className="flex items-center gap-2">
                                  {submission.email ? (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {submission.email}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">ללא אימייל</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground hidden md:block">
                                {format(new Date(submission.submitted_at), "dd/MM/yyyy HH:mm", { locale: he })}
                              </span>
                              {getStatusBadge(submission.status)}
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {!isExpanded && (
                            <p className="text-sm text-muted-foreground truncate mt-2">
                              {getPreviewText(submission)}
                            </p>
                          )}
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                          {/* Answers Section */}
                          <div className="space-y-3 pt-4 border-t border-border/50">
                            {fields.map((field, index) => {
                              const value = submission.responses[field.id];
                              const displayValue = Array.isArray(value) ? value.join(", ") : value;

                              return (
                                <div key={field.id} className="p-3 rounded-lg bg-background/50 border border-border/30">
                                  <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                      {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0 space-y-1">
                                      <p className="font-medium text-sm text-foreground">{field.label}</p>
                                      <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                                        {displayValue || <span className="text-muted-foreground italic">לא נענה</span>}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2">
                              {submission.status !== "processed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markProcessedMutation.mutate(submission.id);
                                  }}
                                  className="gap-2"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  סמן כטופל
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const formResponses = fields.map((field) => ({
                                    question: field.label,
                                    answer: submission.responses[field.id] || "",
                                  }));
                                  await generateFormPDF(
                                    getFormName(submission.form_id),
                                    formResponses,
                                    new Date(submission.submitted_at),
                                    true
                                  );
                                  toast({ title: "PDF הורד בהצלחה!" });
                                }}
                                className="gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                הורד PDF
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllFormSubmissions;
