import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Eye, EyeOff, Layout } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      toast.success("הסקשן עודכן בהצלחה");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("שגיאה בעדכון הסקשן");
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
      toast.success("הנראות עודכנה");
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
      what: "מה זה היפנוזה",
      how: "איך זה עובד",
      about: "אודות",
      booking: "הזמנה / מחירון",
      testimonials: "המלצות",
      faq: "שאלות נפוצות",
    };
    return labels[key] || key;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ניהול סקשנים בעמוד הבית</h1>
        <p className="text-muted-foreground">עריכת כותרות ותוכן הסקשנים בעמוד הראשי</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            סקשנים בעמוד הבית
          </CardTitle>
          <CardDescription>
            ערוך את הכותרות, תתי-כותרות והתוכן של כל סקשן. התוכן תומך בעברית ואנגלית.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">טוען...</div>
          ) : !sections?.length ? (
            <div className="text-center py-8 text-muted-foreground">אין סקשנים</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>סקשן</TableHead>
                  <TableHead>כותרת (עברית)</TableHead>
                  <TableHead>כותרת (אנגלית)</TableHead>
                  <TableHead>סדר</TableHead>
                  <TableHead>נראות</TableHead>
                  <TableHead className="w-24">פעולות</TableHead>
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
              עריכת סקשן: {editingSection ? getSectionLabel(editingSection.section_key) : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="hebrew" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="hebrew">עברית</TabsTrigger>
                <TabsTrigger value="english">English</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hebrew" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>כותרת (עברית)</Label>
                  <Input
                    value={formData.title_he}
                    onChange={(e) => setFormData({ ...formData, title_he: e.target.value })}
                    placeholder="כותרת הסקשן"
                  />
                </div>
                <div className="space-y-2">
                  <Label>תת-כותרת (עברית)</Label>
                  <Input
                    value={formData.subtitle_he}
                    onChange={(e) => setFormData({ ...formData, subtitle_he: e.target.value })}
                    placeholder="תת-כותרת"
                  />
                </div>
                <div className="space-y-2">
                  <Label>תוכן (עברית)</Label>
                  <Textarea
                    value={formData.content_he}
                    onChange={(e) => setFormData({ ...formData, content_he: e.target.value })}
                    placeholder="תוכן נוסף (אופציונלי)"
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
                ביטול
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "שומר..." : "שמור"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomepageSections;
