import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { Sparkles, Target, CheckCircle, Clock, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he, enUS } from "date-fns/locale";

interface AuroraData {
  checklists: {
    id: string;
    title: string;
    status: string;
    created_at: string;
  }[];
  focus_plans: {
    id: string;
    title: string;
    status: string;
    duration_days: number;
  }[];
  launchpad_summary?: any | null;
}

interface ProfileAuroraProps {
  aurora: AuroraData;
  consciousnessScore?: number;
}

const ProfileAurora = ({ aurora, consciousnessScore }: ProfileAuroraProps) => {
  const { t, language, isRTL } = useTranslation();
  const locale = language === "he" ? he : enUS;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">{t("common.completed")}</Badge>;
      case "active":
        return <Badge variant="default">{t("common.active")}</Badge>;
      case "in_progress":
        return <Badge variant="secondary">{t("common.inProgress")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Consciousness Score */}
      {consciousnessScore !== undefined && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("profile.consciousnessScore")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-primary">
                {consciousnessScore}
              </div>
              <div className="text-muted-foreground">/100</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Launchpad Summary */}
      {aurora.launchpad_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t("profile.launchpadSummary")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              {typeof aurora.launchpad_summary.summary === "string" ? (
                <p className="whitespace-pre-wrap">{aurora.launchpad_summary.summary}</p>
              ) : (
                <pre className="text-sm bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(aurora.launchpad_summary, null, 2)}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Focus Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("profile.focusPlans")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aurora.focus_plans.length === 0 ? (
            <p className="text-muted-foreground">{t("profile.noFocusPlans")}</p>
          ) : (
            <div className="space-y-3">
              {aurora.focus_plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{plan.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {plan.duration_days} {t("common.days")}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(plan.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklists */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {t("profile.checklists")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aurora.checklists.length === 0 ? (
            <p className="text-muted-foreground">{t("profile.noChecklists")}</p>
          ) : (
            <div className="space-y-3">
              {aurora.checklists.map((checklist) => (
                <div
                  key={checklist.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{checklist.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(checklist.created_at), {
                          addSuffix: true,
                          locale,
                        })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(checklist.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileAurora;
