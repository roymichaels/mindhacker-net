import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  description?: string;
  folder?: string;
  maxSizeMB?: number;
  aspectHint?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  label,
  description,
  folder = "general",
  maxSizeMB = 5,
  aspectHint,
}: ImageUploadProps) => {
  const { language } = useLanguage();
  const isRTL = language === "he";
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(isRTL ? "יש לבחור קובץ תמונה" : "Please select an image file");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(
        isRTL
          ? `גודל הקובץ חייב להיות קטן מ-${maxSizeMB}MB`
          : `File size must be less than ${maxSizeMB}MB`
      );
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("site-images")
        .getPublicUrl(fileName);

      onChange(urlData.publicUrl);
      toast.success(isRTL ? "התמונה הועלתה בהצלחה" : "Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(isRTL ? "שגיאה בהעלאת התמונה" : "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = async () => {
    if (value) {
      try {
        // Extract file path from URL
        const url = new URL(value);
        const pathParts = url.pathname.split("/site-images/");
        if (pathParts[1]) {
          await supabase.storage.from("site-images").remove([pathParts[1]]);
        }
      } catch (error) {
        console.error("Error removing file:", error);
      }
    }
    onChange("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {value ? (
        <div className="relative group rounded-lg border border-border overflow-hidden bg-card">
          <img
            src={value}
            alt={label}
            className="w-full h-40 object-contain bg-muted/30"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  {isRTL ? "החלף" : "Replace"}
                </>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-1" />
              {isRTL ? "הסר" : "Remove"}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {isRTL ? "מעלה..." : "Uploading..."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isRTL
                  ? "גרור תמונה לכאן או לחץ לבחירה"
                  : "Drag image here or click to select"}
              </p>
              {aspectHint && (
                <p className="text-xs text-muted-foreground/70">
                  {isRTL ? `יחס מומלץ: ${aspectHint}` : `Recommended: ${aspectHint}`}
                </p>
              )}
              <p className="text-xs text-muted-foreground/70">
                {isRTL ? `מקסימום ${maxSizeMB}MB` : `Max ${maxSizeMB}MB`}
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
