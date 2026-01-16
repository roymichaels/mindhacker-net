import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Phone, User, Mail, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { debug } from "@/lib/debug";
import { trackFormView, trackFormStart, trackFormSubmit } from "@/hooks/useAnalytics";
import { getStoredAffiliateCode } from "@/components/AffiliateTracker";

interface LeadCaptureFormProps {
  source: string;
  variant?: "compact" | "full";
  onSuccess?: () => void;
  className?: string;
  showPreferredTime?: boolean;
}

// Minimum time in ms a human would take to fill the form (3 seconds)
const MIN_FORM_TIME_MS = 3000;

const LeadCaptureForm = ({ 
  source, 
  variant = "full", 
  onSuccess,
  className,
  showPreferredTime = false
}: LeadCaptureFormProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t, isRTL } = useTranslation();
  
  // Honeypot field - bots will fill this, humans won't see it
  const [honeypot, setHoneypot] = useState("");
  
  // Track when form was rendered to detect too-fast submissions
  const formLoadTime = useRef<number>(Date.now());
  const hasStartedFilling = useRef(false);
  
  useEffect(() => {
    formLoadTime.current = Date.now();
    // Track form view when component mounts
    trackFormView(source);
  }, [source]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Anti-spam check 1: Honeypot field should be empty
    if (honeypot) {
      // Silently reject - don't tell the bot it failed
      debug.log("Spam detected: honeypot filled");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      return;
    }
    
    // Anti-spam check 2: Form submitted too quickly
    const timeTaken = Date.now() - formLoadTime.current;
    if (timeTaken < MIN_FORM_TIME_MS) {
      debug.log("Spam detected: form submitted too quickly", timeTaken);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      return;
    }
    
    if (!name.trim() || !phone.trim()) {
      toast({
        title: t('leadForm.error'),
        description: t('leadForm.fillNamePhone'),
        variant: "destructive",
      });
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[\d\-+() ]{9,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast({
        title: t('leadForm.invalidPhone'),
        description: t('leadForm.enterValidPhone'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get affiliate code if exists
      const affiliateCode = getStoredAffiliateCode();
      
      // Call Edge Function with rate limiting
      const { data, error } = await supabase.functions.invoke('submit-lead', {
        body: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          preferred_time: preferredTime.trim() || null,
          source,
          honeypot, // Send honeypot for server-side check
          form_load_time: formLoadTime.current, // Send timing for server-side check
          affiliate_code: affiliateCode, // Send affiliate code if exists
        },
      });

      if (error) throw error;
      
      if (data?.error) {
        throw new Error(data.error);
      }

      setIsSuccess(true);
      trackFormSubmit(source, true, { email: !!email.trim() });
      toast({
        title: t('leadForm.successSent'),
        description: t('leadForm.willCallBack'),
      });

      onSuccess?.();

      // Reset after delay
      setTimeout(() => {
        setName("");
        setPhone("");
        setEmail("");
        setPreferredTime("");
        setIsSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error submitting lead:", error);
      trackFormSubmit(source, false);
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
        "flex flex-col items-center justify-center gap-4 p-6 text-center animate-fade-in",
        className
      )}>
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">{t('leadForm.successTitle')}</h3>
          <p className="text-muted-foreground">{t('leadForm.successMessage')}</p>
        </div>
      </div>
    );
  }

  const isCompact = variant === "compact";
  const iconPosition = isRTL ? "right-3" : "left-3";
  const inputPadding = isRTL ? "pr-10" : "pl-10";

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {/* Honeypot field - hidden from humans, bots will fill it */}
      <div 
        aria-hidden="true" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: '-9999px',
          opacity: 0,
          pointerEvents: 'none'
        }}
      >
        <label htmlFor="website-url">Website</label>
        <input
          type="text"
          id="website-url"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      
      <div className={cn(isCompact ? "space-y-3" : "space-y-4")}>
        {/* Name */}
        <div className="space-y-1.5">
          {!isCompact && <Label htmlFor="lead-name">{t('leadForm.fullName')}</Label>}
          <div className="relative">
            <User className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
            <Input
              id="lead-name"
              type="text"
              placeholder={t('leadForm.yourName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => {
                if (!hasStartedFilling.current) {
                  hasStartedFilling.current = true;
                  trackFormStart(source);
                }
              }}
              className={`${inputPadding} bg-background/50 border-border/50 focus:border-primary`}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          {!isCompact && <Label htmlFor="lead-phone">{t('leadForm.phone')}</Label>}
          <div className="relative">
            <Phone className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
            <Input
              id="lead-phone"
              type="tel"
              placeholder="050-0000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${inputPadding} bg-background/50 border-border/50 focus:border-primary`}
              required
              disabled={isSubmitting}
              dir="ltr"
            />
          </div>
        </div>

        {/* Email - optional */}
        {!isCompact && (
          <div className="space-y-1.5">
            <Label htmlFor="lead-email">{t('leadForm.emailOptional')}</Label>
            <div className="relative">
              <Mail className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                id="lead-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputPadding} bg-background/50 border-border/50 focus:border-primary`}
                disabled={isSubmitting}
                dir="ltr"
              />
            </div>
          </div>
        )}

        {/* Preferred Time - optional */}
        {showPreferredTime && (
          <div className="space-y-1.5">
            <Label htmlFor="lead-time">{t('leadForm.preferredTime')}</Label>
            <div className="relative">
              <Clock className={`absolute ${iconPosition} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                id="lead-time"
                type="text"
                placeholder={t('leadForm.preferredTimePlaceholder')}
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className={`${inputPadding} bg-background/50 border-border/50 focus:border-primary`}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full font-bold transition-all duration-300",
          isCompact ? "h-11" : "h-12 text-lg"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('leadForm.sending')}
          </>
        ) : (
          <>
            <Phone className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('leadForm.submitButton')}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        {t('leadForm.footerNote')}
      </p>
    </form>
  );
};

export default LeadCaptureForm;