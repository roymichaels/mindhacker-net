import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RotateCcw, ChevronRight, ChevronLeft, Upload, Loader2, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

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

const STEP_KEYS = [
  { key: "face_front", labelKey: "presence.faceFront", instructKey: "presence.instructFaceFront" },
  { key: "face_profile", labelKey: "presence.faceProfile", instructKey: "presence.instructFaceProfile" },
  { key: "body_front", labelKey: "presence.bodyFront", instructKey: "presence.instructBodyFront" },
  { key: "body_side", labelKey: "presence.bodySide", instructKey: "presence.instructBodySide" },
];

interface GuidedCaptureProps {
  onComplete: (images: Record<string, string>) => void;
  onCancel: () => void;
}

const STORAGE_KEY_IMAGES = 'guided_capture_images';
const STORAGE_KEY_PREVIEWS = 'guided_capture_previews';
const STORAGE_KEY_STEP = 'guided_capture_step';

function loadPersistedState() {
  try {
    const imgs = JSON.parse(sessionStorage.getItem(STORAGE_KEY_IMAGES) || '{}');
    const prvs = JSON.parse(sessionStorage.getItem(STORAGE_KEY_PREVIEWS) || '{}');
    const stp = parseInt(sessionStorage.getItem(STORAGE_KEY_STEP) || '0', 10);
    return { imgs, prvs, stp: isNaN(stp) ? 0 : stp };
  } catch {
    return { imgs: {}, prvs: {}, stp: 0 };
  }
}

export default function GuidedCapture({ onComplete, onCancel }: GuidedCaptureProps) {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const persisted = useRef(loadPersistedState());
  const [step, setStep] = useState(persisted.current.stp);
  const [images, setImages] = useState<Record<string, string>>(persisted.current.imgs);
  const [previews, setPreviews] = useState<Record<string, string>>(persisted.current.prvs);
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist state to sessionStorage on changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(images));
  }, [images]);
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_PREVIEWS, JSON.stringify(previews));
  }, [previews]);
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_STEP, String(step));
  }, [step]);

  const current = STEP_KEYS[step];
  const isLastStep = step === STEP_KEYS.length - 1;
  const canProceed = !!images[current.key];
  const allComplete = STEP_KEYS.every((s) => images[s.key]);

  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

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
      toast.error(t('presence.cameraError'));
      setCameraActive(false);
    }
  }, [facingMode, stopCamera, t]);

  // Start camera when component mounts or step changes (if no preview yet)
  useEffect(() => {
    if (!previews[STEP_KEYS[step].key]) {
      startCamera();
    }
    return () => stopCamera();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCamera = () => {
    setFacingMode((m) => (m === "user" ? "environment" : "user"));
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

    setUploading(true);
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${user.id}/${Date.now()}_${current.key}.jpg`;
    const { error } = await supabase.storage.from("presence-scans").upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) {
      toast.error(t('presence.uploadFailed'));
      setPreviews((p) => { const n = { ...p }; delete n[current.key]; return n; });
      startCamera();
    } else {
      setImages((p) => ({ ...p, [current.key]: path }));
    }
    setUploading(false);
  }, [current.key, user, stopCamera, startCamera, t]);

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
      toast.error(t('presence.uploadFailed'));
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
      sessionStorage.removeItem(STORAGE_KEY_IMAGES);
      sessionStorage.removeItem(STORAGE_KEY_PREVIEWS);
      sessionStorage.removeItem(STORAGE_KEY_STEP);
      onComplete(images);
    } else {
      setStep((s) => s + 1);
    }
  };

  const stepLabel = t('presence.stepOf')
    .replace('{current}', String(step + 1))
    .replace('{total}', String(STEP_KEYS.length));

  return (
    <div className="max-w-lg mx-auto space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress */}
      <div className="flex items-center gap-1">
        {STEP_KEYS.map((s, i) => (
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
          {stepLabel}
        </p>
        <h3 className="text-xl font-bold text-foreground">{t(current.labelKey)}</h3>
        <p className="text-sm text-muted-foreground">{t(current.instructKey)}</p>
      </div>

      {/* Viewfinder + Guide side by side */}
      <div className="flex gap-3 items-stretch">
        {/* Camera / Preview — always first visually */}
        <div className="relative flex-1 aspect-[3/4] max-h-[45vh] rounded-2xl border-2 border-border bg-black overflow-hidden order-first">
          {previews[current.key] ? (
            <img src={previews[current.key]} alt={t(current.labelKey)} className="w-full h-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
            />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {cameraActive && !previews[current.key] && (
            <button
              onClick={toggleCamera}
              className="absolute top-3 end-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Guide image */}
        <div className="hidden sm:flex w-28 shrink-0 flex-col items-center gap-1.5 order-last">
          <img
            src={GUIDE_IMAGES[current.key]}
            alt={t(current.labelKey)}
            className="w-full rounded-xl border border-border bg-muted/30 object-contain"
          />
          <span className="text-[10px] text-muted-foreground text-center leading-tight">{t('presence.examplePose')}</span>
        </div>
      </div>

      {/* Mobile guide */}
      <div className="flex sm:hidden items-center gap-3 p-2 rounded-xl border border-border bg-muted/20">
        <img
          src={GUIDE_IMAGES[current.key]}
          alt={t(current.labelKey)}
          className="w-16 h-20 rounded-lg object-contain"
        />
        <span className="text-xs text-muted-foreground leading-tight">{t('presence.mobileGuide')}</span>
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
              <RotateCcw className="w-4 h-4 me-2" /> {t('presence.retake')}
            </Button>
            <Button onClick={handleNext} disabled={!canProceed} className="flex-1">
              {isLastStep && allComplete ? t('presence.analyze') : t('presence.next')} <NextIcon className="w-4 h-4 ms-1" />
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={capturePhoto}
              disabled={!cameraActive || uploading}
              className="flex-1"
            >
              <Camera className="w-4 h-4 me-2" /> {t('presence.capture')}
            </Button>
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
        {t('presence.cancelScan')}
      </Button>
    </div>
  );
}
