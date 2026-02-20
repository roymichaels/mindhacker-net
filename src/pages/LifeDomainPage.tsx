/**
 * LifeDomainPage — Individual domain view.
 * Shows config status, action buttons, and domain details.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { getDomainById } from '@/navigation/lifeDomains';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Settings, Map, Play, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function LifeDomainPage() {
  const { domainId } = useParams<{ domainId: string }>();
  const navigate = useNavigate();
  const { getDomain: getDomainRow, isLoading } = useLifeDomains();
  const { language, isRTL } = useTranslation();
  const isHebrew = language === 'he';

  const domain = domainId ? getDomainById(domainId) : undefined;

  if (!domain) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">{isHebrew ? 'תחום לא נמצא' : 'Domain not found'}</p>
          <Button variant="outline" onClick={() => navigate('/life')}>
            {isHebrew ? 'חזור' : 'Go Back'}
          </Button>
        </div>
      </PageShell>
    );
  }

  const row = getDomainRow(domain.id);
  const status = row?.status ?? 'unconfigured';
  const config = row?.domain_config ?? {};
  const Icon = domain.icon;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const handlePlaceholder = (action: string) => {
    toast.info(isHebrew ? `${action} — יגיע בקרוב` : `${action} — coming in Phase 2`);
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/life')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <BackArrow className="w-4 h-4" />
          {isHebrew ? 'חזרה למערכת חיים' : 'Back to Life System'}
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isHebrew ? domain.labelHe : domain.labelEn}
            </h1>
            <p className="text-muted-foreground text-sm">{domain.description}</p>
          </div>
          <Badge variant={status === 'active' ? 'default' : status === 'configured' ? 'secondary' : 'outline'} className="ml-auto">
            {status === 'active' ? (isHebrew ? 'פעיל' : 'Active') :
             status === 'configured' ? (isHebrew ? 'הוגדר' : 'Configured') :
             (isHebrew ? 'לא הוגדר' : 'Not Set Up')}
          </Badge>
        </div>

        {/* Unconfigured state */}
        {status === 'unconfigured' && (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 flex flex-col items-center gap-4 text-center">
            <Settings className="w-10 h-10 text-primary/60" />
            <h2 className="text-lg font-semibold text-foreground">
              {isHebrew ? 'התחל הגדרה' : 'Start Configuration'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              {isHebrew
                ? 'אורורה תשאל אותך שאלות ממוקדות כדי לבנות תוכנית 90 יום מותאמת אישית לתחום הזה.'
                : 'Aurora will ask you focused questions to build a personalized 90-day plan for this domain.'}
            </p>
            <Button onClick={() => handlePlaceholder('Start Configuration')} size="lg" className="mt-2">
              <Play className="w-4 h-4 mr-2" />
              {isHebrew ? 'התחל שיחה עם אורורה' : 'Start Aurora Intake'}
            </Button>
          </div>
        )}

        {/* Configured state — show config summary */}
        {(status === 'configured' || status === 'active') && (
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground">
              {isHebrew ? 'הגדרות תחום' : 'Domain Configuration'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-foreground">{String(value)}</span>
                </div>
              ))}
              {Object.keys(config).length === 0 && (
                <p className="text-muted-foreground col-span-2">{isHebrew ? 'אין נתונים עדיין' : 'No configuration data yet'}</p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => handlePlaceholder('View Roadmap')}>
            <Map className="w-4 h-4 mr-2" />
            {isHebrew ? 'מפת דרכים' : 'View Roadmap'}
          </Button>
          <Button variant="outline" onClick={() => handlePlaceholder("Today's Execution")}>
            <Play className="w-4 h-4 mr-2" />
            {isHebrew ? 'ביצוע יומי' : "Today's Execution"}
          </Button>
          {status !== 'unconfigured' && (
            <Button variant="outline" onClick={() => handlePlaceholder('Reconfigure (15 Energy)')}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {isHebrew ? 'הגדר מחדש (15 אנרגיה)' : 'Reconfigure (15 Energy)'}
            </Button>
          )}
        </div>
      </div>
    </PageShell>
  );
}
