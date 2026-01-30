import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link2, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const MyLinks = () => {
  const { t } = useTranslation();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('panel.linkCopied'));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="h-6 w-6" />
          {t('panel.affiliateLinks')}
        </h1>
        <p className="text-muted-foreground">{t('panel.affiliateLinksDescription')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('panel.yourAffiliateLink')}</CardTitle>
          <CardDescription>{t('panel.shareThisLink')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm break-all">
              https://mindhacker.net/?ref=YOUR_CODE
            </code>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => copyToClipboard('https://mindhacker.net/?ref=YOUR_CODE')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {t('panel.affiliateLinkInstructions')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyLinks;
