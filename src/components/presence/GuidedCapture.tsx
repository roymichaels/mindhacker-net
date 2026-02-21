import { useState, useRef } from "react";
import { Camera, RotateCcw, ChevronRight, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const STEPS = [
  { key: "face_front", label: "Face — Front", instruction: "Neutral expression, good lighting, looking straight at camera" },
  { key: "face_profile", label: "Face — Profile", instruction: "Turn head to show left or right side" },
  { key: "body_front", label: "Body — Front", instruction: "Clothed, neutral stance, arms at sides" },
  { key: "body_side", label: "Body — Side", instruction: "Clothed, neutral stance, standing sideways" },
];

interface GuidedCaptureProps {
  onComplete: (images: Record<string, string>) => void;
  onCancel: () => void;
}

export default function GuidedCapture({ onComplete, onCancel }: GuidedCaptureProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const canProceed = !!images[current.key];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const url = URL.createObjectURL(file);
    setPreviews((p) => ({ ...p, [current.key]: url }));

    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${Date.now()}_${current.key}.${ext}`;

    const { error } = await supabase.storage.from("presence-scans").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      toast.error("Upload failed. Please try again.");
      setPreviews((p) => { const n = { ...p }; delete n[current.key]; return n; });
    } else {
      setImages((p) => ({ ...p, [current.key]: path }));
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRetake = () => {
    const path = images[current.key];
    if (path) {
      supabase.storage.from("presence-scans").remove([path]);
    }
    setImages((p) => { const n = { ...p }; delete n[current.key]; return n; });
    setPreviews((p) => { const n = { ...p }; delete n[current.key]; return n; });
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete(images);
    } else {
      setStep((s) => s + 1);
    }
  };

  const allComplete = STEPS.every((s) => images[s.key]);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Step {step + 1} of {STEPS.length}
        </p>
        <h3 className="text-xl font-bold text-foreground">{current.label}</h3>
        <p className="text-sm text-muted-foreground">{current.instruction}</p>
      </div>

      {/* Image area */}
      <div
        className="relative aspect-[3/4] max-h-[50vh] rounded-2xl border-2 border-dashed border-border bg-muted/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => !uploading && !previews[current.key] && inputRef.current?.click()}
      >
        {previews[current.key] ? (
          <img
            src={previews[current.key]}
            alt={current.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center space-y-3 p-6 pointer-events-none">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Tap to capture or upload</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Actions */}
      <div className="flex gap-2">
        {previews[current.key] ? (
          <>
            <Button variant="outline" onClick={handleRetake} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" /> Retake
            </Button>
            <Button onClick={handleNext} disabled={!canProceed} className="flex-1">
              {isLastStep && allComplete ? "Analyze" : "Next"} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        ) : (
          <Button onClick={() => inputRef.current?.click()} disabled={uploading} className="flex-1">
            <Upload className="w-4 h-4 mr-2" /> Upload Photo
          </Button>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={onCancel} className="w-full text-muted-foreground">
        Cancel Scan
      </Button>
    </div>
  );
}
