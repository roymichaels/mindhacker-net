import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { debug } from "@/lib/debug";
import { Loader2, Upload, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingVideo?: {
    id: string;
    title: string;
    description: string | null;
    file_path: string;
    duration_seconds: number | null;
  } | null;
}

export const VideoUploadDialog = ({
  open,
  onOpenChange,
  editingVideo,
}: VideoUploadDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingVideo) {
      setTitle(editingVideo.title);
      setDescription(editingVideo.description || "");
    } else {
      setTitle("");
      setDescription("");
      setFile(null);
      setUploadProgress(0);
    }
  }, [editingVideo, open]);

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      file_path: string;
      duration_seconds: number | null;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("hypnosis_videos").insert({
        ...data,
        created_by: user.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hypnosis-videos"] });
      toast({ title: t("admin.recordingsPage.videoUploaded") });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: t("admin.recordingsPage.videoUploadError"), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      if (!editingVideo) return;
      const { error } = await supabase
        .from("hypnosis_videos")
        .update(data)
        .eq("id", editingVideo.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hypnosis-videos"] });
      toast({ title: t("admin.recordingsPage.videoUpdated") });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: t("admin.recordingsPage.videoUpdateError"), variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVideo) {
      updateMutation.mutate({ title, description });
      return;
    }

    if (!file) {
      toast({ title: t("admin.recordingsPage.selectVideoFile"), variant: "destructive" });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Simulate progress for better UX (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const { error: uploadError } = await supabase.storage
        .from("hypnosis-videos")
        .upload(fileName, file);

      clearInterval(progressInterval);
      setUploadProgress(95);

      if (uploadError) throw uploadError;

      // Get video duration
      let duration: number | null = null;
      try {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => {
            duration = Math.round(video.duration);
            resolve();
          };
          video.onerror = () => resolve();
        });
      } catch {
        debug.log("Could not get video duration");
      }

      setUploadProgress(100);
      
      createMutation.mutate({
        title,
        description,
        file_path: fileName,
        duration_seconds: duration,
      });
    } catch {
      toast({ title: t("admin.recordingsPage.videoUploadError"), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const isLoading = uploading || createMutation.isPending || updateMutation.isPending;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {editingVideo ? "עריכת סרטון" : "העלאת סרטון חדש"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">כותרת</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="סרטון אימון תודעתי מותאם אישית"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור (אופציונלי)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור קצר של הסרטון..."
              rows={3}
            />
          </div>

          {!editingVideo && (
            <div className="space-y-2">
              <Label htmlFor="file">קובץ וידאו</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="file"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  {file ? (
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      לחץ לבחירת קובץ או גרור לכאן
                    </p>
                  )}
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                פורמטים נתמכים: MP4, MOV, WebM, AVI
              </p>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>מעלה...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              {editingVideo ? "שמור שינויים" : "העלה סרטון"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
