import { useState } from "react";
import { PageShell } from "@/components/aurora-ui/PageShell";
import { usePresenceScans } from "@/hooks/usePresenceScans";
import PrivacyConsent from "@/components/presence/PrivacyConsent";
import GuidedCapture from "@/components/presence/GuidedCapture";
import PresenceResults from "@/components/presence/PresenceResults";
import { Eye, Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Phase = "consent" | "capture" | "analyzing" | "results";

export default function PresencePage() {
  const navigate = useNavigate();
  const { scans, latestScan, isLoading, analyze, isAnalyzing } = usePresenceScans();
  const [phase, setPhase] = useState<Phase>(() => (latestScan ? "results" : "consent"));

  // Sync phase when data loads
  if (!isLoading && latestScan && phase === "consent") {
    // User already has scans, show results
    setPhase("results");
  }

  const handleCaptureDone = async (images: Record<string, string>) => {
    setPhase("analyzing");
    try {
      await analyze(images);
      setPhase("results");
      toast.success("Scan analysis complete.");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed.");
      setPhase("capture");
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/life")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl font-bold text-foreground">Presence</h1>
          </div>
        </div>

        {phase === "consent" && <PrivacyConsent onConsent={() => setPhase("capture")} />}

        {phase === "capture" && (
          <GuidedCapture
            onComplete={handleCaptureDone}
            onCancel={() => setPhase(latestScan ? "results" : "consent")}
          />
        )}

        {phase === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-foreground font-medium">Analyzing structural metrics...</p>
            <p className="text-sm text-muted-foreground">This may take 15–30 seconds.</p>
          </div>
        )}

        {phase === "results" && latestScan && (
          <>
            <PresenceResults scan={latestScan} previousScan={scans[1] ?? null} />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPhase("consent")}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> New Scan
            </Button>
          </>
        )}
      </div>
    </PageShell>
  );
}
