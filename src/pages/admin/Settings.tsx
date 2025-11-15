import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    calendly_link: "",
    instagram_url: "",
    telegram_url: "",
    email: "",
    single_session_price: "",
    package_session_price: "",
    single_session_description: "",
    package_session_description: "",
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
        acc[item.setting_key] = item.setting_value || "";
        return acc;
      }, {});

      setSettings(settingsObj);
    } catch (error: any) {
      toast({
        title: "שגיאה בטעינת הגדרות",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .update({ setting_value: update.setting_value, updated_at: update.updated_at, updated_by: update.updated_by })
          .eq("setting_key", update.setting_key);

        if (error) throw error;
      }

      toast({
        title: "ההגדרות נשמרו בהצלחה",
        description: "השינויים עודכנו באתר",
      });
    } catch (error: any) {
      toast({
        title: "שגיאה בשמירת הגדרות",
        description: error.message,
        variant: "destructive",
      });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black cyber-glow mb-2">הגדרות</h1>
        <p className="text-muted-foreground">נהל את הגדרות האתר והתוכן</p>
      </div>

      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle>קישורי חיצוניים</CardTitle>
          <CardDescription>נהל קישורים לשירותים חיצוניים</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendly_link">קישור Calendly</Label>
            <Input
              id="calendly_link"
              value={settings.calendly_link}
              onChange={(e) => setSettings({ ...settings, calendly_link: e.target.value })}
              placeholder="https://calendly.com/..."
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_url">Instagram</Label>
            <Input
              id="instagram_url"
              value={settings.instagram_url}
              onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
              placeholder="https://instagram.com/..."
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram_url">Telegram</Label>
            <Input
              id="telegram_url"
              value={settings.telegram_url}
              onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
              placeholder="https://t.me/..."
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="contact@example.com"
              className="text-right"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle>תמחור</CardTitle>
          <CardDescription>נהל מחירי המפגשים והחבילות</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="single_session_price">מחיר מפגש בודד (₪)</Label>
              <Input
                id="single_session_price"
                type="number"
                value={settings.single_session_price}
                onChange={(e) => setSettings({ ...settings, single_session_price: e.target.value })}
                placeholder="250"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="package_session_price">מחיר חבילת 4 מפגשים (₪)</Label>
              <Input
                id="package_session_price"
                type="number"
                value={settings.package_session_price}
                onChange={(e) => setSettings({ ...settings, package_session_price: e.target.value })}
                placeholder="800"
                className="text-right"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="single_session_description">תיאור מפגש בודד</Label>
            <Textarea
              id="single_session_description"
              value={settings.single_session_description}
              onChange={(e) => setSettings({ ...settings, single_session_description: e.target.value })}
              placeholder="מפגש אחד של 90 דקות"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="package_session_description">תיאור חבילת מפגשים</Label>
            <Textarea
              id="package_session_description"
              value={settings.package_session_description}
              onChange={(e) => setSettings({ ...settings, package_session_description: e.target.value })}
              placeholder="4 מפגשים של 90 דקות כל אחד"
              className="text-right"
            />
          </div>

          {settings.single_session_price && settings.package_session_price && (
            <div className="p-4 glass-panel border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                חיסכון בחבילה: ₪{(Number(settings.single_session_price) * 4 - Number(settings.package_session_price))}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg">
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
  );
};

export default Settings;
