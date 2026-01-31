import { useUserProfile } from "@/hooks/useUserProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";
import {
  ProfileHeader,
  ProfileTabs,
  ProfileOverview,
  ProfileActivity,
  TabIcons,
} from "@/components/profile";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();
  const { t, isRTL } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("profile.notFound")}</p>
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
          fullName={profile.full_name}
          bio={profile.bio}
          preferredLanguage={profile.preferred_language}
          stats={profile.stats}
          community={profile.community}
          isEditable={true}
          onSave={async (data) => {
            return await updateProfile(data);
          }}
        />
      ),
    },
    {
      id: "activity",
      labelKey: "profile.tabs.activity",
      icon: TabIcons.activity,
      content: <ProfileActivity sessions={[]} />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6 max-w-4xl">
        <ProfileHeader
          name={profile.full_name}
          avatarUrl={profile.avatar_url}
          createdAt={profile.created_at}
          level={profile.community?.level_name}
          levelColor={profile.community?.level_color}
          xp={profile.community?.total_points}
          isOwnProfile={true}
        />
        <ProfileTabs tabs={tabs} defaultTab="overview" />
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
