import { useState } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Download, Inbox, Trash2, ChevronDown, ChevronUp, Mail, User, Calendar, Clock, CheckCircle2, FileText } from "lucide-react";
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

interface FormField {
  id: string;
  label: string;
  type: string;
}

interface FormSubmissionsViewerProps {
  formId: string;
  onClose: () => void;
}

// Parse long form labels for better display
const parseLabel = (label: string): { title: string; context: string | null } => {
  // Check if the label has multiple paragraphs or is very long
  const parts = label.split('\n\n');
  if (parts.length > 1) {
    return { title: parts[0], context: parts.slice(1).join('\n\n') };
  }
  
  // If it's a single long paragraph, just return as title
  if (label.length > 100) {
    const sentenceEnd = label.indexOf('.');
    if (sentenceEnd > 20 && sentenceEnd < 100) {
      return { title: label.slice(0, sentenceEnd + 1), context: label.slice(sentenceEnd + 1).trim() || null };
    }
  }
  
  return { title: label, context: null };
};

const FormSubmissionsViewer = ({
  formId,
  onClose,
}: FormSubmissionsViewerProps) => {
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());

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

  const exportToCSV = () => {
    if (submissions.length === 0) {
      toast({ title: "אין תשובות לייצוא" });
      return;
    }

    const headers = ["תאריך", "אימייל", ...fields.map((f) => f.label)];
    const rows = submissions.map((sub) => {
      const date = format(new Date(sub.submitted_at), "dd/MM/yyyy HH:mm", {
        locale: he,
      });
      const values = fields.map((f) => {
        const val = sub.responses[f.id];
        if (Array.isArray(val)) return val.join(", ");
        return val || "";
      });
      return [date, sub.email || "", ...values];
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
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">חדש</Badge>;
      case "viewed":
        return <Badge variant="secondary" className="border-border">נצפה</Badge>;
      case "processed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">טופל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFieldLabel = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    return field?.label || fieldId;
  };

  const toggleExpanded = (id: string) => {
    setExpandedSubmissions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getPreviewText = (submission: FormSubmission) => {
    // Get first non-empty response for preview
    const firstResponse = Object.entries(submission.responses).find(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value && value.trim().length > 0;
    });
    if (!firstResponse) return "אין תשובות";
    const value = firstResponse[1];
    const text = Array.isArray(value) ? value.join(", ") : value;
    return text.length > 60 ? text.slice(0, 60) + "..." : text;
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-3xl">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              תשובות - {form?.title}
              <Badge variant="outline" className="text-xs">
                {submissions.length}
              </Badge>
            </SheetTitle>
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
            <div className="space-y-3 pl-4">
              {submissions.map((submission) => {
                const isExpanded = expandedSubmissions.has(submission.id);
                const responseCount = Object.keys(submission.responses).length;

                return (
                  <Collapsible
                    key={submission.id}
                    open={isExpanded}
                    onOpenChange={() => {
                      toggleExpanded(submission.id);
                      if (submission.status === "new") {
                        markViewedMutation.mutate(submission.id);
                      }
                    }}
                  >
                    <Card className={cn(
                      "glass-panel border-white/10 transition-all",
                      submission.status === "new" && "border-blue-500/30 bg-blue-500/5",
                      isExpanded && "ring-1 ring-primary/30"
                    )}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="pb-2 cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusBadge(submission.status)}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(submission.submitted_at), "dd/MM/yyyy", { locale: he })}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(submission.submitted_at), "HH:mm", { locale: he })}
                                </div>
                              </div>
                              
                              {/* Email display */}
                              {submission.email ? (
                                <div className="flex items-center gap-2 mb-2">
                                  <Mail className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">{submission.email}</span>
                                  {submission.user_id && (
                                    <Badge variant="outline" className="text-xs gap-1">
                                      <User className="h-3 w-3" />
                                      משתמש רשום
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  <span className="text-sm">ללא אימייל</span>
                                </div>
                              )}

                              {/* Preview when collapsed */}
                              {!isExpanded && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {getPreviewText(submission)}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {responseCount} תשובות
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                          {/* Answers Section */}
                          <div className="space-y-4 pt-4 border-t border-border/50">
                            {fields.map((field, index) => {
                              const value = submission.responses[field.id];
                              const { title, context } = parseLabel(field.label);
                              const displayValue = Array.isArray(value) ? value.join(", ") : value;

                              return (
                                <div 
                                  key={field.id} 
                                  className="p-4 rounded-lg bg-background/50 border border-border/30"
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                      {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0 space-y-2">
                                      {/* Question */}
                                      <div>
                                        <p className="font-medium text-sm text-foreground leading-relaxed">
                                          {title}
                                        </p>
                                        {context && (
                                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            {context}
                                          </p>
                                        )}
                                      </div>
                                      
                                      {/* Answer */}
                                      <div className="bg-primary/5 rounded-md p-3 border border-primary/10">
                                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                          {displayValue || (
                                            <span className="text-muted-foreground italic">לא נענה</span>
                                          )}
                                        </p>
                                      </div>
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
                                  const formResponses = fields.map(field => ({
                                    question: field.label,
                                    answer: submission.responses[field.id] || "",
                                  }));
                                  await generateFormPDF(
                                    form?.title || "טופס",
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
                              <Trash2 className="h-4 w-4 ml-2" />
                              מחק
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default FormSubmissionsViewer;