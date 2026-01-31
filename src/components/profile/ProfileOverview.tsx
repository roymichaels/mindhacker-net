import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Heart, FileText, Zap, BookOpen, CheckSquare } from "lucide-react";
import { useState } from "react";

interface ProfileOverviewProps {
  fullName: string | null;
  bio: string | null;
  preferredLanguage: string | null;
  stats?: {
    sessions_count: number;
    courses_enrolled: number;
    checklists_count: number;
  };
  community?: {
    posts_count: number;
    comments_count: number;
    likes_received: number;
    total_points: number;
  } | null;
  isEditable?: boolean;
  onSave?: (data: { full_name: string; bio: string; preferred_language: string }) => Promise<boolean>;
}

const ProfileOverview = ({
  fullName,
  bio,
  preferredLanguage,
  stats,
  community,
  isEditable = false,
  onSave,
}: ProfileOverviewProps) => {
  const { t, isRTL } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: fullName || "",
    bio: bio || "",
    preferred_language: preferredLanguage || "he",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    const success = await onSave(editData);
    if (success) {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const StatCard = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="p-2 rounded-full bg-primary/10 text-primary">{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Personal Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("profile.personalInfo")}</CardTitle>
          {isEditable && !isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {t("common.edit")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label>{t("profile.fullName")}</Label>
                <Input
                  value={editData.full_name}
                  onChange={(e) =>
                    setEditData({ ...editData, full_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.bio")}</Label>
                <Textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.preferredLanguage")}</Label>
                <Select
                  value={editData.preferred_language}
                  onValueChange={(value) =>
                    setEditData({ ...editData, preferred_language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">עברית</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? t("common.saving") : t("common.save")}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="text-muted-foreground">{t("profile.fullName")}</Label>
                <p className="text-lg">{fullName || t("profile.notSet")}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("profile.bio")}</Label>
                <p className="text-lg whitespace-pre-wrap">
                  {bio || t("profile.noBio")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t("profile.preferredLanguage")}</Label>
                <p className="text-lg">
                  {preferredLanguage === "en" ? "English" : "עברית"}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.stats")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats && (
              <>
                <StatCard
                  icon={<Zap className="h-5 w-5" />}
                  label={t("profile.sessions")}
                  value={stats.sessions_count}
                />
                <StatCard
                  icon={<BookOpen className="h-5 w-5" />}
                  label={t("profile.courses")}
                  value={stats.courses_enrolled}
                />
                <StatCard
                  icon={<CheckSquare className="h-5 w-5" />}
                  label={t("profile.checklists")}
                  value={stats.checklists_count}
                />
              </>
            )}
            {community && (
              <>
                <StatCard
                  icon={<FileText className="h-5 w-5" />}
                  label={t("profile.posts")}
                  value={community.posts_count}
                />
                <StatCard
                  icon={<MessageSquare className="h-5 w-5" />}
                  label={t("profile.comments")}
                  value={community.comments_count}
                />
                <StatCard
                  icon={<Heart className="h-5 w-5" />}
                  label={t("profile.likesReceived")}
                  value={community.likes_received}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileOverview;
