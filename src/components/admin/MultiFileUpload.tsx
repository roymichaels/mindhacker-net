import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MultiFileUploadProps {
  bucket: "content-resources";
  accept?: string;
  label: string;
  value?: string[];
  onChange: (urls: string[]) => void;
  maxSizeMB?: number;
}

export const MultiFileUpload = ({
  bucket,
  accept,
  label,
  value = [],
  onChange,
  maxSizeMB = 50,
}: MultiFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          toast({
            title: "קובץ גדול מדי",
            description: `${file.name} גדול מ-${maxSizeMB}MB`,
            variant: "destructive",
          });
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload file
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        uploadedUrls.push(filePath);
      }

      onChange([...value, ...uploadedUrls]);

      toast({
        title: "הקבצים הועלו בהצלחה",
        description: `${uploadedUrls.length} קבצים הועלו`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "שגיאה בהעלאת קבצים",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemove = async (fileUrl: string) => {
    try {
      // Delete from storage
      const { error } = await supabase.storage.from(bucket).remove([fileUrl]);

      if (error) throw error;

      onChange(value.filter((url) => url !== fileUrl));

      toast({
        title: "הקובץ נמחק בהצלחה",
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "שגיאה במחיקת הקובץ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((fileUrl, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border"
            >
              <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-foreground truncate flex-1">
                {fileUrl.split("/").pop()}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(fileUrl)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          multiple
          className="hidden"
          id={`multi-file-upload-${bucket}-${label}`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            document
              .getElementById(`multi-file-upload-${bucket}-${label}`)
              ?.click()
          }
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              מעלה קבצים...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              הוסף קבצי משאבים
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        גודל מקסימלי לקובץ: {maxSizeMB}MB. ניתן להעלות מספר קבצים בבת אחת.
      </p>
    </div>
  );
};
