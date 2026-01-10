import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useSiteSettings, clearSettingsCache } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { VideoLibrary } from "@/components/admin/recordings/VideoLibrary";
import { Video, Layout, Play, Loader2, User, Gift, Brain, Rocket, Upload, Check, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VideoSetting {
  key: string;
  enabledKey: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const videoSettings: VideoSetting[] = [
  {
    key: "hero_video_url",
    enabledKey: "hero_video_enabled",
    titleKey: "admin.videosPage.heroVideo",
    descriptionKey: "admin.videosPage.heroVideoDesc",
    icon: Layout,
  },
  {
    key: "about_video_url",
    enabledKey: "about_video_enabled",
    titleKey: "admin.videosPage.aboutVideo",
    descriptionKey: "admin.videosPage.aboutVideoDesc",
    icon: User,
  },
  {
    key: "introspection_promo_video_url",
    enabledKey: "introspection_promo_video_enabled",
    titleKey: "admin.videosPage.introspectionVideo",
    descriptionKey: "admin.videosPage.introspectionVideoDesc",
    icon: Gift,
  },
  {
    key: "personal_hypnosis_promo_video_url",
    enabledKey: "personal_hypnosis_promo_video_enabled",
    titleKey: "admin.videosPage.personalHypnosisVideo",
    descriptionKey: "admin.videosPage.personalHypnosisVideoDesc",
    icon: Brain,
  },
  {
    key: "consciousness_leap_promo_video_url",
    enabledKey: "consciousness_leap_promo_video_enabled",
    titleKey: "admin.videosPage.consciousnessLeapVideo",
    descriptionKey: "admin.videosPage.consciousnessLeapVideoDesc",
    icon: Rocket,
  },
];

const STORAGE_BUCKET = "site-videos";

const VideoSettingsCard = ({ setting }: { setting: VideoSetting }) => {
  const { t, isRTL } = useTranslation();
  const { toast } = useToast();
  const { settings, loading } = useSiteSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [videoPath, setVideoPath] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize from settings when loaded
  useEffect(() => {
    if (!loading) {
      const settingsAny = settings as any;
      setVideoPath(settingsAny[setting.key] || "");
      setEnabled(settingsAny[setting.enabledKey] === true || settingsAny[setting.enabledKey] === "true");
    }
  }, [loading, settings, setting.key, setting.enabledKey]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${setting.key.replace(/_url$/, "")}-${Date.now()}.${fileExt}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90));
      }, 300);

      // Delete old file if exists
      if (videoPath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([videoPath]);
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, { upsert: true });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Save the path to settings
      await supabase
        .from("site_settings")
        .upsert(
          { setting_key: setting.key, setting_value: fileName },
          { onConflict: "setting_key" }
        );

      setVideoPath(fileName);
      clearSettingsCache();
      toast({ title: t("admin.videosPage.uploaded") || "הסרטון הועלה בהצלחה" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: t("admin.videosPage.uploadError") || "שגיאה בהעלאה", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleToggle = async (newEnabled: boolean) => {
    setEnabled(newEnabled);
    setSaving(true);
    try {
      await supabase
        .from("site_settings")
        .upsert(
          { setting_key: setting.enabledKey, setting_value: newEnabled.toString() },
          { onConflict: "setting_key" }
        );
      clearSettingsCache();
      toast({ title: t("admin.videosPage.saved") });
    } catch (error) {
      toast({ title: t("admin.videosPage.saveError"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!videoPath) return;
    
    try {
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(videoPath);
      setPreviewUrl(data.publicUrl);
      setPreviewOpen(true);
    } catch (error) {
      toast({ title: "שגיאה בטעינת הסרטון", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!videoPath) return;

    try {
      await supabase.storage.from(STORAGE_BUCKET).remove([videoPath]);
      await supabase
        .from("site_settings")
        .upsert(
          { setting_key: setting.key, setting_value: "" },
          { onConflict: "setting_key" }
        );
      
      setVideoPath("");
      clearSettingsCache();
      toast({ title: t("admin.videosPage.deleted") || "הסרטון נמחק" });
    } catch (error) {
      toast({ title: "שגיאה במחיקה", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const Icon = setting.icon;

  return (
    <>
      <Card className="glass-panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{t(setting.titleKey)}</CardTitle>
                <CardDescription className="text-sm">
                  {t(setting.descriptionKey)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor={`switch-${setting.key}`} className="text-sm text-muted-foreground">
                {enabled ? (t("common.on") || "מופעל") : (t("common.off") || "כבוי")}
              </Label>
              <Switch
                id={`switch-${setting.key}`}
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={saving}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/mov,video/webm,video/avi,.mp4,.mov,.webm,.avi"
              onChange={handleFileSelect}
              className="hidden"
              id={`file-${setting.key}`}
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="space-y-3">
                <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">{t("admin.videosPage.uploading") || "מעלה..."}</p>
                <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
            ) : videoPath ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Check className="h-6 w-6 text-green-500" />
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-green-600">{t("admin.videosPage.videoUploaded") || "סרטון הועלה"}</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs mx-auto">{videoPath}</p>
                <div className="flex gap-2 justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {t("admin.videosPage.preview")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {t("admin.videosPage.replace") || "החלף"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <label htmlFor={`file-${setting.key}`} className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t("admin.videosPage.dropOrClick") || "לחץ לבחירת קובץ או גרור לכאן"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  MP4, MOV, WebM, AVI
                </p>
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {t(setting.titleKey)}
            </DialogTitle>
            <DialogDescription>
              {t("admin.videosPage.previewDescription") || "תצוגה מקדימה של הסרטון"}
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            {previewOpen && previewUrl && (
              <video
                src={previewUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.videosPage.deleteWarning") || "האם למחוק את הסרטון? פעולה זו לא ניתנת לביטול."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? "flex-row-reverse gap-2" : "gap-2"}>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const Videos = () => {
  const { t, isRTL } = useTranslation();
  const [activeTab, setActiveTab] = useState("site-videos");

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-3xl font-bold cyber-glow flex items-center gap-3">
          <Video className="h-8 w-8" />
          {t("admin.videosPage.title")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("admin.videosPage.subtitle")}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir={isRTL ? "rtl" : "ltr"}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="site-videos" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            {t("admin.videosPage.siteVideosTab")}
          </TabsTrigger>
          <TabsTrigger value="video-library" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            {t("admin.videosPage.videoLibraryTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site-videos" className="mt-6">
          <div className="grid gap-4">
            {videoSettings.map((setting) => (
              <VideoSettingsCard key={setting.key} setting={setting} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="video-library" className="mt-6">
          <VideoLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Videos;
