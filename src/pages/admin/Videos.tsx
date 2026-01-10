import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { VideoLibrary } from "@/components/admin/recordings/VideoLibrary";
import { Video, Layout, Play, Loader2, User, Gift, Brain, Rocket, Youtube, Check, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const VideoSettingsCard = ({ setting }: { setting: VideoSetting }) => {
  const { t, isRTL } = useTranslation();
  const { toast } = useToast();
  const { settings, loading } = useSiteSettings();
  
  const [url, setUrl] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Initialize from settings when loaded
  useEffect(() => {
    if (!loading) {
      const settingsAny = settings as any;
      setUrl(settingsAny[setting.key] || "");
      setEnabled(settingsAny[setting.enabledKey] === true || settingsAny[setting.enabledKey] === "true");
    }
  }, [loading, settings, setting.key, setting.enabledKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert URL setting
      await supabase
        .from("site_settings")
        .upsert(
          { setting_key: setting.key, setting_value: url },
          { onConflict: "setting_key" }
        );

      // Upsert enabled setting
      await supabase
        .from("site_settings")
        .upsert(
          { setting_key: setting.enabledKey, setting_value: enabled.toString() },
          { onConflict: "setting_key" }
        );

      toast({ title: t("admin.videosPage.saved") });
    } catch (error) {
      toast({ title: t("admin.videosPage.saveError"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getEmbedUrl = (videoUrl: string) => {
    if (!videoUrl) return "";
    
    // YouTube
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    
    // Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    
    return videoUrl;
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
                {enabled ? t("common.on") || "מופעל" : t("common.off") || "כבוי"}
              </Label>
              <Switch
                id={`switch-${setting.key}`}
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Youtube className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t("admin.videosPage.urlPlaceholder")}
                className={isRTL ? "pr-10" : "pl-10"}
                dir="ltr"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              disabled={!url}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {t("admin.videosPage.preview")}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {t("common.save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {t(setting.titleKey)}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            {previewOpen && url && (
              <iframe
                src={getEmbedUrl(url)}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            )}
          </div>
          {url && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, "_blank")}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {t("common.openInNewTab") || "פתח בחלון חדש"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
