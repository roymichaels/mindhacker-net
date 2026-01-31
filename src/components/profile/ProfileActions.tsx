import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Gift, Shield, MessageSquare, Ban, Mail } from "lucide-react";
import { useState } from "react";
import AdminGrantPurchaseDialog from "@/components/admin/AdminGrantPurchaseDialog";
import { useNavigate } from "react-router-dom";

interface ProfileActionsProps {
  userId: string;
  userEmail: string;
  userName: string | null;
  currentRoles: string[];
  onRoleChange?: () => void;
}

const ProfileActions = ({
  userId,
  userEmail,
  userName,
  currentRoles,
  onRoleChange,
}: ProfileActionsProps) => {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);

  const handleSendMessage = () => {
    // Navigate to messages with this user
    navigate(`/messages?to=${userId}`);
  };

  const handleManageRoles = () => {
    navigate(`/panel/roles?user=${userId}`);
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.adminActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => setGrantDialogOpen(true)}
            >
              <Gift className="h-4 w-4" />
              {t("adminUsers.grantPurchase")}
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={handleManageRoles}
            >
              <Shield className="h-4 w-4" />
              {t("profile.manageRoles")}
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={handleSendMessage}
            >
              <MessageSquare className="h-4 w-4" />
              {t("profile.sendMessage")}
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => window.location.href = `mailto:${userEmail}`}
            >
              <Mail className="h-4 w-4" />
              {t("profile.sendEmail")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Roles */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.currentRoles")}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentRoles.length === 0 ? (
            <p className="text-muted-foreground">{t("profile.noRoles")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentRoles.map((role) => (
                <div
                  key={role}
                  className="px-3 py-2 rounded-lg bg-muted flex items-center gap-2"
                >
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="capitalize">{role}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdminGrantPurchaseDialog
        open={grantDialogOpen}
        onOpenChange={setGrantDialogOpen}
        user={{
          id: userId,
          email: userEmail,
          full_name: userName,
        }}
        onSuccess={onRoleChange}
      />
    </div>
  );
};

export default ProfileActions;
