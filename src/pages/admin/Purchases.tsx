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
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice } from "@/lib/currency";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const { t, language, isRTL } = useTranslation();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editSessions, setEditSessions] = useState(0);
  const [bookingLinkDialogOpen, setBookingLinkDialogOpen] = useState(false);
  const [editingBookingLink, setEditingBookingLink] = useState<Purchase | null>(null);
  const [newBookingLink, setNewBookingLink] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

      const getUserData = async (userId: string) => {
        try {
          const { data, error } = await supabase.functions.invoke('get-user-data', {
            body: { userId }
          });

          if (error) throw error;
          return {
            email: data.user?.email || "Unknown",
            name: data.user?.user_metadata?.full_name || t('adminPurchases.unknown')
          };
        } catch (error) {
          console.error("Error fetching user data - ID:", generateErrorId());
          return { email: "Unknown", name: t('adminPurchases.unknown') };
        }
      };

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
      handleError(error, t('adminPurchases.loadError'), "Purchases");
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
        title: t('adminPurchases.updated'),
        description: t('adminPurchases.sessionsUpdated'),
      });

      setEditingPurchase(null);
      fetchPurchases();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("purchases")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: t('adminPurchases.deleted'),
        description: t('adminPurchases.purchaseDeleted'),
      });

      setDeleteId(null);
      fetchPurchases();
    } catch (error: any) {
      handleError(error, t('adminPurchases.deleteError'), "Purchases.handleDelete");
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
        title: t('common.success'),
        description: t('adminPurchases.bookingLinkUpdated'),
      });

      setBookingLinkDialogOpen(false);
      setEditingBookingLink(null);
      setNewBookingLink("");
      fetchPurchases();
    } catch (error: any) {
      handleError(error, t('adminPurchases.updateError'), "Purchases.handleUpdateBookingLink");
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
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-black cyber-glow mb-2">{t('adminPurchases.pageTitle')}</h1>
        <p className="text-muted-foreground">
          {t('adminPurchases.pageSubtitle')}
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
          <Input
            placeholder={t('adminPurchases.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={isRTL ? "pr-10" : "pl-10"}
          />
        </div>
      </div>

      <div className="glass-panel rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isRTL ? "text-right" : "text-left"}>{t('adminPurchases.purchaseDate')}</TableHead>
              <TableHead className={isRTL ? "text-right" : "text-left"}>{t('adminPurchases.customerName')}</TableHead>
              <TableHead className={isRTL ? "text-right" : "text-left"}>{t('adminPurchases.package')}</TableHead>
              <TableHead className={isRTL ? "text-right" : "text-left"}>{t('adminPurchases.sessions')}</TableHead>
              <TableHead className={isRTL ? "text-right" : "text-left"}>{t('adminPurchases.price')}</TableHead>
              <TableHead className={isRTL ? "text-right" : "text-left"}>{t('adminPurchases.status')}</TableHead>
              <TableHead className={isRTL ? "text-right" : "text-left"}>{t('adminPurchases.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t('adminPurchases.noPurchases')}
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    {new Date(purchase.purchase_date).toLocaleDateString(language === 'he' ? "he-IL" : "en-US")}
                  </TableCell>
                  <TableCell>
                    {purchase.user_name || t('adminPurchases.unknown')}
                  </TableCell>
                  <TableCell>
                    {purchase.package_type === "single"
                      ? t('adminPurchases.singleSession')
                      : t('adminPurchases.packageOf4')}
                  </TableCell>
                  <TableCell>
                    {purchase.sessions_remaining} / {purchase.sessions_total}
                  </TableCell>
                  <TableCell>{formatPrice(purchase.price, language)}</TableCell>
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
                        aria-label={t('adminPurchases.editBookingLink')}
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
                        aria-label={t('adminPurchases.editSessions')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteId(purchase.id)}
                        aria-label={t('common.delete')}
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

      {/* Edit Sessions Dialog */}
      <Dialog open={!!editingPurchase} onOpenChange={() => setEditingPurchase(null)}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t('adminPurchases.editSessions')}</DialogTitle>
            <DialogDescription>
              {t('adminPurchases.editSessionsDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sessions">{t('adminPurchases.remainingSessions')}</Label>
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
              {t('adminPurchases.cancel')}
            </Button>
            <Button onClick={handleUpdateSessions}>
              {t('adminPurchases.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Link Dialog */}
      <Dialog open={bookingLinkDialogOpen} onOpenChange={setBookingLinkDialogOpen}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t('adminPurchases.editBookingLink')}</DialogTitle>
            <DialogDescription>
              {t('adminPurchases.editBookingLinkDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('adminPurchases.calendlyLink')}</Label>
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
              {t('adminPurchases.cancel')}
            </Button>
            <Button onClick={handleUpdateBookingLink}>
              {t('adminPurchases.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminPurchases.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminPurchases.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Purchases;
