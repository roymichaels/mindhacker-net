import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Download, MoreVertical, Trash2, UserCheck, UserX, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import ImportSubscribersDialog from "./ImportSubscribersDialog";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: string | null;
  language: string | null;
  source: string | null;
  subscribed_at: string | null;
}

interface SubscribersListProps {
  subscribers: Subscriber[];
  onRefresh: () => void;
}

const SubscribersList = ({ subscribers, onRefresh }: SubscribersListProps) => {
  const { t, isRTL, language } = useTranslation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch = 
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      (sub.name?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesLanguage = languageFilter === "all" || sub.language === languageFilter;
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">{t('newsletter.subscriber.active')}</Badge>;
      case "unsubscribed":
        return <Badge variant="secondary">{t('newsletter.subscriber.unsubscribed')}</Badge>;
      case "bounced":
        return <Badge className="bg-red-500/20 text-red-400">{t('newsletter.subscriber.bounced')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast({ title: t('admin.deleteError'), variant: "destructive" });
    } else {
      toast({ title: t('admin.deleted') });
      onRefresh();
    }
    setDeleteId(null);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === "unsubscribed" ? { unsubscribed_at: new Date().toISOString() } : {})
      })
      .eq("id", id);

    if (error) {
      toast({ title: t('admin.updateError'), variant: "destructive" });
    } else {
      toast({ title: t('admin.updated') });
      onRefresh();
    }
  };

  const exportCSV = () => {
    const headers = ["Email", "Name", "Status", "Language", "Source", "Subscribed At"];
    const rows = filteredSubscribers.map((sub) => [
      sub.email,
      sub.name || "",
      sub.status || "",
      sub.language || "",
      sub.source || "",
      sub.subscribed_at ? format(new Date(sub.subscribed_at), "yyyy-MM-dd") : "",
    ]);
    
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('newsletter.subscriber.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all') || 'הכל'}</SelectItem>
                <SelectItem value="active">{t('newsletter.subscriber.active')}</SelectItem>
                <SelectItem value="unsubscribed">{t('newsletter.subscriber.unsubscribed')}</SelectItem>
                <SelectItem value="bounced">{t('newsletter.subscriber.bounced')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('newsletter.subscriber.language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all') || 'הכל'}</SelectItem>
                <SelectItem value="he">עברית</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowImport(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('newsletter.actions.import')}
            </Button>
            <Button variant="outline" onClick={exportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              {t('newsletter.actions.export')}
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border border-primary/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('newsletter.subscriber.email')}</TableHead>
                  <TableHead>{t('newsletter.subscriber.name')}</TableHead>
                  <TableHead>{t('newsletter.subscriber.status')}</TableHead>
                  <TableHead>{t('newsletter.subscriber.language')}</TableHead>
                  <TableHead>{t('newsletter.subscriber.source')}</TableHead>
                  <TableHead>{t('newsletter.subscriber.subscribedAt')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {t('newsletter.noSubscribers')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.email}</TableCell>
                      <TableCell>{sub.name || "-"}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sub.language === "he" ? "עברית" : "English"}</Badge>
                      </TableCell>
                      <TableCell>{sub.source || "-"}</TableCell>
                      <TableCell>
                        {sub.subscribed_at
                          ? format(new Date(sub.subscribed_at), "dd/MM/yyyy", { locale: isRTL ? he : enUS })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={t('common.edit')}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? "start" : "end"}>
                            {sub.status === "active" ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(sub.id, "unsubscribed")}>
                                <UserX className="h-4 w-4 mr-2" />
                                {t('newsletter.subscriber.unsubscribed')}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleStatusChange(sub.id, "active")}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                {t('newsletter.subscriber.active')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setDeleteId(sub.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('newsletter.showingSubscribers').replace('{count}', String(filteredSubscribers.length)).replace('{total}', String(subscribers.length))}
          </p>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportSubscribersDialog
        open={showImport}
        onOpenChange={setShowImport}
        onSuccess={() => {
          setShowImport(false);
          onRefresh();
        }}
      />
    </>
  );
};

export default SubscribersList;
