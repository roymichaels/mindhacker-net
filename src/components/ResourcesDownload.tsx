import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileIcon, Loader2 } from "lucide-react";
import { getSignedUrl } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { debug } from "@/lib/debug";

interface ResourcesDownloadProps {
  resources: string[];
  bucket?: string;
  title?: string;
  description?: string;
}

export const ResourcesDownload = ({
  resources,
  bucket = "content-resources",
  title,
  description,
}: ResourcesDownloadProps) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const displayTitle = title || t("resources.downloadTitle");
  const displayDescription = description || t("resources.downloadDescription");

  if (!resources || resources.length === 0) {
    return null;
  }

  const handleDownload = async (resourcePath: string) => {
    setDownloading(resourcePath);

    try {
      // Get signed URL
      const signedUrl = await getSignedUrl(bucket, resourcePath, 60); // 60 seconds

      if (!signedUrl) {
        throw new Error(t("resources.downloadLinkError"));
      }

      // Download file
      const fileName = resourcePath.split("/").pop() || "download";
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: t("resources.downloadSuccess"),
      });
    } catch (error: any) {
      debug.error("Download error:", error);
      toast({
        title: t("resources.downloadError"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileIcon className="w-5 h-5" />
          {displayTitle}
        </CardTitle>
        <CardDescription>{displayDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {resources.map((resource, index) => {
          const fileName = resource.split("/").pop() || `${t("resources.file")} ${index + 1}`;
          const isDownloading = downloading === resource;

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">{fileName}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(resource)}
                disabled={isDownloading}
              >
              {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("resources.downloading")}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    {t("resources.download")}
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
