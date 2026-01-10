import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, UserCheck, Send, Eye, Mail, BarChart3 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import CampaignsList from "@/components/admin/newsletter/CampaignsList";
import CampaignDialog from "@/components/admin/newsletter/CampaignDialog";
import SubscribersList from "@/components/admin/newsletter/SubscribersList";
import NewsletterStats from "@/components/admin/newsletter/NewsletterStats";

const Newsletter = () => {
  const { t, isRTL } = useTranslation();
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  const { data: subscribers = [], refetch: refetchSubscribers } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: campaigns = [], refetch: refetchCampaigns } = useQuery({
    queryKey: ["newsletter-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activeSubscribers = subscribers.filter((s) => s.status === "active");
  const sentThisMonth = campaigns.filter((c) => {
    if (!c.sent_at) return false;
    const sentDate = new Date(c.sent_at);
    const now = new Date();
    return sentDate.getMonth() === now.getMonth() && sentDate.getFullYear() === now.getFullYear();
  });

  const avgOpenRate = campaigns.reduce((acc, c) => {
    const stats = c.stats as { sent?: number; opened?: number } | null;
    if (stats?.sent && stats?.opened) {
      return acc + (stats.opened / stats.sent) * 100;
    }
    return acc;
  }, 0) / (campaigns.filter(c => c.stats).length || 1);

  const handleEdit = (campaignId: string) => {
    setEditingCampaignId(campaignId);
    setIsCampaignDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsCampaignDialogOpen(false);
    setEditingCampaignId(null);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('newsletter.title')}</h1>
          <p className="text-muted-foreground">{t('newsletter.subtitle')}</p>
        </div>
        <Button onClick={() => setIsCampaignDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('newsletter.newCampaign')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('newsletter.stats.totalSubscribers')}</p>
                <p className="text-2xl font-bold text-primary">{subscribers.length}</p>
              </div>
              <Users className="h-6 w-6 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('newsletter.stats.activeSubscribers')}</p>
                <p className="text-2xl font-bold text-green-400">{activeSubscribers.length}</p>
              </div>
              <UserCheck className="h-6 w-6 text-green-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('newsletter.stats.sentThisMonth')}</p>
                <p className="text-2xl font-bold text-blue-400">{sentThisMonth.length}</p>
              </div>
              <Send className="h-6 w-6 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('newsletter.stats.avgOpenRate')}</p>
                <p className="text-2xl font-bold text-yellow-400">{avgOpenRate.toFixed(1)}%</p>
              </div>
              <Eye className="h-6 w-6 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="glass-panel">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {t('newsletter.campaigns')} ({campaigns.length})
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('newsletter.subscribers')} ({subscribers.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('newsletter.analytics')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <CampaignsList
            campaigns={campaigns}
            subscribersCount={activeSubscribers.length}
            onEdit={handleEdit}
            onRefresh={refetchCampaigns}
          />
        </TabsContent>

        <TabsContent value="subscribers">
          <SubscribersList
            subscribers={subscribers}
            onRefresh={refetchSubscribers}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <NewsletterStats campaigns={campaigns} subscribers={subscribers} />
        </TabsContent>
      </Tabs>

      <CampaignDialog
        open={isCampaignDialogOpen}
        onOpenChange={handleDialogClose}
        campaignId={editingCampaignId}
        onSuccess={() => {
          handleDialogClose();
          refetchCampaigns();
        }}
      />
    </div>
  );
};

export default Newsletter;
