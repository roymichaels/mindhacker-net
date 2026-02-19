import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2, CheckCircle2 } from "lucide-react";

interface LeadCaptureFormProps {
  source: string;
  variant?: "inline" | "full";
  showPreferredTime?: boolean;
  onSuccess?: () => void;
}

const LeadCaptureForm = ({
  source,
  variant = "inline",
  showPreferredTime = false,
  onSuccess,
}: LeadCaptureFormProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("leads").insert({
        name,
        phone,
        email: email || null,
        source,
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: t('leadCapture.successTitle'),
        description: t('leadCapture.successDescription'),
      });
      onSuccess?.();
    } catch (err) {
      toast({
        title: t('leadCapture.errorTitle'),
        description: t('leadCapture.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
        <p className="font-medium">{t('leadCapture.thankYou')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>{t('leadCapture.name')}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>{t('leadCapture.phone')}</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" />
      </div>
      {variant === "full" && (
        <div>
          <Label>{t('leadCapture.email')}</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {t('leadCapture.submit')}
      </Button>
    </form>
  );
};

export default LeadCaptureForm;
