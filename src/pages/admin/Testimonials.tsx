import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Star, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { z } from "zod";
import { handleError } from "@/lib/errorHandling";

const testimonialSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "שם חייב להכיל לפחות 2 תווים")
    .max(100, "שם ארוך מדי"),
  role: z.string()
    .trim()
    .max(100, "תפקיד ארוך מדי")
    .optional()
    .or(z.literal("")),
  quote: z.string()
    .trim()
    .min(10, "ציטוט חייב להכיל לפחות 10 תווים")
    .max(1000, "ציטוט ארוך מדי"),
  avatar_url: z.string()
    .optional()
    .or(z.literal("")),
  initials: z.string()
    .max(3, "ראשי תיבות ארוכים מדי")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  order_index: z.number().int().nonnegative()
});

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  avatar_url: string | null;
  initials: string | null;
  order_index: number;
  is_active: boolean;
  is_featured: boolean;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    quote: "",
    avatar_url: "",
    initials: "",
    order_index: 0,
    is_active: true,
    is_featured: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: any) {
      handleError(error, "לא ניתן לטעון את ההמלצות", "Testimonials.fetchTestimonials");
    } finally {
      setLoading(false);
    }
  };

  const generateInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "שגיאה",
        description: "יש להעלות קובץ תמונה בלבד",
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "שגיאה",
        description: "גודל הקובץ חייב להיות קטן מ-5MB",
        variant: "destructive",
      });
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Delete old image if exists
      if (formData.avatar_url) {
        const oldPath = formData.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('site-images').remove([oldPath]);
        }
      }

      // Upload new image
      const fileExt = file.name.split('.').pop();
      const fileName = `testimonial-${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: "התמונה הועלתה בהצלחה",
        description: "התמונה נוספה להמלצה",
      });
      
      // Clear the input
      event.target.value = '';
    } catch (error: any) {
      handleError(error, "לא ניתן להעלות את התמונה", "Testimonials.handleImageUpload");
      event.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, avatar_url: "" });
  };

  const handleSubmit = async () => {
    // Validate form data
    const result = testimonialSchema.safeParse(formData);
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
      const dataToSubmit = {
        ...formData,
        initials: formData.initials || generateInitials(formData.name),
        updated_by: user?.id,
      };

      if (editingTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update({ ...dataToSubmit, updated_at: new Date().toISOString() })
          .eq("id", editingTestimonial.id);

        if (error) throw error;
        toast({ title: "ההמלצה עודכנה בהצלחה" });
      } else {
        const { error } = await supabase
          .from("testimonials")
          .insert([dataToSubmit]);

        if (error) throw error;
        toast({ title: "ההמלצה נוספה בהצלחה" });
      }

      setDialogOpen(false);
      setEditingTestimonial(null);
      setFormData({
        name: "",
        role: "",
        quote: "",
        avatar_url: "",
        initials: "",
        order_index: 0,
        is_active: true,
        is_featured: false,
      });
      fetchTestimonials();
    } catch (error: any) {
      handleError(error, "לא ניתן לשמור את ההמלצה", "Testimonials.handleSubmit");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "ההמלצה נמחקה בהצלחה" });
      fetchTestimonials();
    } catch (error: any) {
      handleError(error, "לא ניתן למחוק את ההמלצה", "Testimonials.handleDelete");
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_featured: !currentFeatured })
        .eq("id", id);

      if (error) throw error;
      toast({ title: currentFeatured ? "הוסר ממומלצים" : "סומן כמומלץ" });
      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "שגיאה",
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
          <h1 className="text-4xl font-black cyber-glow mb-2">המלצות</h1>
          <p className="text-muted-foreground">נהל את ההמלצות המוצגות באתר</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTestimonial(null);
              setFormData({
                name: "",
                role: "",
                quote: "",
                avatar_url: "",
                initials: "",
                order_index: testimonials.length,
                is_active: true,
                is_featured: false,
              });
            }}>
              <Plus className="ml-2 h-4 w-4" />
              הוסף המלצה
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? "ערוך המלצה" : "הוסף המלצה חדשה"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>שם מלא</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="שם מלא"
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label>תפקיד</Label>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="תפקיד או תואר"
                    className="text-right"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>המלצה</Label>
                <Textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="הכנס את ההמלצה..."
                  className="text-right min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label>תמונת פרופיל (אופציונלי)</Label>
                {formData.avatar_url ? (
                  <div className="space-y-2">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20">
                      <img 
                        src={formData.avatar_url} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="text-right"
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  אם לא תעלה תמונה, יוצגו ראשי תיבות (מקסימום 5MB)
                </p>
              </div>

              <div className="space-y-2">
                <Label>ראשי תיבות (יתמלא אוטומטית אם ריק)</Label>
                <Input
                  value={formData.initials}
                  onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                  placeholder="א.ב"
                  className="text-right"
                  maxLength={3}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center justify-between flex-1">
                  <Label>פעיל</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <Label>מומלץ</Label>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingTestimonial ? "עדכן" : "הוסף"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="glass-panel border-primary/20 relative">
            <CardContent className="p-6">
              {testimonial.is_featured && (
                <Star className="absolute top-4 left-4 h-5 w-5 text-yellow-500 fill-yellow-500" />
              )}
              
              <div className="flex items-start gap-4 mb-4">
                <Avatar>
                  {testimonial.avatar_url && <AvatarImage src={testimonial.avatar_url} />}
                  <AvatarFallback className="bg-primary/20">
                    {testimonial.initials || generateInitials(testimonial.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold">{testimonial.name}</h3>
                  {testimonial.role && (
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  )}
                </div>
              </div>

              <p className="text-sm mb-4 line-clamp-3">{testimonial.quote}</p>

              <div className="flex gap-2 items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${testimonial.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                  {testimonial.is_active ? 'פעיל' : 'לא פעיל'}
                </span>
                
                <div className="flex gap-2 mr-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFeatured(testimonial.id, testimonial.is_featured)}
                  >
                    <Star className={`h-4 w-4 ${testimonial.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingTestimonial(testimonial);
                      setFormData(testimonial);
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
                        <AlertDialogTitle>למחוק המלצה זו?</AlertDialogTitle>
                        <AlertDialogDescription>
                          פעולה זו לא ניתנת לביטול. ההמלצה תימחק לצמיתות.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ביטול</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(testimonial.id)}>מחק</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
