import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { ShoppingBag, Calendar, CreditCard, Zap } from "lucide-react";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";

interface Purchase {
  id: string;
  package_type: string;
  sessions_total: number;
  sessions_remaining: number;
  price: number;
  payment_status: string;
  purchase_date: string;
}

interface ProfilePurchasesProps {
  purchases: Purchase[];
  totalPurchases: number;
  activeSessions: number;
}

const ProfilePurchases = ({
  purchases,
  totalPurchases,
  activeSessions,
}: ProfilePurchasesProps) => {
  const { t, language, isRTL } = useTranslation();
  const locale = language === "he" ? he : enUS;

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">{t("common.paid")}</Badge>;
      case "pending":
        return <Badge variant="secondary">{t("common.pending")}</Badge>;
      case "failed":
        return <Badge variant="destructive">{t("common.failed")}</Badge>;
      case "granted":
        return <Badge variant="outline" className="border-primary text-primary">{t("common.granted")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalSpent = purchases.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalPurchases}</p>
                <p className="text-sm text-muted-foreground">{t("profile.totalPurchases")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{activeSessions}</p>
                <p className="text-sm text-muted-foreground">{t("profile.activeSessions")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <CreditCard className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">₪{totalSpent.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{t("profile.totalSpent")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t("profile.purchaseHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-muted-foreground">{t("profile.noPurchases")}</p>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium">{purchase.package_type}</p>
                      {getPaymentStatusBadge(purchase.payment_status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(purchase.purchase_date), "dd/MM/yyyy", { locale })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {purchase.sessions_remaining}/{purchase.sessions_total} {t("profile.sessionsRemaining")}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold">
                    ₪{purchase.price?.toLocaleString() || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePurchases;
