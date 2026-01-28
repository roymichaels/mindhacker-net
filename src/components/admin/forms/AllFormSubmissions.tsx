import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download,
  Inbox,
  Trash2,
  Mail,
  Search,
  CheckCircle2,
  FileText,
  Loader2,
  Brain,
  Sparkles,
  Eye,
  MessageSquareText,
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

interface FormAnalysis {
  id: string;
  form_submission_id: string;
  analysis_summary: string;
  patterns: string[] | null;
  transformation_potential: string | null;
  recommendation: string | null;
  recommended_product: string | null;
  created_at: string;
}

const AllFormSubmissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [formFilter, setFormFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAnalysis, setSelectedAnalysis] = useState<FormAnalysis | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

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

  // Fetch all form analyses
  const { data: analyses = [] } = useQuery({
    queryKey: ["all-form-analyses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_analyses")
        .select("*");
      if (error) throw error;
      return data as FormAnalysis[];
    },
  });

  // Helper to get analysis for a submission
  const getAnalysisForSubmission = (submissionId: string) => {
    return analyses.find((a) => a.form_submission_id === submissionId);
  };

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
    return text.length > 60 ? text.slice(0, 60) + "..." : text;
  };

  // Extract name from form responses
  const getNameFromSubmission = (submission: FormSubmission) => {
    const fields = getFieldsForForm(submission.form_id);
    // Look for name field by label
    const nameField = fields.find((f) => 
      f.label.includes("שם") || 
      f.label.toLowerCase().includes("name") ||
      f.label.includes("השם")
    );
    if (nameField) {
      const value = submission.responses[nameField.id];
      if (value && !Array.isArray(value)) return value;
    }
    // Fallback: return first short text response (likely a name)
    for (const field of fields) {
      const value = submission.responses[field.id];
      if (value && !Array.isArray(value) && value.length < 50 && value.length > 1) {
        return value;
      }
    }
    return null;
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

  const handleDownloadPDF = async (submission: FormSubmission) => {
    const fields = getFieldsForForm(submission.form_id);
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

      {/* Submissions List */}
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-6">
          {filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">אין תשובות</h3>
              <p className="text-muted-foreground">לא נמצאו תשובות התואמות את החיפוש</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSubmissions.map((submission) => {
                const hasAnalysis = !!getAnalysisForSubmission(submission.id);
                const submitterName = getNameFromSubmission(submission);

                return (
                  <div
                    key={submission.id}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50",
                      submission.status === "new" 
                        ? "border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5" 
                        : "border-border"
                    )}
                  >
                    {/* Info Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {submitterName && (
                          <span className="text-sm font-semibold text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                            {submitterName}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                          {getFormName(submission.form_id)}
                        </span>
                        {getStatusBadge(submission.status)}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
                        {submission.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{submission.email}</span>
                          </span>
                        )}
                        <span className="text-[10px] sm:text-xs">
                          {format(new Date(submission.submitted_at), "dd/MM/yyyy HH:mm", { locale: he })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <TooltipProvider delayDuration={300}>
                      <div className="flex items-center gap-1 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 mt-1 sm:mt-0 w-full sm:w-auto justify-end">
                        {/* View Answers */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>צפה בתשובות</TooltipContent>
                        </Tooltip>

                        {/* Mark as Processed */}
                        {submission.status !== "processed" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                onClick={() => markProcessedMutation.mutate(submission.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>סמן כטופל</TooltipContent>
                          </Tooltip>
                        )}

                        {/* Download PDF */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownloadPDF(submission)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>הורד PDF</TooltipContent>
                        </Tooltip>

                        {/* AI Analysis */}
                        {hasAnalysis && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                onClick={() => {
                                  const analysis = getAnalysisForSubmission(submission.id);
                                  if (analysis) setSelectedAnalysis(analysis);
                                }}
                              >
                                <Brain className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>ניתוח AI</TooltipContent>
                          </Tooltip>
                        )}

                        {/* Delete */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (confirm("למחוק את התשובה?")) {
                                  deleteMutation.mutate(submission.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>מחק</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answers Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-primary" />
              {selectedSubmission && getFormName(selectedSubmission.form_id)}
            </DialogTitle>
            {selectedSubmission && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground pt-1">
                {selectedSubmission.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedSubmission.email}
                  </span>
                )}
                <span>
                  {format(new Date(selectedSubmission.submitted_at), "dd/MM/yyyy HH:mm", { locale: he })}
                </span>
                {getStatusBadge(selectedSubmission.status)}
              </div>
            )}
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-3 mt-4">
              {getFieldsForForm(selectedSubmission.form_id).map((field, index) => {
                const value = selectedSubmission.responses[field.id];
                const displayValue = Array.isArray(value) ? value.join(", ") : value;

                return (
                  <div key={field.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-medium text-sm text-foreground">{field.label}</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {displayValue || <span className="text-muted-foreground italic">לא נענה</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Quick Actions in Modal */}
              <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                {selectedSubmission.status !== "processed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      markProcessedMutation.mutate(selectedSubmission.id);
                      setSelectedSubmission(null);
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
                  onClick={() => handleDownloadPDF(selectedSubmission)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  הורד PDF
                </Button>
                {getAnalysisForSubmission(selectedSubmission.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const analysis = getAnalysisForSubmission(selectedSubmission.id);
                      if (analysis) {
                        setSelectedSubmission(null);
                        setTimeout(() => setSelectedAnalysis(analysis), 100);
                      }
                    }}
                    className="gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Brain className="h-4 w-4" />
                    ניתוח AI
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={!!selectedAnalysis} onOpenChange={(open) => !open && setSelectedAnalysis(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              ניתוח AI של השאלון
            </DialogTitle>
          </DialogHeader>
          
          {selectedAnalysis && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400" />
                  סיכום
                </h4>
                <p className="text-foreground leading-relaxed bg-purple-50 dark:bg-purple-500/10 p-4 rounded-lg border border-purple-200 dark:border-purple-500/20">
                  {selectedAnalysis.analysis_summary}
                </p>
              </div>

              {/* Patterns */}
              {selectedAnalysis.patterns && selectedAnalysis.patterns.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                    דפוסים שזוהו
                  </h4>
                  <div className="space-y-2">
                    {selectedAnalysis.patterns.map((pattern, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="text-foreground">{pattern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transformation Potential */}
              {selectedAnalysis.transformation_potential && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                    פוטנציאל טרנספורמציה
                  </h4>
                  <p className="text-foreground leading-relaxed bg-green-50 dark:bg-green-500/10 p-4 rounded-lg border border-green-200 dark:border-green-500/20">
                    {selectedAnalysis.transformation_potential}
                  </p>
                </div>
              )}

              {/* Recommendation */}
              {selectedAnalysis.recommendation && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                    המלצה
                  </h4>
                  <p className="text-foreground leading-relaxed bg-amber-50 dark:bg-amber-500/10 p-4 rounded-lg border border-amber-200 dark:border-amber-500/20">
                    {selectedAnalysis.recommendation}
                  </p>
                </div>
              )}

              {/* Recommended Product */}
              {selectedAnalysis.recommended_product && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground">מוצר מומלץ:</span>
                  <Badge variant="secondary">{selectedAnalysis.recommended_product}</Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllFormSubmissions;
