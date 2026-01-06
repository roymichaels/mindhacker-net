import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { handleError } from "@/lib/errorHandling";

const settingsSchema = z.object({
  calendly_link: z.string().url("קישור Calendly לא חוקי").or(z.literal("")),
  calendly_enabled: z.boolean(),
  instagram_url: z.string().url("קישור Instagram לא חוקי").or(z.literal("")),
  instagram_enabled: z.boolean(),
  telegram_url: z.string().url("קישור Telegram לא חוקי").or(z.literal("")),
  telegram_enabled: z.boolean(),
  email: z.string().email("כתובת אימייל לא חוקית").max(255, "כתובת אימייל ארוכה מדי"),
  email_enabled: z.boolean(),
  about_image_url: z.string().url("קישור תמונה לא חוקי").or(z.literal("")),
  single_session_price: z.string()
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val > 0, "מחיר חייב להיות מספר חיובי"),
  package_session_price: z.string()
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val > 0, "מחיר חייב להיות מספר חיובי"),
  single_session_description: z.string()
    .min(5, "תיאור חייב להכיל לפחות 5 תווים")
    .max(500, "תיאור ארוך מדי"),
  package_session_description: z.string()
    .min(5, "תיאור חייב להכיל לפחות 5 תווים")
    .max(500, "תיאור ארוך מדי"),
  availability_hours: z.string().optional(),
  // Social proof settings
  happy_clients_count: z.string().optional(),
  success_rate_percent: z.string().optional(),
  habit_break_percent: z.string().optional(),
  spots_available: z.string().optional(),
  // Trust badges
  trust_badge_1: z.string().optional(),
  trust_badge_2: z.string().optional(),
  trust_badge_3: z.string().optional(),
  trust_badge_4: z.string().optional(),
  // WhatsApp settings
  whatsapp_number: z.string().optional(),
  whatsapp_enabled: z.boolean().optional(),
  whatsapp_message: z.string().optional(),
  // Countdown timer
  countdown_end_date: z.string().optional(),
  countdown_enabled: z.boolean().optional(),
  // Personal touch settings
  hero_personal_quote: z.string().optional(),
  pricing_personal_quote: z.string().optional(),
  personal_story: z.string().optional(),
  personal_invitation_message: z.string().optional(),
  hero_video_url: z.string().optional(),
  hero_video_enabled: z.boolean().optional(),
  about_video_url: z.string().optional(),
  about_video_enabled: z.boolean().optional(),
  free_call_calendly_link: z.string().optional(),
  free_call_enabled: z.boolean().optional(),
  introspection_form_url: z.string().optional(),
  guarantee_title: z.string().optional(),
  guarantee_subtitle: z.string().optional(),
  promo_enabled: z.boolean().optional(),
  promo_text: z.string().optional(),
  promo_subtext: z.string().optional(),
});

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingSwitch, setSavingSwitch] = useState<string | null>(null);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    calendly_link: "",
    calendly_enabled: true,
    instagram_url: "",
    instagram_enabled: true,
    telegram_url: "",
    telegram_enabled: true,
    email: "",
    email_enabled: true,
    about_image_url: "",
    single_session_price: "",
    package_session_price: "",
    single_session_description: "",
    package_session_description: "",
    availability_hours: "",
    // Social proof
    happy_clients_count: "200",
    success_rate_percent: "94",
    habit_break_percent: "87",
    spots_available: "3",
    // Trust badges
    trust_badge_1: "100% דיסקרטיות",
    trust_badge_2: "ללא התחייבות",
    trust_badge_3: "10+ שנות ניסיון",
    trust_badge_4: "ליווי אישי",
    // WhatsApp
    whatsapp_number: "",
    whatsapp_enabled: false,
    whatsapp_message: "היי, אני מעוניין לשמוע עוד על השירותים שלכם",
    // Countdown
    countdown_end_date: "",
    countdown_enabled: true,
    // Personal touch
    hero_personal_quote: "אני מחכה לך בצד השני של השינוי",
    pricing_personal_quote: "אני כאן כדי ללוות אותך בכל צעד",
    personal_story: "",
    personal_invitation_message: "אם הגעת עד לכאן, סימן שמשהו בפנים שלך מזמין אותך לשינוי. אני מחכה לשיחה הראשונה שלנו.",
    hero_video_url: "",
    hero_video_enabled: false,
    about_video_url: "",
    about_video_enabled: false,
    free_call_calendly_link: "",
    free_call_enabled: true,
    introspection_form_url: "/form/866eb5a92355da936aea2b7bcb50726cc3f01badf5ebbeaecfff9b2c4aa7539e",
    guarantee_title: "",
    guarantee_subtitle: "",
    promo_enabled: true,
    promo_text: "",
    promo_subtext: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");

      if (error) throw error;

      const settingsObj = data.reduce((acc: any, item) => {
        if (item.setting_key.endsWith('_enabled')) {
          acc[item.setting_key] = item.setting_value === 'true';
        } else {
          acc[item.setting_key] = item.setting_value || "";
        }
        return acc;
      }, {});

      setSettings({
        calendly_link: settingsObj.calendly_link || "",
        calendly_enabled: settingsObj.calendly_enabled ?? true,
        instagram_url: settingsObj.instagram_url || "",
        instagram_enabled: settingsObj.instagram_enabled ?? true,
        telegram_url: settingsObj.telegram_url || "",
        telegram_enabled: settingsObj.telegram_enabled ?? true,
        email: settingsObj.email || "",
        email_enabled: settingsObj.email_enabled ?? true,
        about_image_url: settingsObj.about_image_url || "",
        single_session_price: settingsObj.single_session_price || "",
        package_session_price: settingsObj.package_session_price || "",
        single_session_description: settingsObj.single_session_description || "",
        package_session_description: settingsObj.package_session_description || "",
        availability_hours: settingsObj.availability_hours || "ראשון-חמישי: 09:00-18:00",
        // Social proof
        happy_clients_count: settingsObj.happy_clients_count || "200",
        success_rate_percent: settingsObj.success_rate_percent || "94",
        habit_break_percent: settingsObj.habit_break_percent || "87",
        spots_available: settingsObj.spots_available || "3",
        // Trust badges
        trust_badge_1: settingsObj.trust_badge_1 || "100% דיסקרטיות",
        trust_badge_2: settingsObj.trust_badge_2 || "ללא התחייבות",
        trust_badge_3: settingsObj.trust_badge_3 || "10+ שנות ניסיון",
        trust_badge_4: settingsObj.trust_badge_4 || "ליווי אישי",
        // WhatsApp
        whatsapp_number: settingsObj.whatsapp_number || "",
        whatsapp_enabled: settingsObj.whatsapp_enabled ?? false,
        whatsapp_message: settingsObj.whatsapp_message || "היי, אני מעוניין לשמוע עוד על השירותים שלכם",
        // Countdown
        countdown_end_date: settingsObj.countdown_end_date || "",
        countdown_enabled: settingsObj.countdown_enabled ?? true,
        // Personal touch
        hero_personal_quote: settingsObj.hero_personal_quote || "אני מחכה לך בצד השני של השינוי",
        pricing_personal_quote: settingsObj.pricing_personal_quote || "אני כאן כדי ללוות אותך בכל צעד",
        personal_story: settingsObj.personal_story || "",
        personal_invitation_message: settingsObj.personal_invitation_message || "אם הגעת עד לכאן, סימן שמשהו בפנים שלך מזמין אותך לשינוי. אני מחכה לשיחה הראשונה שלנו.",
        hero_video_url: settingsObj.hero_video_url || "",
        hero_video_enabled: settingsObj.hero_video_enabled ?? false,
        about_video_url: settingsObj.about_video_url || "",
        about_video_enabled: settingsObj.about_video_enabled ?? false,
        free_call_calendly_link: settingsObj.free_call_calendly_link || "",
        free_call_enabled: settingsObj.free_call_enabled ?? true,
        introspection_form_url: settingsObj.introspection_form_url || "/form/866eb5a92355da936aea2b7bcb50726cc3f01badf5ebbeaecfff9b2c4aa7539e",
        guarantee_title: settingsObj.guarantee_title || "",
        guarantee_subtitle: settingsObj.guarantee_subtitle || "",
        promo_enabled: settingsObj.promo_enabled ?? true,
        promo_text: settingsObj.promo_text || "",
        promo_subtext: settingsObj.promo_subtext || "",
      });
    } catch (error: any) {
      handleError(error, "לא ניתן לטעון את ההגדרות", "Settings.fetchSettings");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "שגיאה",
        description: "יש להעלות קובץ תמונה בלבד",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "שגיאה",
        description: "גודל הקובץ חייב להיות קטן מ-5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (settings.about_image_url) {
        const oldPath = settings.about_image_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('site-images').remove([oldPath]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `about-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);

      setSettings({ ...settings, about_image_url: publicUrl });

      toast({
        title: "התמונה הועלתה בהצלחה",
        description: "אל תשכח לשמור את השינויים",
      });
    } catch (error: any) {
      handleError(error, "לא ניתן להעלות את התמונה", "Settings.handleImageUpload");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSettings(prev => ({ ...prev, about_image_url: "" }));
    toast({
      title: "התמונה הוסרה",
      description: "התמונה הוסרה מהגדרות. לא לשכוח לשמור!",
    });
  };

  const handleSwitchToggle = async (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSavingSwitch(key);

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          setting_key: key,
          setting_value: value.toString(),
          setting_type: "boolean",
        }, {
          onConflict: "setting_key"
        });

      if (error) throw error;

      toast({
        title: "✓ נשמר",
        description: "ההגדרה עודכנה בהצלחה",
      });
    } catch (error) {
      setSettings(prev => ({ ...prev, [key]: !value }));
      handleError(error, "שגיאה בעדכון ההגדרה", "handleSwitchToggle");
    } finally {
      setSavingSwitch(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    const result = settingsSchema.safeParse(settings);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        title: "שגיאת אימות",
        description: firstError.message,
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: typeof value === 'boolean' ? String(value) : value,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({
            setting_key: update.setting_key,
            setting_value: update.setting_value,
            updated_at: update.updated_at,
            updated_by: update.updated_by,
          }, {
            onConflict: "setting_key"
          });

        if (error) throw error;
      }

      toast({
        title: "ההגדרות נשמרו בהצלחה",
        description: "השינויים עודכנו באתר",
      });
    } catch (error: any) {
      handleError(error, "לא ניתן לשמור את ההגדרות", "Settings.handleSave");
    } finally {
      setSaving(false);
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
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-4xl font-black cyber-glow mb-2">הגדרות</h1>
        <p className="text-muted-foreground">נהל את הגדרות האתר והתוכן</p>
      </div>

      <div className="space-y-6">
        {/* External Links Section */}
        <Card>
          <CardHeader>
            <CardTitle>קישורים חיצוניים</CardTitle>
            <CardDescription>
              ניהול קישורים לרשתות חברתיות ושירותים חיצוניים
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Calendly */}
            <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="calendly_link" className="text-base font-medium">קישור Calendly</Label>
                <div className="flex items-center gap-2">
                  {savingSwitch === 'calendly_enabled' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    checked={settings.calendly_enabled}
                    onCheckedChange={(checked) => handleSwitchToggle('calendly_enabled', checked)}
                    disabled={savingSwitch === 'calendly_enabled'}
                  />
                </div>
              </div>
              <Input
                id="calendly_link"
                type="url"
                placeholder="https://calendly.com/your-link"
                value={settings.calendly_link}
                onChange={(e) => setSettings(prev => ({ ...prev, calendly_link: e.target.value }))}
                disabled={!settings.calendly_enabled}
                className="text-left disabled:opacity-50 disabled:cursor-not-allowed"
                dir="ltr"
              />
            </div>

            {/* Instagram */}
            <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="instagram_url" className="text-base font-medium">קישור Instagram</Label>
                <div className="flex items-center gap-2">
                  {savingSwitch === 'instagram_enabled' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    checked={settings.instagram_enabled}
                    onCheckedChange={(checked) => handleSwitchToggle('instagram_enabled', checked)}
                    disabled={savingSwitch === 'instagram_enabled'}
                  />
                </div>
              </div>
              <Input
                id="instagram_url"
                type="url"
                placeholder="https://instagram.com/your-profile"
                value={settings.instagram_url}
                onChange={(e) => setSettings(prev => ({ ...prev, instagram_url: e.target.value }))}
                disabled={!settings.instagram_enabled}
                className="text-left disabled:opacity-50 disabled:cursor-not-allowed"
                dir="ltr"
              />
            </div>

            {/* Telegram */}
            <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="telegram_url" className="text-base font-medium">קישור Telegram</Label>
                <div className="flex items-center gap-2">
                  {savingSwitch === 'telegram_enabled' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    checked={settings.telegram_enabled}
                    onCheckedChange={(checked) => handleSwitchToggle('telegram_enabled', checked)}
                    disabled={savingSwitch === 'telegram_enabled'}
                  />
                </div>
              </div>
              <Input
                id="telegram_url"
                type="url"
                placeholder="https://t.me/your-channel"
                value={settings.telegram_url}
                onChange={(e) => setSettings(prev => ({ ...prev, telegram_url: e.target.value }))}
                disabled={!settings.telegram_enabled}
                className="text-left disabled:opacity-50 disabled:cursor-not-allowed"
                dir="ltr"
              />
            </div>

            {/* Email */}
            <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-base font-medium">כתובת אימייל</Label>
                <div className="flex items-center gap-2">
                  {savingSwitch === 'email_enabled' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    checked={settings.email_enabled}
                    onCheckedChange={(checked) => handleSwitchToggle('email_enabled', checked)}
                    disabled={savingSwitch === 'email_enabled'}
                  />
                </div>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                disabled={!settings.email_enabled}
                className="text-left disabled:opacity-50 disabled:cursor-not-allowed"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <Card>
          <CardHeader>
            <CardTitle>מחירון</CardTitle>
            <CardDescription>
              הגדרות מחירים ותיאורים למוצרים
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Single Session */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">סשן יחיד</h3>
              <div className="space-y-2">
                <Label htmlFor="single_session_price">מחיר (₪)</Label>
                <Input
                  id="single_session_price"
                  type="number"
                  placeholder="500"
                  value={settings.single_session_price}
                  onChange={(e) => setSettings(prev => ({ ...prev, single_session_price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="single_session_description">תיאור</Label>
                <Textarea
                  id="single_session_description"
                  placeholder="תיאור הסשן היחיד..."
                  value={settings.single_session_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, single_session_description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            {/* Package Session */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">חבילת סשנים</h3>
              <div className="space-y-2">
                <Label htmlFor="package_session_price">מחיר (₪)</Label>
                <Input
                  id="package_session_price"
                  type="number"
                  placeholder="1500"
                  value={settings.package_session_price}
                  onChange={(e) => setSettings(prev => ({ ...prev, package_session_price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="package_session_description">תיאור</Label>
                <Textarea
                  id="package_session_description"
                  placeholder="תיאור חבילת הסשנים..."
                  value={settings.package_session_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, package_session_description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Image Section */}
        <Card>
          <CardHeader>
            <CardTitle>תמונת אודות</CardTitle>
            <CardDescription>
              העלה תמונה שתוצג בדף האודות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings.about_image_url ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={settings.about_image_url}
                    alt="About"
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    העלה תמונה (עד 5MB)
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="max-w-xs mx-auto"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Availability Hours Section */}
        <Card>
          <CardHeader>
            <CardTitle>שעות זמינות</CardTitle>
            <CardDescription>
              הגדר את שעות הפעילות שלך שיוצגו ללקוחות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="availability_hours">שעות זמינות</Label>
              <Textarea
                id="availability_hours"
                placeholder="לדוגמה: ראשון-חמישי: 09:00-18:00, שישי: 09:00-13:00"
                value={settings.availability_hours}
                onChange={(e) => setSettings(prev => ({ ...prev, availability_hours: e.target.value }))}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                הגדר את שעות הפעילות שלך. טקסט זה יוצג ללקוחות בעמוד הבית
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Proof Section */}
        <Card>
          <CardHeader>
            <CardTitle>הוכחה חברתית</CardTitle>
            <CardDescription>
              הגדר את המספרים שיוצגו בעמוד הבית
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="happy_clients_count">מספר לקוחות מרוצים</Label>
                <Input
                  id="happy_clients_count"
                  type="number"
                  placeholder="200"
                  value={settings.happy_clients_count}
                  onChange={(e) => setSettings(prev => ({ ...prev, happy_clients_count: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="success_rate_percent">אחוז שינוי מהמפגש הראשון</Label>
                <Input
                  id="success_rate_percent"
                  type="number"
                  placeholder="94"
                  value={settings.success_rate_percent}
                  onChange={(e) => setSettings(prev => ({ ...prev, success_rate_percent: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="habit_break_percent">אחוז שברו הרגלים תוך 4 מפגשים</Label>
                <Input
                  id="habit_break_percent"
                  type="number"
                  placeholder="87"
                  value={settings.habit_break_percent}
                  onChange={(e) => setSettings(prev => ({ ...prev, habit_break_percent: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spots_available">מקומות פנויים השבוע</Label>
                <Input
                  id="spots_available"
                  type="number"
                  placeholder="3"
                  value={settings.spots_available}
                  onChange={(e) => setSettings(prev => ({ ...prev, spots_available: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle>תגי אמון</CardTitle>
            <CardDescription>
              הגדר את תגי האמון שיוצגו מתחת לכותרת הראשית
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trust_badge_1">תג אמון 1</Label>
                <Input
                  id="trust_badge_1"
                  placeholder="100% דיסקרטיות"
                  value={settings.trust_badge_1}
                  onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_1: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trust_badge_2">תג אמון 2</Label>
                <Input
                  id="trust_badge_2"
                  placeholder="ללא התחייבות"
                  value={settings.trust_badge_2}
                  onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_2: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trust_badge_3">תג אמון 3</Label>
                <Input
                  id="trust_badge_3"
                  placeholder="10+ שנות ניסיון"
                  value={settings.trust_badge_3}
                  onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_3: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trust_badge_4">תג אמון 4</Label>
                <Input
                  id="trust_badge_4"
                  placeholder="ליווי אישי"
                  value={settings.trust_badge_4}
                  onChange={(e) => setSettings(prev => ({ ...prev, trust_badge_4: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Section */}
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>
              הגדר את כפתור הוואטסאפ הצף
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp_number" className="text-base font-medium">הפעל כפתור WhatsApp</Label>
                <div className="flex items-center gap-2">
                  {savingSwitch === 'whatsapp_enabled' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    checked={settings.whatsapp_enabled}
                    onCheckedChange={(checked) => handleSwitchToggle('whatsapp_enabled', checked)}
                    disabled={savingSwitch === 'whatsapp_enabled'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">מספר טלפון (עם קידומת מדינה)</Label>
                <Input
                  id="whatsapp_number"
                  placeholder="972501234567"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  disabled={!settings.whatsapp_enabled}
                  className="text-left disabled:opacity-50"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp_message">הודעה ראשונית</Label>
                <Textarea
                  id="whatsapp_message"
                  placeholder="היי, אני מעוניין לשמוע עוד..."
                  value={settings.whatsapp_message}
                  onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_message: e.target.value }))}
                  disabled={!settings.whatsapp_enabled}
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Countdown Timer Section */}
        <Card>
          <CardHeader>
            <CardTitle>טיימר ספירה לאחור</CardTitle>
            <CardDescription>
              הגדר את תאריך סיום המבצע שיוצג בדף המחירים
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="countdown_enabled" className="text-base font-medium">הפעל טיימר ספירה לאחור</Label>
                <div className="flex items-center gap-2">
                  {savingSwitch === 'countdown_enabled' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    checked={settings.countdown_enabled}
                    onCheckedChange={(checked) => handleSwitchToggle('countdown_enabled', checked)}
                    disabled={savingSwitch === 'countdown_enabled'}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="countdown_end_date">תאריך סיום המבצע</Label>
                <Input
                  id="countdown_end_date"
                  type="datetime-local"
                  value={settings.countdown_end_date}
                  onChange={(e) => setSettings(prev => ({ ...prev, countdown_end_date: e.target.value }))}
                  disabled={!settings.countdown_enabled}
                  className="text-left disabled:opacity-50"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  בחר תאריך ושעה שבהם המבצע יסתיים. הטיימר ייעלם אוטומטית לאחר התאריך שנקבע.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Touch Section */}
        <Card>
          <CardHeader>
            <CardTitle>מגע אישי</CardTitle>
            <CardDescription>
              הגדרות לתוכן אישי ומסרים מותאמים
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Quotes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ציטוטים אישיים</h3>
              <div className="space-y-2">
                <Label htmlFor="hero_personal_quote">ציטוט בהירו (לפני כפתור CTA)</Label>
                <Input
                  id="hero_personal_quote"
                  placeholder="אני מחכה לך בצד השני של השינוי"
                  value={settings.hero_personal_quote}
                  onChange={(e) => setSettings(prev => ({ ...prev, hero_personal_quote: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing_personal_quote">ציטוט בעמוד המחירים</Label>
                <Input
                  id="pricing_personal_quote"
                  placeholder="אני כאן כדי ללוות אותך בכל צעד"
                  value={settings.pricing_personal_quote}
                  onChange={(e) => setSettings(prev => ({ ...prev, pricing_personal_quote: e.target.value }))}
                />
              </div>
            </div>

            {/* Personal Story */}
            <div className="space-y-2">
              <Label htmlFor="personal_story">הסיפור האישי שלך (בעמוד אודות)</Label>
              <Textarea
                id="personal_story"
                placeholder="ספר על עצמך, למה התחלת את הדרך הזו..."
                value={settings.personal_story}
                onChange={(e) => setSettings(prev => ({ ...prev, personal_story: e.target.value }))}
                rows={4}
              />
            </div>

            {/* Personal Invitation */}
            <div className="space-y-2">
              <Label htmlFor="personal_invitation_message">הודעת הזמנה אישית (לפני הפוטר)</Label>
              <Textarea
                id="personal_invitation_message"
                placeholder="אם הגעת עד לכאן..."
                value={settings.personal_invitation_message}
                onChange={(e) => setSettings(prev => ({ ...prev, personal_invitation_message: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Hero Video */}
            <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">וידאו אישי בהירו</Label>
                <Switch
                  checked={settings.hero_video_enabled}
                  onCheckedChange={(checked) => handleSwitchToggle('hero_video_enabled', checked)}
                />
              </div>
              <Input
                placeholder="קישור YouTube"
                value={settings.hero_video_url}
                onChange={(e) => setSettings(prev => ({ ...prev, hero_video_url: e.target.value }))}
                disabled={!settings.hero_video_enabled}
                dir="ltr"
              />
            </div>

            {/* About Video */}
            <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">וידאו הכרות (בעמוד אודות)</Label>
                <Switch
                  checked={settings.about_video_enabled}
                  onCheckedChange={(checked) => handleSwitchToggle('about_video_enabled', checked)}
                />
              </div>
              <Input
                placeholder="קישור YouTube"
                value={settings.about_video_url}
                onChange={(e) => setSettings(prev => ({ ...prev, about_video_url: e.target.value }))}
                disabled={!settings.about_video_enabled}
                dir="ltr"
              />
            </div>

            {/* Free Discovery Call */}
            <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/50">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">שיחת היכרות חינם</Label>
                <Switch
                  checked={settings.free_call_enabled}
                  onCheckedChange={(checked) => handleSwitchToggle('free_call_enabled', checked)}
                />
              </div>
              <Input
                placeholder="קישור Calendly לשיחת היכרות"
                value={settings.free_call_calendly_link}
                onChange={(e) => setSettings(prev => ({ ...prev, free_call_calendly_link: e.target.value }))}
                disabled={!settings.free_call_enabled}
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="min-w-[200px]"
        >
          {saving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              שומר...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              שמור שינויים
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
