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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Check, Loader2, Star, Sparkles, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string | null;
  is_required: boolean;
  options: string[];
  order_index: number;
}

interface Form {
  id: string;
  title: string;
  description: string | null;
  settings: {
    thank_you_message?: string;
    show_progress?: boolean;
  } | null;
  status: string;
}

type PostSubmitAction = "none" | "consciousness-leap" | "personal-hypnosis" | "finish";

const FormView = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [postSubmitAction, setPostSubmitAction] = useState<PostSubmitAction>("none");
  const { t, isRTL } = useTranslation();

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
  });

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
      if (e.key === "Enter" && !e.shiftKey && currentField?.type !== "textarea") {
        e.preventDefault();
        handleNext();
      }
    },
    [handleNext, currentField?.type]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (formLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (formError || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="glass-panel p-8 text-center max-w-md">
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

  if (isSubmitted) {
    if (postSubmitAction === "none") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="glass-panel p-8 text-center max-w-2xl animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {form.settings?.thank_you_message || t('formComplete.submitted')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('formComplete.whatNext')}
            </p>

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="glass-panel p-8 text-center max-w-md animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {t('formComplete.thankYou')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('formComplete.weWillContact')}
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            {t('formComplete.returnHome')}
          </Button>
        </div>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="glass-panel p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
          <p className="text-muted-foreground">{t('forms.empty')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5" dir={isRTL ? 'rtl' : 'ltr'}>
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

interface FieldRendererProps {
  field: FormField;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  isRTL: boolean;
}

const FieldRenderer = ({ field, value, onChange, isRTL }: FieldRendererProps) => {
  const renderField = () => {
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
            className="text-lg py-6 text-center bg-background/50"
            autoFocus
          />
        );

      case "textarea":
        return (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className="text-lg min-h-[150px] bg-background/50"
            autoFocus
          />
        );

      case "select":
        return (
          <Select value={(value as string) || ""} onValueChange={onChange}>
            <SelectTrigger className="text-lg py-6 bg-background/50">
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
                  "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                  value === option
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-background/50"
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
                  "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                  selectedValues.includes(option)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-background/50"
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
          <div className="flex justify-center gap-2">
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
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
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
            className="text-lg py-6 text-center bg-background/50"
            autoFocus
          />
        );

      default:
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className="text-lg py-6 text-center bg-background/50"
            autoFocus
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <Label className="text-xl sm:text-2xl font-medium block text-center">
        {field.label}
        {field.is_required && <span className="text-destructive"> *</span>}
      </Label>
      {renderField()}
    </div>
  );
};

export default FormView;