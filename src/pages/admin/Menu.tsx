import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, GripVertical, Menu } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface MenuItem {
  id: string;
  label: string;
  label_en: string | null;
  action_type: string;
  action_value: string;
  order_index: number;
  is_visible: boolean;
}

const MenuManagement = () => {
  const { t, isRTL } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    label_en: "",
    action_type: "scroll",
    action_value: "",
    order_index: 0,
    is_visible: true,
  });

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingItem) {
        const { error } = await supabase
          .from("menu_items")
          .update(data)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("menu_items").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success(editingItem ? t('adminMenu.itemUpdated') : t('adminMenu.itemAdded'));
      resetForm();
    },
    onError: () => {
      toast.error(t('adminMenu.saveError'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success(t('adminMenu.itemDeleted'));
      setDeleteId(null);
    },
    onError: () => {
      toast.error(t('adminMenu.deleteError'));
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_visible })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  const resetForm = () => {
    setFormData({
      label: "",
      label_en: "",
      action_type: "scroll",
      action_value: "",
      order_index: 0,
      is_visible: true,
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      label_en: item.label_en || "",
      action_type: item.action_type,
      action_value: item.action_value,
      order_index: item.order_index,
      is_visible: item.is_visible,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('adminMenu.pageTitle')}</h1>
          <p className="text-muted-foreground">{t('adminMenu.pageSubtitle')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('adminMenu.addItem')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? t('adminMenu.editItem') : t('adminMenu.newItem')}</DialogTitle>
              <DialogDescription>{t('adminMenu.dialogDescription')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">{t('adminMenu.labelHe')}</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder={isRTL ? "לדוגמה: אודות" : "e.g., About"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label_en">{t('adminMenu.labelEn')}</Label>
                <Input
                  id="label_en"
                  value={formData.label_en}
                  onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                  placeholder="e.g., About"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_type">{t('adminMenu.actionType')}</Label>
                <Select
                  value={formData.action_type}
                  onValueChange={(value) => setFormData({ ...formData, action_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scroll">{t('adminMenu.scrollToSection')}</SelectItem>
                    <SelectItem value="navigate">{t('adminMenu.navigateToPage')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_value">
                  {formData.action_type === "scroll" ? t('adminMenu.sectionId') : t('adminMenu.pagePath')}
                </Label>
                <Input
                  id="action_value"
                  value={formData.action_value}
                  onChange={(e) => setFormData({ ...formData, action_value: e.target.value })}
                  placeholder={formData.action_type === "scroll" ? "about" : "/courses"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_index">{t('adminMenu.orderIndex')}</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
                <Label htmlFor="is_visible">{t('adminMenu.showInMenu')}</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('adminMenu.cancel')}
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? t('adminMenu.saving') : t('adminMenu.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            {t('adminMenu.menuItems')}
          </CardTitle>
          <CardDescription>
            {t('adminMenu.menuItemsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('adminMenu.loading')}</div>
          ) : !menuItems?.length ? (
            <div className="text-center py-8 text-muted-foreground">{t('adminMenu.noItems')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>{t('adminMenu.nameHe')}</TableHead>
                  <TableHead>{t('adminMenu.nameEn')}</TableHead>
                  <TableHead>{t('adminMenu.type')}</TableHead>
                  <TableHead>{t('adminMenu.value')}</TableHead>
                  <TableHead>{t('adminMenu.order')}</TableHead>
                  <TableHead>{t('adminMenu.visible')}</TableHead>
                  <TableHead className="w-24">{t('adminMenu.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell className="text-muted-foreground">{item.label_en || "-"}</TableCell>
                    <TableCell>
                      {item.action_type === "scroll" ? t('adminMenu.scroll') : t('adminMenu.navigate')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.action_value}</TableCell>
                    <TableCell>{item.order_index}</TableCell>
                    <TableCell>
                      <Switch
                        checked={item.is_visible}
                        onCheckedChange={(checked) =>
                          toggleVisibility.mutate({ id: item.id, is_visible: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                          aria-label={t('common.edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                          aria-label={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminMenu.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminMenu.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuManagement;
