import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, MessageSquare, UserPlus, MoreVertical, Eye } from 'lucide-react';
import { useCoachClients, useCoachClientStats } from '@/hooks/useCoachClients';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MyClients = () => {
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const { data: clients, isLoading } = useCoachClients();
  const { stats } = useCoachClientStats();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">{isHebrew ? 'פעיל' : 'Active'}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{isHebrew ? 'לא פעיל' : 'Inactive'}</Badge>;
      case 'completed':
        return <Badge variant="outline">{isHebrew ? 'הושלם' : 'Completed'}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInitial = (name: string | null | undefined): string => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            {isHebrew ? 'הלקוחות שלי' : 'My Clients'}
          </h1>
          <p className="text-muted-foreground">
            {isHebrew ? 'נהל את הלקוחות והמטופלים שלך' : 'Manage your clients and patients'}
          </p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 me-2" />
          {isHebrew ? 'הוסף לקוח' : 'Add Client'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'סה"כ לקוחות' : 'Total Clients'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'לקוחות פעילים' : 'Active Clients'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {isLoading ? <Skeleton className="h-9 w-16" /> : stats.active}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'הושלמו' : 'Completed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : stats.completed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>{isHebrew ? 'רשימת לקוחות' : 'Client List'}</CardTitle>
          <CardDescription>
            {isHebrew ? 'כל הלקוחות המקושרים אליך' : 'All clients linked to you'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : clients?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {isHebrew ? 'עדיין אין לך לקוחות' : 'No clients yet'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {isHebrew
                  ? 'הוסף לקוחות כדי לנהל את הקשר איתם'
                  : 'Add clients to manage your relationships with them'}
              </p>
              <Button>
                <UserPlus className="h-4 w-4 me-2" />
                {isHebrew ? 'הוסף לקוח ראשון' : 'Add First Client'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {clients?.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        {getInitial(client.profile?.full_name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {client.profile?.full_name || (isHebrew ? 'לקוח ללא שם' : 'Unnamed Client')}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(client.created_at), 'PP', {
                            locale: isHebrew ? he : undefined,
                          })}
                        </span>
                        {client.notes && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {isHebrew ? 'יש הערות' : 'Has notes'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(client.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/coach/clients/${client.id}`}>
                            <Eye className="h-4 w-4 me-2" />
                            {isHebrew ? 'צפה בפרופיל' : 'View Profile'}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 me-2" />
                          {isHebrew ? 'שלח הודעה' : 'Send Message'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 me-2" />
                          {isHebrew ? 'קבע פגישה' : 'Schedule Session'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyClients;
