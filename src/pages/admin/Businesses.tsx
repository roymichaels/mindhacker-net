import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Search, Eye, User, CheckCircle2, Clock, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

interface BusinessJourney {
  id: string;
  user_id: string;
  business_name: string | null;
  current_step: number;
  journey_complete: boolean;
  step_1_vision: Json | null;
  step_2_business_model: Json | null;
  step_3_target_audience: Json | null;
  step_4_value_proposition: Json | null;
  step_5_challenges: Json | null;
  step_6_resources: Json | null;
  step_7_financial: Json | null;
  step_8_marketing: Json | null;
  step_9_operations: Json | null;
  step_10_action_plan: Json | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
  user_name: string | null;
  profile_id: string;
}

const Businesses = () => {
  const { language, t } = useTranslation();
  const isHebrew = language === 'he';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessJourney | null>(null);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_journeys')
        .select(`
          *,
          profiles!business_journeys_user_id_fkey (
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item,
        user_name: item.profiles?.full_name || null,
        profile_id: item.profiles?.id || item.user_id,
      })) as BusinessJourney[];
    },
  });

  // Calculate stats
  const totalBusinesses = businesses.length;
  const completedCount = businesses.filter(b => b.journey_complete).length;
  const inProgressCount = businesses.filter(b => !b.journey_complete).length;
  const todayCount = businesses.filter(b => {
    const created = new Date(b.created_at);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;

  // Filter businesses
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = 
      (business.business_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (business.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'completed' && business.journey_complete) ||
      (statusFilter === 'in-progress' && !business.journey_complete);

    return matchesSearch && matchesStatus;
  });

  const getIndustry = (stepData: Json | null): string => {
    if (!stepData || typeof stepData !== 'object') return '-';
    const data = stepData as Record<string, any>;
    return data.industry || data.businessType || '-';
  };

  const renderStepData = (title: string, data: Json | null) => {
    if (!data) return null;
    
    return (
      <div className="border rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-sm text-primary">{title}</h4>
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {typeof data === 'object' ? (
            <div className="space-y-1">
              {Object.entries(data as Record<string, any>).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}: </span>
                  <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            String(data)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Briefcase}
        titleKey={isHebrew ? 'עסקים' : 'Businesses'}
        subtitleKey={isHebrew ? 'ניהול מסעות עסקיים של משתמשים' : 'Manage user business journeys'}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'סה"כ עסקים' : 'Total Businesses'}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBusinesses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'בתהליך' : 'In Progress'}
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{inProgressCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'הושלמו' : 'Completed'}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'נוצרו היום' : 'Created Today'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isHebrew ? 'חיפוש לפי שם עסק או משתמש...' : 'Search by business or user name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={isHebrew ? 'סטטוס' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isHebrew ? 'הכל' : 'All'}</SelectItem>
            <SelectItem value="in-progress">{isHebrew ? 'בתהליך' : 'In Progress'}</SelectItem>
            <SelectItem value="completed">{isHebrew ? 'הושלמו' : 'Completed'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isHebrew ? 'שם העסק' : 'Business Name'}</TableHead>
                <TableHead>{isHebrew ? 'משתמש' : 'User'}</TableHead>
                <TableHead>{isHebrew ? 'התקדמות' : 'Progress'}</TableHead>
                <TableHead>{isHebrew ? 'סטטוס' : 'Status'}</TableHead>
                <TableHead>{isHebrew ? 'תעשייה' : 'Industry'}</TableHead>
                <TableHead>{isHebrew ? 'נוצר' : 'Created'}</TableHead>
                <TableHead>{isHebrew ? 'פעולות' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {isHebrew ? 'טוען...' : 'Loading...'}
                  </TableCell>
                </TableRow>
              ) : filteredBusinesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {isHebrew ? 'לא נמצאו עסקים' : 'No businesses found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBusinesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell className="font-medium">
                      {business.business_name || (isHebrew ? 'ללא שם' : 'Unnamed')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {business.user_name || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{business.current_step}/10</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={business.journey_complete ? 'default' : 'secondary'}>
                        {business.journey_complete 
                          ? (isHebrew ? 'הושלם' : 'Completed')
                          : (isHebrew ? 'בתהליך' : 'In Progress')
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>{getIndustry(business.step_2_business_model)}</TableCell>
                    <TableCell>{format(new Date(business.created_at), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBusiness(business)}
                      >
                        <Eye className="h-4 w-4 me-1" />
                        {isHebrew ? 'צפה' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBusiness} onOpenChange={() => setSelectedBusiness(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {selectedBusiness?.business_name || (isHebrew ? 'פרטי מסע עסקי' : 'Business Journey Details')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pe-4">
            {selectedBusiness && (
              <div className="space-y-4">
                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b pb-4">
                  <div>
                    <span className="font-medium">{isHebrew ? 'משתמש: ' : 'User: '}</span>
                    {selectedBusiness.user_name || '-'}
                  </div>
                  <div>
                    <span className="font-medium">{isHebrew ? 'התקדמות: ' : 'Progress: '}</span>
                    {selectedBusiness.current_step}/10
                  </div>
                  <div>
                    <span className="font-medium">{isHebrew ? 'נוצר: ' : 'Created: '}</span>
                    {format(new Date(selectedBusiness.created_at), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>

                {/* AI Summary */}
                {selectedBusiness.ai_summary && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-primary mb-2">
                      {isHebrew ? 'סיכום AI' : 'AI Summary'}
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedBusiness.ai_summary}</p>
                  </div>
                )}

                {/* Steps Data */}
                <div className="space-y-3">
                  {renderStepData(isHebrew ? 'שלב 1: חזון' : 'Step 1: Vision', selectedBusiness.step_1_vision)}
                  {renderStepData(isHebrew ? 'שלב 2: מודל עסקי' : 'Step 2: Business Model', selectedBusiness.step_2_business_model)}
                  {renderStepData(isHebrew ? 'שלב 3: קהל יעד' : 'Step 3: Target Audience', selectedBusiness.step_3_target_audience)}
                  {renderStepData(isHebrew ? 'שלב 4: הצעת ערך' : 'Step 4: Value Proposition', selectedBusiness.step_4_value_proposition)}
                  {renderStepData(isHebrew ? 'שלב 5: אתגרים' : 'Step 5: Challenges', selectedBusiness.step_5_challenges)}
                  {renderStepData(isHebrew ? 'שלב 6: משאבים' : 'Step 6: Resources', selectedBusiness.step_6_resources)}
                  {renderStepData(isHebrew ? 'שלב 7: תוכנית פיננסית' : 'Step 7: Financial Plan', selectedBusiness.step_7_financial)}
                  {renderStepData(isHebrew ? 'שלב 8: שיווק' : 'Step 8: Marketing', selectedBusiness.step_8_marketing)}
                  {renderStepData(isHebrew ? 'שלב 9: תפעול' : 'Step 9: Operations', selectedBusiness.step_9_operations)}
                  {renderStepData(isHebrew ? 'שלב 10: תוכנית פעולה' : 'Step 10: Action Plan', selectedBusiness.step_10_action_plan)}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Businesses;
