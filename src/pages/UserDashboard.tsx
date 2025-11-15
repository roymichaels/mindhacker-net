import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Calendar, LogOut, Package, ShoppingBag, User } from "lucide-react";
import Header from "@/components/Header";

interface Purchase {
  id: string;
  package_type: string;
  sessions_total: number;
  sessions_remaining: number;
  price: number;
  payment_status: string;
  purchase_date: string;
  booking_link: string | null;
}

interface Profile {
  full_name: string | null;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      setUserEmail(user.email || "");

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch purchases
      const { data: purchasesData, error } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .order("purchase_date", { ascending: false });

      if (error) throw error;

      setPurchases(purchasesData || []);
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את הנתונים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "התנתקת בהצלחה",
      description: "להתראות!",
    });
    navigate("/");
  };

  const handleBookSession = (purchase: Purchase) => {
    const bookingUrl = purchase.booking_link || `https://calendly.com/consciousness-hacker?email=${encodeURIComponent(userEmail)}`;
    window.open(bookingUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="p-8" dir="rtl">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black cyber-glow mb-2">
              שלום, {profile?.full_name || userEmail}! 👋
            </h1>
            <p className="text-muted-foreground">
              ברוך הבא ללוח הבקרה האישי שלך
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="ml-2 h-4 w-4" />
            התנתק
          </Button>
        </div>

        {/* Purchases Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              הרכישות שלי
            </h2>
            <Link to="/">
              <Button variant="outline">
                <Package className="ml-2 h-4 w-4" />
                רכוש חבילה נוספת
              </Button>
            </Link>
          </div>

          {purchases.length === 0 ? (
            <Card className="glass-panel">
              <CardContent className="pt-6 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  עדיין לא ביצעת רכישות
                </p>
                <Link to="/">
                  <Button>
                    רכוש את החבילה הראשונה שלך
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="glass-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {purchase.package_type === "single"
                          ? "מפגש בודד"
                          : "חבילת 4 מפגשים"}
                      </span>
                      <span className="text-primary cyber-glow">
                        ₪{purchase.price}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      נרכש ב: {new Date(purchase.purchase_date).toLocaleDateString("he-IL")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-accent/20 rounded-lg">
                      <span className="text-sm text-muted-foreground">
                        מפגשים נותרו:
                      </span>
                      <span className="text-xl font-bold cyber-glow">
                        {purchase.sessions_remaining} / {purchase.sessions_total}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">סטטוס:</span>
                      <span className={`text-sm font-medium ${
                        purchase.payment_status === "demo" 
                          ? "text-yellow-500" 
                          : "text-green-500"
                      }`}>
                        {purchase.payment_status === "demo" ? "Demo" : "פעיל"}
                      </span>
                    </div>

                    {purchase.sessions_remaining > 0 && (
                      <Button
                        className="w-full"
                        onClick={() => handleBookSession(purchase)}
                      >
                        <Calendar className="ml-2 h-4 w-4" />
                        קבע מפגש
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Profile Section */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              פרטים אישיים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">שם:</span>
              <span className="font-medium">{profile?.full_name || "לא מוגדר"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">אימייל:</span>
              <span className="font-medium">{userEmail}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default UserDashboard;
