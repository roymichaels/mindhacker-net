import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  bucket: "content-videos" | "content-thumbnails" | "content-resources";
  accept?: string;
  label: string;
  value?: string;
  onChange: (url: string) => void;
  maxSizeMB?: number;
  showPreview?: boolean;
}

export const FileUpload = ({
  bucket,
  accept,
  label,
  value,
  onChange,
  maxSizeMB = 50,
  showPreview = true,
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: "קובץ גדול מדי",
        description: `גודל הקובץ צריך להיות פחות מ-${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL for thumbnails, signed URL for others
      let fileUrl: string;
      if (bucket === "content-thumbnails") {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;
      } else {
        fileUrl = filePath; // Store just the path, we'll generate signed URLs when needed
      }

      setPreview(fileUrl);
      onChange(fileUrl);

      toast({
        title: "הקובץ הועלה בהצלחה",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "שגיאה בהעלאת הקובץ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extract filename from URL if it's a public URL
      let filePath = value;
      if (value.includes("supabase.co")) {
        filePath = value.split("/").pop() || value;
      }

      // Delete from storage
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) throw error;

      setPreview(null);
      onChange("");

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

  const isImage = bucket === "content-thumbnails";
  const isVideo = bucket === "content-videos";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {preview && showPreview && (
        <div className="relative rounded-lg border border-border overflow-hidden">
          {isImage && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
          )}
          {isVideo && (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <FileIcon className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">וידאו הועלה</p>
            </div>
          )}
          {!isImage && !isVideo && (
            <div className="w-full p-4 bg-muted flex items-center gap-2">
              <FileIcon className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-foreground truncate">{preview}</p>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id={`file-upload-${bucket}-${label}`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            document.getElementById(`file-upload-${bucket}-${label}`)?.click()
          }
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              מעלה...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {preview ? "החלף קובץ" : "בחר קובץ"}
            </>
          )}
        </Button>
      </div>

      {!preview && (
        <p className="text-xs text-muted-foreground">
          גודל מקסימלי: {maxSizeMB}MB
        </p>
      )}
    </div>
  );
};
