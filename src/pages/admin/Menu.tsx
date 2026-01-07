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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, GripVertical, Menu } from "lucide-react";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
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
      toast.success(editingItem ? "הפריט עודכן בהצלחה" : "הפריט נוסף בהצלחה");
      resetForm();
    },
    onError: () => {
      toast.error("שגיאה בשמירת הפריט");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast.success("הפריט נמחק בהצלחה");
    },
    onError: () => {
      toast.error("שגיאה במחיקת הפריט");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ניהול תפריט</h1>
          <p className="text-muted-foreground">ניהול פריטי התפריט הראשי של האתר</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 ml-2" />
              הוסף פריט
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "עריכת פריט" : "הוספת פריט חדש"}</DialogTitle>
              <DialogDescription className="sr-only">עריכת פריט בתפריט</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">שם הפריט (עברית)</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="לדוגמה: אודות"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label_en">שם הפריט (אנגלית)</Label>
                <Input
                  id="label_en"
                  value={formData.label_en}
                  onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                  placeholder="e.g., About"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_type">סוג פעולה</Label>
                <Select
                  value={formData.action_type}
                  onValueChange={(value) => setFormData({ ...formData, action_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scroll">גלילה לסקשן</SelectItem>
                    <SelectItem value="navigate">ניווט לעמוד</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_value">
                  {formData.action_type === "scroll" ? "מזהה סקשן" : "נתיב העמוד"}
                </Label>
                <Input
                  id="action_value"
                  value={formData.action_value}
                  onChange={(e) => setFormData({ ...formData, action_value: e.target.value })}
                  placeholder={formData.action_type === "scroll" ? "לדוגמה: about" : "לדוגמה: /courses"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_index">סדר תצוגה</Label>
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
                <Label htmlFor="is_visible">הצג בתפריט</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  ביטול
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "שומר..." : "שמור"}
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
            פריטי תפריט
          </CardTitle>
          <CardDescription>
            הפריטים מוצגים לפי סדר התצוגה. ניתן לערוך, להסתיר או למחוק כל פריט.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">טוען...</div>
          ) : !menuItems?.length ? (
            <div className="text-center py-8 text-muted-foreground">אין פריטי תפריט</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>שם (עברית)</TableHead>
                  <TableHead>שם (אנגלית)</TableHead>
                  <TableHead>סוג</TableHead>
                  <TableHead>ערך</TableHead>
                  <TableHead>סדר</TableHead>
                  <TableHead>מוצג</TableHead>
                  <TableHead className="w-24">פעולות</TableHead>
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
                      {item.action_type === "scroll" ? "גלילה" : "ניווט"}
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
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("האם למחוק את הפריט?")) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
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
    </div>
  );
};

export default MenuManagement;
