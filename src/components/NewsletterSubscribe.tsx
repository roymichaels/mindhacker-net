import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewsletterSubscribeProps {
  variant?: "inline" | "card";
  source?: string;
  className?: string;
  onSuccess?: () => void;
}

const NewsletterSubscribe = ({ 
  variant = "inline",
  source = "footer",
  className,
  onSuccess
}: NewsletterSubscribeProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t, isRTL } = useTranslation();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: t('validation.fillField'),
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: t('validation.invalidEmail'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          source,
          language,
          status: "active"
        }, { onConflict: "email" });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: isRTL ? "נרשמת בהצלחה!" : "Successfully subscribed!",
        description: isRTL ? "תודה שהצטרפת לניוזלטר" : "Thanks for joining our newsletter",
      });

      onSuccess?.();

      // Reset after delay
      setTimeout(() => {
        setEmail("");
        setName("");
        setIsSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: t('leadForm.error'),
        description: t('leadForm.somethingWrong'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-4 text-center justify-center animate-fade-in",
        className
      )}>
        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
        <span className="text-green-400 font-medium">
          {isRTL ? "נרשמת בהצלחה!" : "You're in!"}
        </span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "glass-panel p-6 rounded-xl",
        className
      )}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              {isRTL ? "הצטרפ/י לניוזלטר" : "Join the Newsletter"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRTL ? "תובנות שבועיות על תודעה ושינוי" : "Weekly insights on consciousness and change"}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder={isRTL ? "השם שלך (אופציונלי)" : "Your name (optional)"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background/50"
            disabled={isSubmitting}
          />
          <Input
            type="email"
            placeholder={isRTL ? "האימייל שלך" : "Your email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background/50"
            required
            disabled={isSubmitting}
            dir="ltr"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Mail className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                {isRTL ? "הרשמה" : "Subscribe"}
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Inline variant
  return (
    <form onSubmit={handleSubmit} className={cn(
      "flex gap-2 w-full max-w-md",
      className
    )}>
      <Input
        type="email"
        placeholder={isRTL ? "האימייל שלך" : "Your email"}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-background/50"
        required
        disabled={isSubmitting}
        dir="ltr"
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        size="default"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          isRTL ? "הרשמה" : "Subscribe"
        )}
      </Button>
    </form>
  );
};

export default NewsletterSubscribe;
