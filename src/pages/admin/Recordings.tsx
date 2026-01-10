import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioLibrary } from "@/components/admin/recordings/AudioLibrary";
import { AudioAssignments } from "@/components/admin/recordings/AudioAssignments";
import { VideoLibrary } from "@/components/admin/recordings/VideoLibrary";
import { Headphones, Users, Video } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const Recordings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("videos");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold cyber-glow">{t('admin.recordings')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('admin.recordingsPage.subtitle') || 'ספריית הקלטות וסרטונים'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            {t('admin.videosPage.videoLibraryTab')}
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            {t('admin.recordingsPage.audioLibrary') || 'ספריית הקלטות'}
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('admin.recordingsPage.assignments') || 'הקצאות'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-6">
          <VideoLibrary />
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <AudioLibrary />
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <AudioAssignments />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Recordings;
