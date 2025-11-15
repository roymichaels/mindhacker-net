import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, Loader2, Edit, Trash2, Link as LinkIcon } from "lucide-react";
import { handleError, generateErrorId } from "@/lib/errorHandling";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Purchase {
  id: string;
  user_id: string;
  package_type: string;
  sessions_total: number;
  sessions_remaining: number;
  price: number;
  payment_status: string;
  payment_method: string | null;
  purchase_date: string;
  booking_link: string | null;
  user_email?: string;
  user_name?: string;
}

const Purchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editSessions, setEditSessions] = useState(0);
  const [bookingLinkDialogOpen, setBookingLinkDialogOpen] = useState(false);
  const [editingBookingLink, setEditingBookingLink] = useState<Purchase | null>(null);
  const [newBookingLink, setNewBookingLink] = useState("");

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const { data: purchasesData, error } = await supabase
        .from("purchases")
        .select("*")
        .order("purchase_date", { ascending: false });

      if (error) throw error;

      // Function to get user data via Edge Function
      const getUserData = async (userId: string) => {
        try {
          const { data, error } = await supabase.functions.invoke('get-user-data', {
            body: { userId }
          });

          if (error) throw error;
          return {
            email: data.user?.email || "Unknown",
            name: data.user?.user_metadata?.full_name || "לא ידוע"
          };
        } catch (error) {
          console.error("Error fetching user data - ID:", generateErrorId());
          return { email: "Unknown", name: "לא ידוע" };
        }
      };

      // Enrich with user data
      const enrichedPurchases = await Promise.all(
        (purchasesData || []).map(async (purchase) => {
          const userData = await getUserData(purchase.user_id);

          return {
            ...purchase,
            user_name: userData.name,
            user_email: userData.email,
          };
        })
      );

      setPurchases(enrichedPurchases);
    } catch (error: any) {
      handleError(error, "לא ניתן לטעון רכישות", "Purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSessions = async () => {
    if (!editingPurchase) return;

    try {
      const { error } = await supabase
        .from("purchases")
        .update({ sessions_remaining: editSessions })
        .eq("id", editingPurchase.id);

      if (error) throw error;

      toast({
        title: "עודכן בהצלחה",
        description: "מספר המפגשים עודכן",
      });

      setEditingPurchase(null);
      fetchPurchases();
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק רכישה זו?")) return;

    try {
      const { error } = await supabase
        .from("purchases")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "נמחק בהצלחה",
        description: "הרכישה נמחקה",
      });

      fetchPurchases();
    } catch (error: any) {
      handleError(error, "לא ניתן למחוק את הרכישה", "Purchases.handleDelete");
    }
  };

  const handleOpenBookingLinkDialog = (purchase: Purchase) => {
    setEditingBookingLink(purchase);
    setNewBookingLink(purchase.booking_link || "");
    setBookingLinkDialogOpen(true);
  };

  const handleUpdateBookingLink = async () => {
    if (!editingBookingLink) return;

    try {
      const { error } = await supabase
        .from("purchases")
        .update({ booking_link: newBookingLink || null })
        .eq("id", editingBookingLink.id);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "קישור הזמנת פגישה עודכן בהצלחה",
      });

      setBookingLinkDialogOpen(false);
      setEditingBookingLink(null);
      setNewBookingLink("");
      fetchPurchases();
    } catch (error: any) {
      handleError(error, "לא ניתן לעדכן את קישור הזמנת הפגישה", "Purchases.handleUpdateBookingLink");
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const userName = purchase.user_name?.toLowerCase() || "";
    return userName.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black cyber-glow mb-2">ניהול רכישות</h1>
        <p className="text-muted-foreground">
          צפה וערוך רכישות של לקוחות
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חפש לפי שם לקוח..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <div className="glass-panel rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">תאריך רכישה</TableHead>
              <TableHead className="text-right">שם לקוח</TableHead>
              <TableHead className="text-right">חבילה</TableHead>
              <TableHead className="text-right">מפגשים</TableHead>
              <TableHead className="text-right">מחיר</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  לא נמצאו רכישות
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    {new Date(purchase.purchase_date).toLocaleDateString("he-IL")}
                  </TableCell>
                  <TableCell>
                    {purchase.user_name || "לא ידוע"}
                  </TableCell>
                  <TableCell>
                    {purchase.package_type === "single"
                      ? "מפגש בודד"
                      : "חבילת 4 מפגשים"}
                  </TableCell>
                  <TableCell>
                    {purchase.sessions_remaining} / {purchase.sessions_total}
                  </TableCell>
                  <TableCell>₪{purchase.price}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        purchase.payment_status === "demo"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {purchase.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenBookingLinkDialog(purchase)}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingPurchase(purchase);
                          setEditSessions(purchase.sessions_remaining);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingPurchase} onOpenChange={() => setEditingPurchase(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת מפגשים</DialogTitle>
            <DialogDescription>
              עדכן את מספר המפגשים הנותרים ללקוח
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sessions">מפגשים נותרים</Label>
              <Input
                id="sessions"
                type="number"
                min="0"
                max={editingPurchase?.sessions_total || 0}
                value={editSessions}
                onChange={(e) => setEditSessions(parseInt(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPurchase(null)}>
              ביטול
            </Button>
            <Button onClick={handleUpdateSessions}>
              שמור שינויים
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Link Dialog */}
      <Dialog open={bookingLinkDialogOpen} onOpenChange={setBookingLinkDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ערוך קישור זמן פגישה</DialogTitle>
            <DialogDescription>
              עדכן את קישור Calendly עבור רכישה זו
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>קישור Calendly</Label>
              <Input
                value={newBookingLink}
                onChange={(e) => setNewBookingLink(e.target.value)}
                placeholder="https://calendly.com/..."
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingLinkDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleUpdateBookingLink}>
              שמור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Purchases;
