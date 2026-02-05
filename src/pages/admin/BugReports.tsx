import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import {
  Bug,
  Monitor,
  Zap,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type BugStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
type BugCategory = 'ui' | 'performance' | 'feature' | 'other';
type BugPriority = 'low' | 'medium' | 'high' | 'critical';

interface BugReport {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  category: BugCategory;
  priority: BugPriority;
  page_path: string;
  page_url: string;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen_size: string | null;
  screenshot_url: string | null;
  contact_email: string | null;
  status: BugStatus;
  admin_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null } | null;
}

const statusConfig: Record<BugStatus, { color: string; icon: React.ElementType }> = {
  new: { color: 'bg-blue-500', icon: Clock },
  in_progress: { color: 'bg-yellow-500', icon: Loader2 },
  resolved: { color: 'bg-green-500', icon: CheckCircle },
  closed: { color: 'bg-gray-500', icon: XCircle },
};

const priorityConfig: Record<BugPriority, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const categoryIcons: Record<BugCategory, React.ElementType> = {
  ui: Monitor,
  performance: Zap,
  feature: AlertCircle,
  other: HelpCircle,
};

const BugReports = () => {
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dateLocale = language === 'he' ? he : enUS;

  const [statusFilter, setStatusFilter] = useState<BugStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<BugPriority | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch bug reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ['bug-reports', statusFilter, priorityFilter],
    queryFn: async () => {
      let query = supabase
        .from('bug_reports')
        .select('*, profiles!bug_reports_user_id_fkey(full_name)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BugReport[];
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: BugStatus; notes?: string }) => {
      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user?.id;
      }

      if (notes !== undefined) {
        updates.admin_notes = notes;
      }

      const { error } = await supabase
        .from('bug_reports')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug-reports'] });
      toast({ title: t('common.success'), description: 'Status updated' });
      setSelectedReport(null);
    },
    onError: () => {
      toast({ title: t('common.error'), variant: 'destructive' });
    },
  });

  const getStatusLabel = (status: BugStatus) => {
    const labels: Record<BugStatus, string> = {
      new: t('bugReport.statusNew'),
      in_progress: t('bugReport.statusInProgress'),
      resolved: t('bugReport.statusResolved'),
      closed: t('bugReport.statusClosed'),
    };
    return labels[status];
  };

  const getCategoryLabel = (category: BugCategory) => {
    const labels: Record<BugCategory, string> = {
      ui: t('bugReport.categoryUI'),
      performance: t('bugReport.categoryPerformance'),
      feature: t('bugReport.categoryFeature'),
      other: t('bugReport.categoryOther'),
    };
    return labels[category];
  };

  const getPriorityLabel = (priority: BugPriority) => {
    const labels: Record<BugPriority, string> = {
      low: t('bugReport.priorityLow'),
      medium: t('bugReport.priorityMedium'),
      high: t('bugReport.priorityHigh'),
      critical: t('bugReport.priorityCritical'),
    };
    return labels[priority];
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bug className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{t('bugReport.adminTitle')}</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {reports?.length || 0} {language === 'he' ? 'דיווחים' : 'reports'}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('common.status')}:</span>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as BugStatus | 'all')}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'he' ? 'הכל' : 'All'}</SelectItem>
                <SelectItem value="new">{t('bugReport.statusNew')}</SelectItem>
                <SelectItem value="in_progress">{t('bugReport.statusInProgress')}</SelectItem>
                <SelectItem value="resolved">{t('bugReport.statusResolved')}</SelectItem>
                <SelectItem value="closed">{t('bugReport.statusClosed')}</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm font-medium">{t('bugReport.priority')}:</span>
            <Select
              value={priorityFilter}
              onValueChange={(v) => setPriorityFilter(v as BugPriority | 'all')}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'he' ? 'הכל' : 'All'}</SelectItem>
                <SelectItem value="low">{t('bugReport.priorityLow')}</SelectItem>
                <SelectItem value="medium">{t('bugReport.priorityMedium')}</SelectItem>
                <SelectItem value="high">{t('bugReport.priorityHigh')}</SelectItem>
                <SelectItem value="critical">{t('bugReport.priorityCritical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reports?.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="py-12 text-center text-muted-foreground">
            {language === 'he' ? 'אין דיווחי באגים' : 'No bug reports found'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports?.map((report) => {
            const StatusIcon = statusConfig[report.status].icon;
            const CategoryIcon = categoryIcons[report.category];
            const isExpanded = expandedId === report.id;

            return (
              <Card
                key={report.id}
                className={cn(
                  "bg-card/50 backdrop-blur transition-all",
                  report.priority === 'critical' && 'border-red-500/30',
                  report.priority === 'high' && 'border-orange-500/30'
                )}
              >
                <CardContent className="py-4">
                  {/* Main Row */}
                  <div
                    className="flex items-start gap-4 cursor-pointer"
                    onClick={() => toggleExpand(report.id)}
                  >
                    {/* Status */}
                    <div className={cn('p-2 rounded-full', statusConfig[report.status].color)}>
                      <StatusIcon className="h-4 w-4 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{report.title}</h3>
                        <Badge variant="outline" className={priorityConfig[report.priority]}>
                          {getPriorityLabel(report.priority)}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <CategoryIcon className="h-3 w-3" />
                          {getCategoryLabel(report.category)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{format(new Date(report.created_at), 'PPp', { locale: dateLocale })}</span>
                        <span>{report.page_path}</span>
                        {report.profiles?.full_name && (
                          <span>{report.profiles.full_name}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                          setAdminNotes(report.admin_notes || '');
                        }}
                      >
                        {language === 'he' ? 'נהל' : 'Manage'}
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">{t('bugReport.descriptionLabel')}</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {report.description}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">{t('bugReport.deviceInfo')}</h4>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p><strong>Browser:</strong> {report.browser}</p>
                            <p><strong>OS:</strong> {report.os}</p>
                            <p><strong>Device:</strong> {report.device_type}</p>
                            <p><strong>Screen:</strong> {report.screen_size}</p>
                            {report.contact_email && (
                              <p><strong>Email:</strong> {report.contact_email}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {report.screenshot_url && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">{t('bugReport.screenshotLabel')}</h4>
                          <a
                            href={report.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            {language === 'he' ? 'צפה בצילום מסך' : 'View Screenshot'}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      {report.admin_notes && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            {language === 'he' ? 'הערות אדמין' : 'Admin Notes'}
                          </h4>
                          <p className="text-sm text-muted-foreground">{report.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Manage Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'he' ? 'ניהול דיווח' : 'Manage Report'}</DialogTitle>
            <DialogDescription>
              {selectedReport?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('common.status')}</label>
              <Select
                value={selectedReport?.status}
                onValueChange={(v) => {
                  if (selectedReport) {
                    updateStatusMutation.mutate({
                      id: selectedReport.id,
                      status: v as BugStatus,
                      notes: adminNotes,
                    });
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t('bugReport.statusNew')}</SelectItem>
                  <SelectItem value="in_progress">{t('bugReport.statusInProgress')}</SelectItem>
                  <SelectItem value="resolved">{t('bugReport.statusResolved')}</SelectItem>
                  <SelectItem value="closed">{t('bugReport.statusClosed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">
                {language === 'he' ? 'הערות אדמין' : 'Admin Notes'}
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>

            <Button
              onClick={() => {
                if (selectedReport) {
                  updateStatusMutation.mutate({
                    id: selectedReport.id,
                    status: selectedReport.status,
                    notes: adminNotes,
                  });
                }
              }}
              disabled={updateStatusMutation.isPending}
              className="w-full"
            >
              {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {t('common.saveChanges')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BugReports;
