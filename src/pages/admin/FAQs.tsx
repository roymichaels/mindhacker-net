import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { z } from "zod";
import { handleError } from "@/lib/errorHandling";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_active: boolean;
}

const faqSchema = z.object({
  question: z.string()
    .trim()
    .min(5, "שאלה חייבת להכיל לפחות 5 תווים")
    .max(500, "שאלה ארוכה מדי"),
  answer: z.string()
    .trim()
    .min(10, "תשובה חייבת להכיל לפחות 10 תווים")
    .max(2000, "תשובה ארוכה מדי"),
  is_active: z.boolean(),
  order_index: z.number().int().nonnegative()
});

const FAQs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "", order_index: 0, is_active: true });
  const { toast } = useToast();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      handleError(error, "לא ניתן לטעון את השאלות", "FAQs.fetchFAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate form data
    const result = faqSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "שגיאת אימות",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (editingFaq) {
        const { error } = await supabase
          .from("faqs")
          .update({ ...formData, updated_by: user?.id, updated_at: new Date().toISOString() })
          .eq("id", editingFaq.id);

        if (error) throw error;
        toast({ title: "השאלה עודכנה בהצלחה" });
      } else {
        const { error } = await supabase
          .from("faqs")
          .insert([{ ...formData, updated_by: user?.id }]);

        if (error) throw error;
        toast({ title: "השאלה נוספה בהצלחה" });
      }

      setDialogOpen(false);
      setEditingFaq(null);
      setFormData({ question: "", answer: "", order_index: 0, is_active: true });
      fetchFAQs();
    } catch (error: any) {
      handleError(error, "לא ניתן לשמור את השאלה", "FAQs.handleSubmit");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "השאלה נמחקה בהצלחה" });
      fetchFAQs();
    } catch (error: any) {
      handleError(error, "לא ניתן למחוק את השאלה", "FAQs.handleDelete");
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const index = faqs.findIndex((f) => f.id === id);
    if ((direction === "up" && index === 0) || (direction === "down" && index === faqs.length - 1)) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[index]];

    try {
      await Promise.all(
        newFaqs.map((faq, i) =>
          supabase.from("faqs").update({ order_index: i }).eq("id", faq.id)
        )
      );
      fetchFAQs();
    } catch (error: any) {
      toast({
        title: "שגיאה בשינוי סדר",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black cyber-glow mb-2">שאלות נפוצות</h1>
          <p className="text-muted-foreground">נהל את השאלות והתשובות באתר</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingFaq(null); setFormData({ question: "", answer: "", order_index: faqs.length, is_active: true }); }}>
              <Plus className="ml-2 h-4 w-4" />
              הוסף שאלה
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>{editingFaq ? "ערוך שאלה" : "הוסף שאלה חדשה"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>שאלה</Label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="הכנס את השאלה..."
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label>תשובה</Label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="הכנס את התשובה..."
                  className="text-right min-h-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>פעיל</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingFaq ? "עדכן" : "הוסף"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-panel rounded-lg border border-primary/20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שאלה</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">סדר</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.map((faq, index) => (
              <TableRow key={faq.id}>
                <TableCell className="text-right max-w-md truncate">{faq.question}</TableCell>
                <TableCell className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${faq.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                    {faq.is_active ? 'פעיל' : 'לא פעיל'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReorder(faq.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReorder(faq.id, "down")}
                      disabled={index === faqs.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingFaq(faq);
                        setFormData(faq);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-panel">
                        <AlertDialogHeader>
                          <AlertDialogTitle>למחוק שאלה זו?</AlertDialogTitle>
                          <AlertDialogDescription>
                            פעולה זו לא ניתנת לביטול. השאלה תימחק לצמיתות.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(faq.id)}>מחק</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FAQs;
