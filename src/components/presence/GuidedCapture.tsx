import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RotateCcw, ChevronRight, Upload, Loader2, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import guideFaceFront from "@/assets/guide-face-front.png";
import guideFaceProfile from "@/assets/guide-face-profile.png";
import guideBodyFront from "@/assets/guide-body-front.png";
import guideBodySide from "@/assets/guide-body-side.png";

const GUIDE_IMAGES: Record<string, string> = {
  face_front: guideFaceFront,
  face_profile: guideFaceProfile,
  body_front: guideBodyFront,
  body_side: guideBodySide,
};

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
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const canProceed = !!images[current.key];
  const allComplete = STEPS.every((s) => images[s.key]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1440 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      toast.error("Could not access camera. Please allow camera permissions or upload a photo instead.");
      setCameraActive(false);
    }
  }, [facingMode, stopCamera]);

  // Start camera when component mounts or step changes (if no preview yet)
  useEffect(() => {
    if (!previews[STEPS[step].key]) {
      startCamera();
    }
    return () => stopCamera();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCamera = () => {
    setFacingMode((m) => (m === "user" ? "environment" : "user"));
    // Restart with new facing after state updates
    setTimeout(() => startCamera(), 100);
  };

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !user) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPreviews((p) => ({ ...p, [current.key]: dataUrl }));
    stopCamera();

    // Upload
    setUploading(true);
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${user.id}/${Date.now()}_${current.key}.jpg`;
    const { error } = await supabase.storage.from("presence-scans").upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) {
      toast.error("Upload failed. Please try again.");
      setPreviews((p) => { const n = { ...p }; delete n[current.key]; return n; });
      startCamera();
    } else {
      setImages((p) => ({ ...p, [current.key]: path }));
    }
    setUploading(false);
  }, [current.key, user, stopCamera, startCamera]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    stopCamera();
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
    if (path) supabase.storage.from("presence-scans").remove([path]);
    setImages((p) => { const n = { ...p }; delete n[current.key]; return n; });
    setPreviews((p) => { const n = { ...p }; delete n[current.key]; return n; });
    startCamera();
  };

  const handleNext = () => {
    if (isLastStep) {
      stopCamera();
      onComplete(images);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
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

      {/* Viewfinder / Preview */}
      <div className="relative aspect-[3/4] max-h-[45vh] rounded-2xl border-2 border-border bg-black overflow-hidden">
        {previews[current.key] ? (
          <img src={previews[current.key]} alt={current.label} className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
          />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        {/* Flip camera button */}
        {cameraActive && !previews[current.key] && (
          <button
            onClick={toggleCamera}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
          <>
            {/* Capture button */}
            <Button
              onClick={capturePhoto}
              disabled={!cameraActive || uploading}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" /> Capture
            </Button>
            {/* Fallback upload */}
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="shrink-0"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={() => { stopCamera(); onCancel(); }} className="w-full text-muted-foreground">
        Cancel Scan
      </Button>
    </div>
  );
}
