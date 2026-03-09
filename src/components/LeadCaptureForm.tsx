import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LeadCaptureFormProps {
  source: string;
  variant?: "full" | "inline";
  showPreferredTime?: boolean;
  onSuccess?: () => void;
}

const LeadCaptureForm = ({ source, variant = "full", showPreferredTime, onSuccess }: LeadCaptureFormProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("consciousness_leap_leads").insert({
        name: name.trim(),
        email: email.trim(),
        what_resonated: phone || null,
        status: "new",
      });
      if (error) throw error;
      toast.success(t("leadCapture.success") || "Thank you!");
      onSuccess?.();
    } catch {
      toast.error(t("leadCapture.error") || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("leadCapture.name") || "Name"}</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{t("leadCapture.email") || "Email"}</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">{t("leadCapture.phone") || "Phone"}</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {t("leadCapture.submit") || "Submit"}
      </Button>
    </form>
  );
};

export default LeadCaptureForm;
