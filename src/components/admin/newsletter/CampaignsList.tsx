import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreVertical, Edit, Copy, Trash2, Send, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";

interface Campaign {
  id: string;
  title: string;
  subject_he: string;
  subject_en: string | null;
  status: string | null;
  created_at: string | null;
  sent_at: string | null;
  stats: unknown;
}

interface CampaignsListProps {
  campaigns: Campaign[];
  subscribersCount: number;
  onEdit: (id: string) => void;
  onRefresh: () => void;
}

const CampaignsList = ({ campaigns, subscribersCount, onEdit, onRefresh }: CampaignsListProps) => {
  const { t, isRTL, language } = useTranslation();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [confirmSendId, setConfirmSendId] = useState<string | null>(null);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">{t('newsletter.status.draft')}</Badge>;
      case "scheduled":
        return <Badge className="bg-yellow-500/20 text-yellow-400">{t('newsletter.status.scheduled')}</Badge>;
      case "sending":
        return <Badge className="bg-blue-500/20 text-blue-400">{t('newsletter.status.sending')}</Badge>;
      case "sent":
        return <Badge className="bg-green-500/20 text-green-400">{t('newsletter.status.sent')}</Badge>;
      default:
        return <Badge variant="secondary">{t('newsletter.status.draft')}</Badge>;
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    const { error } = await supabase
      .from("newsletter_campaigns")
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

  const handleDuplicate = async (campaign: Campaign) => {
    const { error } = await supabase
      .from("newsletter_campaigns")
      .insert({
        title: `${campaign.title} (${t('common.copy')})`,
        subject_he: campaign.subject_he,
        subject_en: campaign.subject_en,
        content_html_he: "",
        status: "draft",
      });

    if (error) {
      toast({ title: t('admin.updateError'), variant: "destructive" });
    } else {
      toast({ title: t('admin.created') });
      onRefresh();
    }
  };

  const handleSend = async () => {
    if (!confirmSendId) return;
    
    setSendingId(confirmSendId);
    setConfirmSendId(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: { campaignId: confirmSendId }
      });

      if (error) throw error;

      toast({ 
        title: t('newsletter.actions.sendSuccess'),
        description: `${data?.stats?.sent || 0} ${t('newsletter.stats.sent')}`
      });
      onRefresh();
    } catch (error) {
      toast({ title: t('newsletter.actions.sendError'), variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  if (campaigns.length === 0) {
    return (
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">{t('newsletter.noCampaigns')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {campaigns.map((campaign) => {
          const stats = campaign.stats as { sent?: number; opened?: number; clicked?: number } | null;
          
          return (
            <Card key={campaign.id} className="glass-panel border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? campaign.subject_he : (campaign.subject_en || campaign.subject_he)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(campaign.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={t('common.edit')}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isRTL ? "start" : "end"}>
                        <DropdownMenuItem onClick={() => onEdit(campaign.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                          <Copy className="h-4 w-4 mr-2" />
                          {t('newsletter.actions.duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(campaign.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {t('common.add')}: {campaign.created_at 
                        ? format(new Date(campaign.created_at), "dd/MM/yyyy", { locale: isRTL ? he : enUS })
                        : "-"}
                    </span>
                    {campaign.sent_at && (
                      <span>
                        {t('newsletter.sentAt')}: {format(new Date(campaign.sent_at), "dd/MM/yyyy HH:mm", { locale: isRTL ? he : enUS })}
                      </span>
                    )}
                    {stats && (
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Send className="h-3 w-3" /> {stats.sent || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {stats.opened || 0}
                        </span>
                      </div>
                    )}
                  </div>
                  {campaign.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() => setConfirmSendId(campaign.id)}
                      disabled={sendingId === campaign.id}
                      className="gap-2"
                    >
                      {sendingId === campaign.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {t('newsletter.sendNow')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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

      {/* Send Confirmation */}
      <AlertDialog open={!!confirmSendId} onOpenChange={() => setConfirmSendId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('newsletter.actions.confirmSend')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('newsletter.actions.confirmSendDesc').replace('{count}', String(subscribersCount))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              {t('newsletter.sendNow')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CampaignsList;
