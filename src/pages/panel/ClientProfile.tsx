import { useParams } from "react-router-dom";
import { useCoachClientView } from "@/hooks/useCoachClientView";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";
import {
  ProfileHeader,
  ProfileTabs,
  ProfileOverview,
  ProfileAurora,
  ProfileActivity,
  ProfilePurchases,
  TabIcons,
} from "@/components/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Calendar, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClientProfile = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { clientData, loading, error, refetch } = useCoachClientView(clientId || "");
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">{error || t("profile.notFound")}</p>
      </div>
    );
  }

  const handleSendMessage = () => {
    navigate(`/messages?to=${clientData.id}`);
  };

  const handleScheduleSession = () => {
    navigate(`/coach/calendar?client=${clientData.id}`);
  };

  const tabs = [
    {
      id: "overview",
      labelKey: "profile.tabs.overview",
      icon: TabIcons.overview,
      content: (
        <ProfileOverview
          fullName={clientData.full_name}
          bio={clientData.bio}
          preferredLanguage={clientData.preferred_language}
          stats={clientData.stats}
          community={clientData.community}
          isEditable={false}
        />
      ),
    },
    {
      id: "aurora",
      labelKey: "profile.tabs.aurora",
      icon: TabIcons.aurora,
      content: <ProfileAurora aurora={clientData.aurora} />,
    },
    {
      id: "purchases",
      labelKey: "profile.tabs.purchases",
      icon: TabIcons.purchases,
      content: (
        <ProfilePurchases
          purchases={clientData.purchases}
          totalPurchases={clientData.stats.total_purchases}
          activeSessions={clientData.stats.active_sessions}
        />
      ),
    },
    {
      id: "activity",
      labelKey: "profile.tabs.activity",
      icon: TabIcons.activity,
      content: <ProfileActivity sessions={clientData.sessions} />,
    },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <ProfileHeader
        name={clientData.full_name}
        avatarUrl={clientData.avatar_url}
        createdAt={clientData.created_at}
        level={clientData.community?.level_name}
        levelColor={clientData.community?.level_color}
        xp={clientData.community?.total_points}
        showBackButton={true}
        backPath="/coach/clients"
      />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSendMessage} variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              {t("profile.sendMessage")}
            </Button>
            <Button onClick={handleScheduleSession} variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {t("profile.scheduleSession")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileTabs tabs={tabs} defaultTab="overview" />
    </div>
  );
};

export default ClientProfile;
