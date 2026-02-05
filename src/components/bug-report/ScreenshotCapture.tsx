import { Camera, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface ScreenshotCaptureProps {
  onCapture: () => void;
  onClear: () => void;
  previewUrl: string | null;
  isCapturing?: boolean;
}

export const ScreenshotCapture = ({
  onCapture,
  onClear,
  previewUrl,
  isCapturing,
}: ScreenshotCaptureProps) => {
  const { t } = useTranslation();

  if (previewUrl) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('bugReport.screenshotLabel')}
        </label>
        <div className="relative">
          <img
            src={previewUrl}
            alt="Screenshot preview"
            className="w-full h-32 object-cover rounded-lg border border-border"
          />
          <div className="absolute top-2 end-2 flex gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/90 text-white text-xs">
              <Check className="h-3 w-3" />
              {t('bugReport.screenshotCaptured')}
            </div>
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {t('bugReport.screenshotLabel')}
      </label>
      <Button
        type="button"
        variant="outline"
        onClick={onCapture}
        disabled={isCapturing}
        className={cn(
          "w-full gap-2 border-dashed",
          "hover:border-primary hover:bg-primary/5"
        )}
      >
        <Camera className="h-4 w-4" />
        {t('bugReport.captureScreenshot')}
      </Button>
    </div>
  );
};
