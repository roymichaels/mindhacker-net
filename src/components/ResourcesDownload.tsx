import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileIcon, Loader2 } from "lucide-react";
import { getSignedUrl } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface ResourcesDownloadProps {
  resources: string[];
  bucket?: string;
  title?: string;
  description?: string;
}

export const ResourcesDownload = ({
  resources,
  bucket = "content-resources",
  title = "משאבים להורדה",
  description = "קבצים נוספים לפרק זה",
}: ResourcesDownloadProps) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  if (!resources || resources.length === 0) {
    return null;
  }

  const handleDownload = async (resourcePath: string) => {
    setDownloading(resourcePath);

    try {
      // Get signed URL
      const signedUrl = await getSignedUrl(bucket, resourcePath, 60); // 60 seconds

      if (!signedUrl) {
        throw new Error("לא ניתן ליצור קישור להורדה");
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
        title: "הקובץ הורד בהצלחה",
      });
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "שגיאה בהורדת הקובץ",
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
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {resources.map((resource, index) => {
          const fileName = resource.split("/").pop() || `קובץ ${index + 1}`;
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
                    מוריד...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    הורד
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
