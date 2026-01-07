import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Layout } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";

interface HomepageSection {
  id: string;
  section_key: string;
  title_he: string | null;
  title_en: string | null;
  subtitle_he: string | null;
  subtitle_en: string | null;
  content_he: string | null;
  content_en: string | null;
  is_visible: boolean;
  order_index: number;
}

const HomepageSections = () => {
  const { t, isRTL } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [formData, setFormData] = useState({
    title_he: "",
    title_en: "",
    subtitle_he: "",
    subtitle_en: "",
    content_he: "",
    content_en: "",
  });

  const { data: sections, isLoading } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as HomepageSection[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<HomepageSection> }) => {
      const { error } = await supabase
        .from("homepage_sections")
        .update(data.updates)
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sections"] });
      toast.success(t('adminHomepage.sectionUpdated'));
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error(t('adminHomepage.updateError'));
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from("homepage_sections")
        .update({ is_visible })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sections"] });
      toast.success(t('adminHomepage.visibilityUpdated'));
    },
  });

  const openEditDialog = (section: HomepageSection) => {
    setEditingSection(section);
    setFormData({
      title_he: section.title_he || "",
      title_en: section.title_en || "",
      subtitle_he: section.subtitle_he || "",
      subtitle_en: section.subtitle_en || "",
      content_he: section.content_he || "",
      content_en: section.content_en || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSection) {
      updateMutation.mutate({
        id: editingSection.id,
        updates: formData,
      });
    }
  };

  const getSectionLabel = (key: string) => {
    const labels: Record<string, string> = {
      what: t('adminHomepage.sectionWhat'),
      how: t('adminHomepage.sectionHow'),
      about: t('adminHomepage.sectionAbout'),
      booking: t('adminHomepage.sectionBooking'),
      testimonials: t('adminHomepage.sectionTestimonials'),
      faq: t('adminHomepage.sectionFaq'),
    };
    return labels[key] || key;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-2xl font-bold">{t('adminHomepage.pageTitle')}</h1>
        <p className="text-muted-foreground">{t('adminHomepage.pageSubtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            {t('adminHomepage.cardTitle')}
          </CardTitle>
          <CardDescription>
            {t('adminHomepage.cardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('adminHomepage.loading')}</div>
          ) : !sections?.length ? (
            <div className="text-center py-8 text-muted-foreground">{t('adminHomepage.noSections')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('adminHomepage.section')}</TableHead>
                  <TableHead>{t('adminHomepage.titleHe')}</TableHead>
                  <TableHead>{t('adminHomepage.titleEn')}</TableHead>
                  <TableHead>{t('adminHomepage.order')}</TableHead>
                  <TableHead>{t('adminHomepage.visibility')}</TableHead>
                  <TableHead className="w-24">{t('adminHomepage.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{getSectionLabel(section.section_key)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{section.title_he}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{section.title_en}</TableCell>
                    <TableCell>{section.order_index}</TableCell>
                    <TableCell>
                      <Switch
                        checked={section.is_visible}
                        onCheckedChange={(checked) =>
                          toggleVisibility.mutate({ id: section.id, is_visible: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(section)}
                        aria-label={t('common.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('adminHomepage.editSection')} {editingSection ? getSectionLabel(editingSection.section_key) : ""}
            </DialogTitle>
            <DialogDescription>{t('adminHomepage.editDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="hebrew" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hebrew">{t('adminHomepage.tabHebrew')}</TabsTrigger>
                <TabsTrigger value="english">{t('adminHomepage.tabEnglish')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hebrew" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('adminHomepage.sectionTitle')}</Label>
                  <Input
                    value={formData.title_he}
                    onChange={(e) => setFormData({ ...formData, title_he: e.target.value })}
                    placeholder={t('adminHomepage.sectionTitle')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('adminHomepage.subtitle')}</Label>
                  <Input
                    value={formData.subtitle_he}
                    onChange={(e) => setFormData({ ...formData, subtitle_he: e.target.value })}
                    placeholder={t('adminHomepage.subtitlePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('adminHomepage.content')}</Label>
                  <Textarea
                    value={formData.content_he}
                    onChange={(e) => setFormData({ ...formData, content_he: e.target.value })}
                    placeholder={t('adminHomepage.contentPlaceholder')}
                    rows={4}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="english" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Section title"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle (English)</Label>
                  <Input
                    value={formData.subtitle_en}
                    onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                    placeholder="Subtitle"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content (English)</Label>
                  <Textarea
                    value={formData.content_en}
                    onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                    placeholder="Additional content (optional)"
                    rows={4}
                    dir="ltr"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('adminHomepage.cancel')}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t('adminHomepage.saving') : t('adminHomepage.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomepageSections;
