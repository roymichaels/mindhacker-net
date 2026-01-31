import { useParams } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";
import { ProfileHeader } from "@/components/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, FileText, Zap, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const CommunityProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { profile, loading, isOwnProfile } = useUserProfile(userId);
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">{t("profile.notFound")}</p>
        <Button onClick={() => navigate("/community")}>{t("common.backToCommunity")}</Button>
      </div>
    );
  }

  const StatCard = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
  }) => (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
      <div className="p-2 rounded-full bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  const handleSendMessage = () => {
    if (!user) {
      navigate("/login?redirect=/community/profile/" + userId);
      return;
    }
    navigate(`/messages?to=${userId}`);
  };

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6 max-w-4xl">
        {/* Header */}
        <ProfileHeader
          name={profile.full_name}
          avatarUrl={profile.avatar_url}
          createdAt={profile.created_at}
          level={profile.community?.level_name}
          levelColor={profile.community?.level_color}
          xp={profile.community?.total_points}
          isOwnProfile={isOwnProfile}
          onEdit={isOwnProfile ? () => navigate("/profile") : undefined}
        />

        {/* Bio */}
        {profile.bio && (
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.about")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Community Stats */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.communityStats")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<FileText className="h-5 w-5" />}
                label={t("profile.posts")}
                value={profile.community?.posts_count || 0}
              />
              <StatCard
                icon={<MessageSquare className="h-5 w-5" />}
                label={t("profile.comments")}
                value={profile.community?.comments_count || 0}
              />
              <StatCard
                icon={<Heart className="h-5 w-5" />}
                label={t("profile.likesReceived")}
                value={profile.community?.likes_received || 0}
              />
              <StatCard
                icon={<Zap className="h-5 w-5" />}
                label={t("profile.xp")}
                value={profile.community?.total_points || 0}
              />
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.activitySummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                icon={<Zap className="h-5 w-5" />}
                label={t("profile.sessions")}
                value={profile.stats?.sessions_count || 0}
              />
              <StatCard
                icon={<BookOpen className="h-5 w-5" />}
                label={t("profile.courses")}
                value={profile.stats?.courses_enrolled || 0}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {!isOwnProfile && user && (
          <div className="flex gap-3">
            <Button onClick={handleSendMessage} className="gap-2">
              <MessageSquare className="h-4 w-4" />
              {t("profile.sendMessage")}
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CommunityProfile;
