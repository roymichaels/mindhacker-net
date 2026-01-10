import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2, Upload, FileText } from "lucide-react";

interface ImportSubscribersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ImportSubscribersDialog = ({ open, onOpenChange, onSuccess }: ImportSubscribersDialogProps) => {
  const { t, isRTL } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailsText, setEmailsText] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[]>([]);

  const parseEmails = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    return [...new Set(matches)]; // Remove duplicates
  };

  const handleTextChange = (text: string) => {
    setEmailsText(text);
    setPreview(parseEmails(text));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const text = await file.text();
    setPreview(parseEmails(text));
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      toast({ title: t('newsletter.import.noEmails'), variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // Check for existing emails
      const { data: existing } = await supabase
        .from("newsletter_subscribers")
        .select("email")
        .in("email", preview);

      const existingEmails = new Set(existing?.map((e) => e.email.toLowerCase()) || []);
      const newEmails = preview.filter((email) => !existingEmails.has(email.toLowerCase()));

      if (newEmails.length === 0) {
        toast({ title: t('newsletter.import.allExist') });
        return;
      }

      // Insert new subscribers
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert(
          newEmails.map((email) => ({
            email,
            status: "active",
            source: "import",
            language: isRTL ? "he" : "en",
          }))
        );

      if (error) throw error;

      toast({ 
        title: t('newsletter.import.success'),
        description: t('newsletter.import.successDesc')
          .replace('{new}', String(newEmails.length))
          .replace('{skipped}', String(existingEmails.size))
      });
      
      onSuccess();
      setEmailsText("");
      setCsvFile(null);
      setPreview([]);
    } catch (error) {
      toast({ title: t('newsletter.import.error'), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('newsletter.actions.import')}</DialogTitle>
          <DialogDescription>{t('newsletter.import.description')}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="paste" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste" className="gap-2">
              <FileText className="h-4 w-4" />
              {t('newsletter.import.paste')}
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-2">
              <Upload className="h-4 w-4" />
              {t('newsletter.import.csv')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label>{t('newsletter.import.pasteEmails')}</Label>
              <Textarea
                value={emailsText}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={6}
                placeholder={t('newsletter.import.pastePlaceholder')}
              />
            </div>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-2">
              <Label>{t('newsletter.import.uploadCsv')}</Label>
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                {t('newsletter.import.csvNote')}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {preview.length > 0 && (
          <div className="space-y-2">
            <Label>{t('newsletter.import.preview')} ({preview.length})</Label>
            <div className="max-h-32 overflow-y-auto border border-primary/20 rounded-lg p-2 text-sm">
              {preview.slice(0, 10).map((email, i) => (
                <div key={i} className="py-1">{email}</div>
              ))}
              {preview.length > 10 && (
                <div className="py-1 text-muted-foreground">
                  +{preview.length - 10} {t('newsletter.import.more')}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleImport} disabled={isLoading || preview.length === 0}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('newsletter.import.importBtn')} ({preview.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSubscribersDialog;
