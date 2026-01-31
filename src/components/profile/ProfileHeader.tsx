import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Star, Calendar, Mail, ArrowLeft, Edit } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDistanceToNow } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  name: string | null;
  email?: string;
  avatarUrl: string | null;
  createdAt: string;
  level?: string | null;
  levelColor?: string | null;
  xp?: number;
  roles?: string[];
  isOwnProfile?: boolean;
  showBackButton?: boolean;
  backPath?: string;
  onEditAvatar?: () => void;
  onEdit?: () => void;
}

const ProfileHeader = ({
  name,
  email,
  avatarUrl,
  createdAt,
  level,
  levelColor,
  xp,
  roles,
  isOwnProfile = false,
  showBackButton = false,
  backPath = "/panel/users",
  onEditAvatar,
  onEdit,
}: ProfileHeaderProps) => {
  const { t, language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const locale = language === "he" ? he : enUS;

  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  const joinedText = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale,
  });

  return (
    <div className="glass-panel p-6 rounded-lg" dir={isRTL ? "rtl" : "ltr"}>
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(backPath)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
      )}

      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-primary/20">
            <AvatarImage src={avatarUrl || undefined} alt={name || ""} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isOwnProfile && onEditAvatar && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              onClick={onEditAvatar}
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">
              {name || t("profile.anonymous")}
            </h1>
            {roles?.map((role) => (
              <Badge
                key={role}
                variant={role === "admin" ? "default" : "secondary"}
                className="capitalize"
              >
                {role}
              </Badge>
            ))}
          </div>

          {email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {level && (
              <div className="flex items-center gap-1">
                <Star
                  className="h-4 w-4"
                  style={{ color: levelColor || undefined }}
                />
                <span>{level}</span>
              </div>
            )}
            {xp !== undefined && (
              <span className="text-primary font-medium">{xp} XP</span>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {t("profile.joined")} {joinedText}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isOwnProfile && onEdit && (
          <Button variant="outline" onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            {t("profile.edit")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
