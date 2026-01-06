import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioLibrary } from "@/components/admin/recordings/AudioLibrary";
import { AudioAssignments } from "@/components/admin/recordings/AudioAssignments";
import { PendingAudioOrders } from "@/components/admin/recordings/PendingAudioOrders";
import { PendingPayments } from "@/components/admin/recordings/PendingPayments";
import { VideoLibrary } from "@/components/admin/recordings/VideoLibrary";
import { Headphones, Users, Clock, Video, CreditCard } from "lucide-react";

const Recordings = () => {
  const [activeTab, setActiveTab] = useState("payments");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold cyber-glow">הקלטות וסרטונים</h1>
        <p className="text-muted-foreground mt-2">
          נהל הקלטות אודיו, סרטונים והקצה אותם למשתמשים
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            אישור תשלום
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            הזמנות ממתינות
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            ספריית סרטונים
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            ספריית הקלטות
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            הקצאות למשתמשים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-6">
          <PendingPayments />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <PendingAudioOrders />
        </TabsContent>

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
