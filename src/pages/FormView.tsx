import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { toast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Check, Loader2, Star, Sparkles, Video, X, FileText, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { generateFormPDF } from "@/lib/pdfGenerator";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string | null;
  is_required: boolean;
  options: string[];
  order_index: number;
}

interface FormSettings {
  thank_you_message?: string;
  show_progress?: boolean;
  intro_title?: string;
  intro_subtitle?: string;
  show_intro?: boolean;
}

interface Form {
  id: string;
  title: string;
  description: string | null;
  settings: FormSettings | null;
  status: string;
}

type PostSubmitAction = "none" | "consciousness-leap" | "personal-hypnosis" | "finish";

const FormView = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();
  
  // Storage key for persisting form progress
  const storageKey = `form-progress-${token}`;
  
  // Initialize state from sessionStorage
  const [showIntro, setShowIntro] = useState(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.showIntro ?? true;
      } catch { return true; }
    }
    return true;
  });
  
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.currentStep ?? 0;
      } catch { return 0; }
    }
    return 0;
  });
  
  const [responses, setResponses] = useState<Record<string, string | string[]>>(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.responses ?? {};
      } catch { return {}; }
    }
    return {};
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [postSubmitAction, setPostSubmitAction] = useState<PostSubmitAction>("none");
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  
  // Persist form state to sessionStorage
  useEffect(() => {
    if (!isSubmitted && token) {
      sessionStorage.setItem(storageKey, JSON.stringify({
        currentStep,
        responses,
        showIntro
      }));
    }
  }, [currentStep, responses, showIntro, isSubmitted, token, storageKey]);

  const ArrowNextIcon = isRTL ? ArrowLeft : ArrowRight;
  const ArrowPrevIcon = isRTL ? ArrowRight : ArrowLeft;

  const { data: form, isLoading: formLoading, error: formError } = useQuery({
    queryKey: ["public-form", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("access_token", token)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data as Form;
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: fields = [] } = useQuery({
    queryKey: ["public-form-fields", form?.id],
    queryFn: async () => {
      if (!form?.id) return [];
      const { data, error } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", form.id)
        .order("order_index");
      if (error) throw error;
      return data as FormField[];
    },
    enabled: !!form?.id,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Check if intro should be shown
  const shouldShowIntro = form?.settings?.show_intro !== false;

  const currentField = fields[currentStep];
  const progress = fields.length > 0 ? ((currentStep + 1) / fields.length) * 100 : 0;
  const showProgress = form?.settings?.show_progress !== false;

  const handleNext = useCallback(() => {
    if (!currentField) return;

    const currentValue = responses[currentField.id];
    if (currentField.is_required) {
      if (!currentValue || (Array.isArray(currentValue) && currentValue.length === 0)) {
        toast({ title: t('validation.fillField'), variant: "destructive" });
        return;
      }
    }

    if (currentStep < fields.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentField, responses, currentStep, fields.length, t]);

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!form?.id) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("form_submissions").insert({
        form_id: form.id,
        responses,
        metadata: {
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          submitted_at_local: new Date().toISOString(),
        },
      });

      if (error) throw error;
      setIsSubmitted(true);
      sessionStorage.removeItem(storageKey); // Clear saved progress on successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ title: t('forms.submitError'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateResponse = (fieldId: string, value: string | string[]) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showIntro && shouldShowIntro) return; // Don't handle enter on intro screen
      if (e.key === "Enter" && !e.shiftKey && currentField?.type !== "textarea") {
        e.preventDefault();
        handleNext();
      }
    },
    [handleNext, currentField?.type, showIntro, shouldShowIntro]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDownloadPDF = () => {
    if (!form) return;
    
    const formResponses = fields.map(field => ({
      question: field.label,
      answer: responses[field.id] || "",
    }));

    generateFormPDF(form.title, formResponses, new Date(), isRTL);
  };

  const handleStartForm = () => {
    setShowIntro(false);
  };

  if (formLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
      </div>
    );
  }

  if (formError || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="glass-panel p-8 text-center max-w-md relative z-10">
          <h1 className="text-2xl font-bold mb-4">{t('forms.notFound')}</h1>
          <p className="text-muted-foreground">
            {t('forms.notAvailable')}
          </p>
        </div>
      </div>
    );
  }

  const handlePostAction = (action: PostSubmitAction) => {
    setPostSubmitAction(action);
    switch (action) {
      case "consciousness-leap":
        navigate("/consciousness-leap");
        break;
      case "personal-hypnosis":
        navigate("/personal-hypnosis");
        break;
      case "finish":
        break;
    }
  };

  // Intro Screen
  if (showIntro && shouldShowIntro && !isSubmitted && fields.length > 0) {
    const introTitle = form.settings?.intro_title || form.title;
    const introSubtitle = form.settings?.intro_subtitle || form.description || t('formIntro.letsStart');

    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl w-full text-center animate-fade-in-up relative z-10">
          {/* Sparkle Icon */}
          <div className="relative mx-auto mb-8 w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
            {introTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
            {introSubtitle}
          </p>

          {/* Begin Button */}
          <Button
            onClick={handleStartForm}
            size="lg"
            className="gap-3 text-lg px-8 py-6 rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Sparkles className="h-5 w-5" />
            {t('formIntro.begin')}
            <ArrowNextIcon className="h-5 w-5" />
          </Button>

          {/* Progress hint */}
          <p className="text-sm text-muted-foreground mt-8">
            {fields.length} {isRTL ? 'שאלות' : 'questions'}
          </p>
        </div>
      </div>
    );
  }

  // Answer Review Dialog
  const AnswerReviewDialog = () => (
    <Dialog open={showAnswerReview} onOpenChange={setShowAnswerReview}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('formComplete.yourResponses')}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-muted-foreground mb-1">
                      {field.label}
                    </p>
                    <p className="text-foreground">
                      {Array.isArray(responses[field.id]) 
                        ? (responses[field.id] as string[]).join(", ") 
                        : responses[field.id] || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {t('formComplete.downloadPdf')}
          </Button>
          <Button
            onClick={() => setShowAnswerReview(false)}
            className="flex-1"
          >
            {t('formComplete.closeReview')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isSubmitted) {
    if (postSubmitAction === "none") {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 relative" dir={isRTL ? 'rtl' : 'ltr'}>
          <AnswerReviewDialog />
          <div className="glass-panel p-8 text-center max-w-2xl animate-fade-in-up relative z-10">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {form.settings?.thank_you_message || t('formComplete.submitted')}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t('formComplete.whatNext')}
            </p>

            {/* View Answers & Download PDF buttons */}
            <div className="flex gap-3 justify-center mb-8">
              <Button
                variant="outline"
                onClick={() => setShowAnswerReview(true)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {t('formComplete.viewAnswers')}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {t('formComplete.downloadPdf')}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Consciousness Leap Option */}
              <button
                onClick={() => handlePostAction("consciousness-leap")}
                className={`group relative p-6 rounded-xl border border-border bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('formComplete.consciousnessLeapOption')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('formComplete.consciousnessLeapDesc')}
                </p>
                <div className="absolute inset-0 rounded-xl border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Personal Hypnosis Option */}
              <button
                onClick={() => handlePostAction("personal-hypnosis")}
                className={`group relative p-6 rounded-xl border border-border bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('formComplete.personalHypnosisOption')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('formComplete.personalHypnosisDesc')}
                </p>
                <div className="absolute inset-0 rounded-xl border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Just Finish Option */}
              <button
                onClick={() => handlePostAction("finish")}
                className={`group relative p-6 rounded-xl border border-border bg-background/50 hover:border-muted-foreground/50 transition-all ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <X className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">{t('formComplete.finishOption')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('formComplete.finishDesc')}
                </p>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" dir={isRTL ? 'rtl' : 'ltr'}>
        <AnswerReviewDialog />
        <div className="glass-panel p-8 text-center max-w-md animate-fade-in-up relative z-10">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {t('formComplete.thankYou')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('formComplete.weWillContact')}
          </p>
          <div className="flex gap-3 justify-center mb-4">
            <Button
              variant="outline"
              onClick={() => setShowAnswerReview(true)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {t('formComplete.viewAnswers')}
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {t('formComplete.downloadPdf')}
            </Button>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            {t('formComplete.returnHome')}
          </Button>
        </div>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="glass-panel p-8 text-center max-w-md relative z-10">
          <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
          <p className="text-muted-foreground">{t('forms.empty')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress bar */}
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          {/* Form title - show only on first question */}
          {currentStep === 0 && (
            <div className="mb-8 text-center animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{form.title}</h1>
              {form.description && (
                <p className="text-muted-foreground">{form.description}</p>
              )}
            </div>
          )}

          {/* Current field */}
          <div key={currentField.id} className="animate-fade-in-up">
            <FieldRenderer
              field={currentField}
              value={responses[currentField.id]}
              onChange={(value) => updateResponse(currentField.id, value)}
              isRTL={isRTL}
              questionNumber={currentStep + 1}
              totalQuestions={fields.length}
            />
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowPrevIcon className="h-4 w-4" />
              {t('common.previous')}
            </Button>

            <div className="text-sm text-muted-foreground">
              {currentStep + 1} / {fields.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : currentStep === fields.length - 1 ? (
                t('forms.send')
              ) : (
                <>
                  {t('common.next')}
                  <ArrowNextIcon className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {t('forms.pressEnter')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Parse long-form labels into structured content
interface ParsedLabel {
  title: string;
  sections: { type: 'text' | 'divider' | 'prompt'; content: string }[];
  isMultiParagraph: boolean;
}

const parseFormLabel = (label: string): ParsedLabel => {
  const lines = label.split('\n').map(l => l.trim());
  
  // Get the title (first non-empty line, remove numbering like "1." or "1)")
  let title = '';
  let startIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]) {
      title = lines[i].replace(/^\d+[\.\)]\s*/, '');
      startIndex = i + 1;
      break;
    }
  }
  
  const sections: { type: 'text' | 'divider' | 'prompt'; content: string }[] = [];
  let currentParagraph: string[] = [];
  
  const flushParagraph = (isPrompt = false) => {
    if (currentParagraph.length > 0) {
      sections.push({
        type: isPrompt ? 'prompt' : 'text',
        content: currentParagraph.join('\n')
      });
      currentParagraph = [];
    }
  };
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for divider
    if (line === '---' || line === '—' || line === '---') {
      flushParagraph();
      sections.push({ type: 'divider', content: '' });
      continue;
    }
    
    // Empty line = paragraph break
    if (!line) {
      flushParagraph();
      continue;
    }
    
    currentParagraph.push(line);
  }
  
  // Flush remaining - treat as prompt if it's after a divider or short
  const lastSectionIsDivider = sections.length > 0 && sections[sections.length - 1].type === 'divider';
  flushParagraph(lastSectionIsDivider || currentParagraph.length <= 2);
  
  return {
    title,
    sections,
    isMultiParagraph: sections.length > 1 || sections.some(s => s.content.includes('\n'))
  };
};

interface FieldRendererProps {
  field: FormField;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  isRTL: boolean;
  questionNumber: number;
  totalQuestions: number;
}

const FieldRenderer = ({ field, value, onChange, isRTL, questionNumber, totalQuestions }: FieldRendererProps) => {
  const parsed = parseFormLabel(field.label);
  
  const renderInput = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <Input
            type={field.type === "phone" ? "tel" : field.type}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className="text-lg py-6 bg-muted/30 border-border/50 focus:border-primary/50 transition-colors"
            autoFocus
          />
        );

      case "textarea":
        return (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "הקלד כאן את תשובתך..."}
            className="text-lg min-h-[180px] bg-muted/30 border-border/50 focus:border-primary/50 transition-colors resize-none leading-relaxed"
            autoFocus
          />
        );

      case "select":
        return (
          <Select value={(value as string) || ""} onValueChange={onChange}>
            <SelectTrigger className="text-lg py-6 bg-muted/30 border-border/50">
              <SelectValue placeholder={field.placeholder || "..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={(value as string) || ""}
            onValueChange={onChange}
            className="space-y-3"
          >
            {field.options.map((option) => (
              <label
                key={option}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  value === option
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/30 bg-muted/20"
                )}
              >
                <RadioGroupItem value={option} />
                <span className="text-lg">{option}</span>
              </label>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-3">
            {field.options.map((option) => (
              <label
                key={option}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                  selectedValues.includes(option)
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/30 bg-muted/20"
                )}
              >
                <Checkbox
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== option));
                    }
                  }}
                />
                <span className="text-lg">{option}</span>
              </label>
            ))}
          </div>
        );

      case "rating":
        const rating = parseInt((value as string) || "0");
        return (
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star.toString())}
                className="p-2 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "h-10 w-10 transition-colors",
                    star <= rating
                      ? "fill-accent text-accent"
                      : "text-muted-foreground/40"
                  )}
                />
              </button>
            ))}
          </div>
        );

      case "date":
        return (
          <Input
            type="date"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-lg py-6 bg-muted/30 border-border/50"
            autoFocus
          />
        );

      default:
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className="text-lg py-6 bg-muted/30 border-border/50"
            autoFocus
          />
        );
    }
  };

  // Simple field (name, email, etc.) - compact layout
  if (!parsed.isMultiParagraph && parsed.sections.length === 0) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            {questionNumber}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {parsed.title}
            {field.is_required && <span className="text-destructive/70 text-lg"> *</span>}
          </h2>
        </div>
        {renderInput()}
      </div>
    );
  }

  // Complex field (introspection questions) - beautiful hierarchy
  return (
    <div className="max-w-2xl mx-auto">
      {/* Question container with subtle glass effect */}
      <div className="relative rounded-2xl border border-border/30 bg-muted/10 backdrop-blur-sm overflow-hidden">
        {/* Question number badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            {questionNumber}/{totalQuestions}
          </span>
        </div>
        
        <div className="p-6 sm:p-8 pt-14 sm:pt-12 space-y-5">
          {/* Title - large and prominent */}
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {parsed.title}
            {field.is_required && <span className="text-destructive/60 text-base"> *</span>}
          </h2>
          
          {/* Content sections */}
          <div className="space-y-4">
            {parsed.sections.map((section, idx) => {
              if (section.type === 'divider') {
                return (
                  <div key={idx} className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    <Sparkles className="h-4 w-4 text-primary/40" />
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                );
              }
              
              if (section.type === 'prompt') {
                return (
                  <div key={idx} className="text-lg sm:text-xl font-medium text-foreground/90 leading-relaxed">
                    {section.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                );
              }
              
              // Regular text - context/instructions
              return (
                <div key={idx} className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {section.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-3' : ''}>{line}</p>
                  ))}
                </div>
              );
            })}
          </div>
          
          {/* Input area */}
          <div className="pt-4">
            {renderInput()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormView;
