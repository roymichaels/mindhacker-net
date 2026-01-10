import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2, Eye } from "lucide-react";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string | null;
  onSuccess: () => void;
}

const CampaignDialog = ({ open, onOpenChange, campaignId, onSuccess }: CampaignDialogProps) => {
  const { t, isRTL } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subject_he: "",
    subject_en: "",
    content_html_he: "",
    content_html_en: "",
  });

  const { data: campaign } = useQuery({
    queryKey: ["newsletter-campaign", campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      const { data, error } = await supabase
        .from("newsletter_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!campaignId,
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || "",
        subject_he: campaign.subject_he || "",
        subject_en: campaign.subject_en || "",
        content_html_he: campaign.content_html_he || "",
        content_html_en: campaign.content_html_en || "",
      });
    } else if (!campaignId) {
      setFormData({
        title: "",
        subject_he: "",
        subject_en: "",
        content_html_he: "",
        content_html_en: "",
      });
    }
  }, [campaign, campaignId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject_he || !formData.content_html_he) {
      toast({ title: t('admin.testimonialsPage.fillRequired'), variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      if (campaignId) {
        const { error } = await supabase
          .from("newsletter_campaigns")
          .update({
            title: formData.title,
            subject_he: formData.subject_he,
            subject_en: formData.subject_en || null,
            content_html_he: formData.content_html_he,
            content_html_en: formData.content_html_en || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", campaignId);

        if (error) throw error;
        toast({ title: t('admin.updated') });
      } else {
        const { error } = await supabase
          .from("newsletter_campaigns")
          .insert({
            title: formData.title,
            subject_he: formData.subject_he,
            subject_en: formData.subject_en || null,
            content_html_he: formData.content_html_he,
            content_html_en: formData.content_html_en || null,
            status: "draft",
          });

        if (error) throw error;
        toast({ title: t('admin.created') });
      }

      onSuccess();
    } catch (error) {
      toast({ title: t('admin.updateError'), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>
            {campaignId ? t('newsletter.editCampaign') : t('newsletter.newCampaign')}
          </DialogTitle>
          <DialogDescription>
            {t('newsletter.campaignDialogDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('newsletter.campaignTitle')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('newsletter.campaignTitlePlaceholder')}
            />
          </div>

          <Tabs defaultValue="hebrew" className="space-y-4">
            <TabsList>
              <TabsTrigger value="hebrew">עברית</TabsTrigger>
              <TabsTrigger value="english">English</TabsTrigger>
            </TabsList>

            <TabsContent value="hebrew" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject_he">{t('newsletter.subjectHe')}</Label>
                <Input
                  id="subject_he"
                  value={formData.subject_he}
                  onChange={(e) => setFormData({ ...formData, subject_he: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_html_he">{t('newsletter.contentHe')}</Label>
                <Textarea
                  id="content_html_he"
                  value={formData.content_html_he}
                  onChange={(e) => setFormData({ ...formData, content_html_he: e.target.value })}
                  rows={10}
                  dir="rtl"
                  placeholder={t('newsletter.contentPlaceholder')}
                />
              </div>
            </TabsContent>

            <TabsContent value="english" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject_en">{t('newsletter.subjectEn')}</Label>
                <Input
                  id="subject_en"
                  value={formData.subject_en}
                  onChange={(e) => setFormData({ ...formData, subject_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_html_en">{t('newsletter.contentEn')}</Label>
                <Textarea
                  id="content_html_en"
                  value={formData.content_html_en}
                  onChange={(e) => setFormData({ ...formData, content_html_en: e.target.value })}
                  rows={10}
                  placeholder={t('newsletter.contentPlaceholderEn')}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview Section */}
          {showPreview && (
            <div className="border border-primary/20 rounded-lg p-4 bg-background/50">
              <h4 className="font-medium mb-2">{t('newsletter.actions.preview')}</h4>
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: isRTL ? formData.content_html_he : (formData.content_html_en || formData.content_html_he) }}
              />
            </div>
          )}

          <div className="flex justify-between gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? t('common.close') : t('newsletter.actions.preview')}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('common.save')}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDialog;
