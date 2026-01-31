import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Zap, Clock, Calendar, CheckCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { he, enUS } from "date-fns/locale";

interface SessionData {
  id: string;
  ego_state: string;
  duration_seconds: number;
  completed_at: string | null;
  created_at: string;
}

interface ProfileActivityProps {
  sessions: SessionData[];
}

const ProfileActivity = ({ sessions }: ProfileActivityProps) => {
  const { t, language, isRTL } = useTranslation();
  const locale = language === "he" ? he : enUS;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${t("common.minutes")}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, "0")} ${t("common.hours")}`;
  };

  const getEgoStateLabel = (egoState: string) => {
    const labels: Record<string, string> = {
      child: t("aurora.childState"),
      adult: t("aurora.adultState"),
      parent: t("aurora.parentState"),
      free_child: t("aurora.freeChild"),
      adapted_child: t("aurora.adaptedChild"),
      nurturing_parent: t("aurora.nurturingParent"),
      critical_parent: t("aurora.criticalParent"),
    };
    return labels[egoState] || egoState;
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t("profile.recentSessions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground">{t("profile.noSessions")}</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{getEgoStateLabel(session.ego_state)}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(session.duration_seconds)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(session.created_at), {
                            addSuffix: true,
                            locale,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {session.completed_at && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileActivity;
