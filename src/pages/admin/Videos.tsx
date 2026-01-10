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
  keyEn: string;
  enabledKey: string;
  enabledKeyEn: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const videoSettings: VideoSetting[] = [
  {
    key: "hero_video_url",
    keyEn: "hero_video_url_en",
    enabledKey: "hero_video_enabled",
    enabledKeyEn: "hero_video_enabled_en",
    titleKey: "admin.videosPage.heroVideo",
    descriptionKey: "admin.videosPage.heroVideoDesc",
    icon: Layout,
  },
  {
    key: "about_video_url",
    keyEn: "about_video_url_en",
    enabledKey: "about_video_enabled",
    enabledKeyEn: "about_video_enabled_en",
    titleKey: "admin.videosPage.aboutVideo",
    descriptionKey: "admin.videosPage.aboutVideoDesc",
    icon: User,
  },
  {
    key: "introspection_promo_video_url",
    keyEn: "introspection_promo_video_url_en",
    enabledKey: "introspection_promo_video_enabled",
    enabledKeyEn: "introspection_promo_video_enabled_en",
    titleKey: "admin.videosPage.introspectionVideo",
    descriptionKey: "admin.videosPage.introspectionVideoDesc",
    icon: Gift,
  },
  {
    key: "personal_hypnosis_promo_video_url",
    keyEn: "personal_hypnosis_promo_video_url_en",
    enabledKey: "personal_hypnosis_promo_video_enabled",
    enabledKeyEn: "personal_hypnosis_promo_video_enabled_en",
    titleKey: "admin.videosPage.personalHypnosisVideo",
    descriptionKey: "admin.videosPage.personalHypnosisVideoDesc",
    icon: Brain,
  },
  {
    key: "consciousness_leap_promo_video_url",
    keyEn: "consciousness_leap_promo_video_url_en",
    enabledKey: "consciousness_leap_promo_video_enabled",
    enabledKeyEn: "consciousness_leap_promo_video_enabled_en",
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
  const [activeLanguage, setActiveLanguage] = useState<'he' | 'en'>('he');
  
  // Hebrew video state
  const fileInputRefHe = useRef<HTMLInputElement>(null);
  const [videoPathHe, setVideoPathHe] = useState("");
  const [enabledHe, setEnabledHe] = useState(false);
  
  // English video state
  const fileInputRefEn = useRef<HTMLInputElement>(null);
  const [videoPathEn, setVideoPathEn] = useState("");
  const [enabledEn, setEnabledEn] = useState(false);
  
  // Shared state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLanguage, setDeleteLanguage] = useState<'he' | 'en'>('he');
  const [saving, setSaving] = useState(false);

  // Initialize from settings when loaded
  useEffect(() => {
    if (!loading) {
      const settingsAny = settings as any;
      setVideoPathHe(settingsAny[setting.key] || "");
      setEnabledHe(settingsAny[setting.enabledKey] === true || settingsAny[setting.enabledKey] === "true");
      setVideoPathEn(settingsAny[setting.keyEn] || "");
      setEnabledEn(settingsAny[setting.enabledKeyEn] === true || settingsAny[setting.enabledKeyEn] === "true");
    }
  }, [loading, settings, setting]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, language: 'he' | 'en') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const urlKey = language === 'he' ? setting.key : setting.keyEn;
    const currentPath = language === 'he' ? videoPathHe : videoPathEn;

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${urlKey.replace(/_url$/, "").replace(/_en$/, "")}-${language}-${Date.now()}.${fileExt}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90));
      }, 300);

      // Delete old file if exists
      if (currentPath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([currentPath]);
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
          { setting_key: urlKey, setting_value: fileName },
          { onConflict: "setting_key" }
        );

      if (language === 'he') {
        setVideoPathHe(fileName);
      } else {
        setVideoPathEn(fileName);
      }
      
      clearSettingsCache();
      toast({ title: t("admin.videosPage.uploaded") || "הסרטון הועלה בהצלחה" });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: t("admin.videosPage.uploadError") || "שגיאה בהעלאה", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (language === 'he' && fileInputRefHe.current) {
        fileInputRefHe.current.value = "";
      } else if (language === 'en' && fileInputRefEn.current) {
        fileInputRefEn.current.value = "";
      }
    }
  };

  const handleToggle = async (newEnabled: boolean, language: 'he' | 'en') => {
    const enabledKey = language === 'he' ? setting.enabledKey : setting.enabledKeyEn;
    
    if (language === 'he') {
      setEnabledHe(newEnabled);
    } else {
      setEnabledEn(newEnabled);
    }
    
    setSaving(true);
    try {
      await supabase
        .from("site_settings")
        .upsert(
          { setting_key: enabledKey, setting_value: newEnabled.toString() },
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

  const handlePreview = async (language: 'he' | 'en') => {
    const videoPath = language === 'he' ? videoPathHe : videoPathEn;
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
    const videoPath = deleteLanguage === 'he' ? videoPathHe : videoPathEn;
    const urlKey = deleteLanguage === 'he' ? setting.key : setting.keyEn;
    
    if (!videoPath) return;

    try {
      await supabase.storage.from(STORAGE_BUCKET).remove([videoPath]);
      await supabase
        .from("site_settings")
        .upsert(
          { setting_key: urlKey, setting_value: "" },
          { onConflict: "setting_key" }
        );
      
      if (deleteLanguage === 'he') {
        setVideoPathHe("");
      } else {
        setVideoPathEn("");
      }
      
      clearSettingsCache();
      toast({ title: t("admin.videosPage.deleted") || "הסרטון נמחק" });
    } catch (error) {
      toast({ title: "שגיאה במחיקה", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const Icon = setting.icon;

  const renderVideoUploadArea = (language: 'he' | 'en') => {
    const videoPath = language === 'he' ? videoPathHe : videoPathEn;
    const enabled = language === 'he' ? enabledHe : enabledEn;
    const fileInputRef = language === 'he' ? fileInputRefHe : fileInputRefEn;
    const inputId = `file-${setting.key}-${language}`;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor={`switch-${setting.key}-${language}`} className="text-sm text-muted-foreground">
            {enabled ? (t("common.on") || "מופעל") : (t("common.off") || "כבוי")}
          </Label>
          <Switch
            id={`switch-${setting.key}-${language}`}
            checked={enabled}
            onCheckedChange={(val) => handleToggle(val, language)}
            disabled={saving}
          />
        </div>

        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/mov,video/webm,video/avi,.mp4,.mov,.webm,.avi"
            onChange={(e) => handleFileSelect(e, language)}
            className="hidden"
            id={inputId}
            disabled={uploading}
          />
          
          {uploading && activeLanguage === language ? (
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
                  onClick={() => handlePreview(language)}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  {t("admin.videosPage.preview")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveLanguage(language);
                    fileInputRef.current?.click();
                  }}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {t("admin.videosPage.replace") || "החלף"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDeleteLanguage(language);
                    setDeleteDialogOpen(true);
                  }}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <label htmlFor={inputId} className="cursor-pointer" onClick={() => setActiveLanguage(language)}>
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
      </div>
    );
  };

  return (
    <>
      <Card className="glass-panel">
        <CardHeader className="pb-3">
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
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="he" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="he" className="gap-2">
                🇮🇱 {t('admin.hebrew') || 'עברית'}
                {videoPathHe && <Check className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
              <TabsTrigger value="en" className="gap-2">
                🇺🇸 {t('admin.english') || 'English'}
                {videoPathEn && <Check className="h-3 w-3 text-green-500" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="he">
              {renderVideoUploadArea('he')}
            </TabsContent>

            <TabsContent value="en">
              {renderVideoUploadArea('en')}
            </TabsContent>
          </Tabs>
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