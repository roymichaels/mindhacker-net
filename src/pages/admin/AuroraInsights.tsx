import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAdminLaunchpadSummaries, useAdminAuroraStats } from '@/hooks/useAdminAuroraInsights';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Users, Target, TrendingUp, Search, Eye, Calendar,
  Sparkles, CheckCircle2, Clock, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import UserSummaryView from '@/components/admin/aurora/UserSummaryView';

const AuroraInsights = () => {
  const { t, language, isRTL } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: summaries, isLoading: summariesLoading } = useAdminLaunchpadSummaries();
  const { data: stats, isLoading: statsLoading } = useAdminAuroraStats();

  const dateLocale = isRTL ? he : enUS;

  // Filter summaries by search
  const filteredSummaries = summaries?.filter(summary => {
    if (!searchQuery) return true;
    const email = summary.profile?.full_name || summary.user_id;
    return email.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return { label: language === 'he' ? 'גבוהה' : 'High', variant: 'default' as const };
    if (score >= 60) return { label: language === 'he' ? 'בינונית' : 'Medium', variant: 'secondary' as const };
    return { label: language === 'he' ? 'נמוכה' : 'Low', variant: 'outline' as const };
  };

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary hidden sm:flex">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black cyber-glow flex items-center gap-2">
              <Brain className="h-6 w-6 sm:hidden text-primary" />
              Aurora Insights
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {language === 'he' 
                ? 'צפייה בסיכומים ותוכניות של משתמשים שעברו את ה-Launchpad'
                : 'View summaries and plans of users who completed Launchpad'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'he' ? 'סה״כ סיכומים' : 'Total Summaries'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalSummaries || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'he' ? 'תוכניות פעילות' : 'Active Plans'}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.activePlans || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'he' ? 'ממוצע תודעה' : 'Avg. Consciousness'}
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats?.avgConsciousness || 0}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'he' ? 'ממוצע מוכנות' : 'Avg. Readiness'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats?.avgReadiness || 0}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {language === 'he' ? 'משתמשים שעברו Launchpad' : 'Users Who Completed Launchpad'}
          </CardTitle>
          <CardDescription>
            {language === 'he' 
              ? `${filteredSummaries.length} משתמשים`
              : `${filteredSummaries.length} users`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'he' ? 'חיפוש לפי שם...' : 'Search by name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10"
            />
          </div>

          {/* Users Table */}
          {summariesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'he' ? 'אין משתמשים שעברו את ה-Launchpad עדיין' : 'No users completed Launchpad yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSummaries.map((summary) => {
                const readiness = getReadinessLabel(summary.transformation_readiness);
                return (
                  <div
                    key={summary.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {summary.profile?.full_name || summary.user_id.slice(0, 8) + '...'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(summary.generated_at), 'dd/MM/yyyy', { locale: dateLocale })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Scores */}
                      <div className="hidden md:flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-amber-500" />
                          <span>{summary.consciousness_score}/100</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{summary.clarity_score}/100</span>
                        </div>
                      </div>

                      <Badge variant={readiness.variant}>
                        {readiness.label}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(summary.user_id)}
                      >
                        <Eye className="h-4 w-4 me-1" />
                        {language === 'he' ? 'צפה' : 'View'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>
              {language === 'he' ? 'סיכום משתמש' : 'User Summary'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-100px)]">
            <UserSummaryView userId={selectedUserId} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuroraInsights;
