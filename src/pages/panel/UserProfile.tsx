import { useParams } from "react-router-dom";
import { useAdminUserView } from "@/hooks/useAdminUserView";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";
import {
  ProfileHeader,
  ProfileTabs,
  ProfileOverview,
  ProfileAurora,
  ProfileActivity,
  ProfilePurchases,
  ProfileActions,
  TabIcons,
} from "@/components/profile";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { userData, loading, error, refetch } = useAdminUserView(userId || "");
  const { t, isRTL } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">{error || t("profile.notFound")}</p>
      </div>
    );
  }

  const tabs = [
    {
      id: "overview",
      labelKey: "profile.tabs.overview",
      icon: TabIcons.overview,
      content: (
        <ProfileOverview
          fullName={userData.full_name}
          bio={userData.bio}
          preferredLanguage={userData.preferred_language}
          stats={userData.stats}
          community={userData.community}
          isEditable={false}
        />
      ),
    },
    {
      id: "aurora",
      labelKey: "profile.tabs.aurora",
      icon: TabIcons.aurora,
      content: <ProfileAurora aurora={userData.aurora} />,
    },
    {
      id: "purchases",
      labelKey: "profile.tabs.purchases",
      icon: TabIcons.purchases,
      content: (
        <ProfilePurchases
          purchases={userData.purchases}
          totalPurchases={userData.stats.total_purchases}
          activeSessions={userData.stats.active_sessions}
        />
      ),
    },
    {
      id: "activity",
      labelKey: "profile.tabs.activity",
      icon: TabIcons.activity,
      content: <ProfileActivity sessions={userData.sessions} />,
    },
    {
      id: "actions",
      labelKey: "profile.tabs.actions",
      icon: TabIcons.actions,
      adminOnly: true,
      content: (
        <ProfileActions
          userId={userData.id}
          userEmail={userData.email}
          userName={userData.full_name}
          currentRoles={userData.roles}
          onRoleChange={refetch}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <ProfileHeader
        name={userData.full_name}
        email={userData.email}
        avatarUrl={userData.avatar_url}
        createdAt={userData.created_at}
        level={userData.community?.level_name}
        levelColor={userData.community?.level_color}
        xp={userData.community?.total_points}
        roles={userData.roles}
        showBackButton={true}
        backPath="/panel/users"
      />
      <ProfileTabs tabs={tabs} defaultTab="overview" isAdmin={true} />
    </div>
  );
};

export default UserProfile;
