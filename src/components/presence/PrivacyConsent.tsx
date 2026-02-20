import { useState } from "react";
import { Shield, Lock, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface PrivacyConsentProps {
  onConsent: () => void;
}

export default function PrivacyConsent({ onConsent }: PrivacyConsentProps) {
  const [agreed, setAgreed] = useState(false);

  const points = [
    { icon: Lock, text: "Images are stored in a private, encrypted bucket accessible only to you." },
    { icon: Eye, text: "No public comparison, no ranking, no population percentiles." },
    { icon: Trash2, text: "You can delete all scan data at any time." },
    { icon: Shield, text: "AI extracts structural metrics only. Raw images are never shared." },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Shield className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Private Structural Assessment</h2>
        <p className="text-muted-foreground text-sm">
          Your images are used exclusively to extract structural metrics for your personal diagnostic. Nothing leaves your private space.
        </p>
      </div>

      <div className="space-y-3">
        {points.map((p, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <p.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-foreground">{p.text}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
        <Checkbox
          id="consent"
          checked={agreed}
          onCheckedChange={(v) => setAgreed(v === true)}
        />
        <label htmlFor="consent" className="text-sm text-foreground cursor-pointer leading-snug">
          I understand that my images will be analyzed by AI to extract structural metrics. I can delete my data at any time.
        </label>
      </div>

      <Button
        onClick={onConsent}
        disabled={!agreed}
        className="w-full"
        size="lg"
      >
        Begin Scan
      </Button>
    </div>
  );
}
