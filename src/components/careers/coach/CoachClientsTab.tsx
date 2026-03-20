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

const CoachClientsTab = () => {
  const { t, language } = useTranslation();
  const isHebrew = language === 'he';
  const { data: clients, isLoading } = useCoachClients();
  const { stats } = useCoachClientStats();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">{t('panel.clientsMgmt.statusActive')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{t('panel.clientsMgmt.statusInactive')}</Badge>;
      case 'completed':
        return <Badge variant="outline">{t('panel.clientsMgmt.statusCompleted')}</Badge>;
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
      {/* Clients List */}

      {/* Clients List */}
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-5 hover:shadow-md transition-shadow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{t('panel.clientsMgmt.clientList')}</h3>
          <p className="text-sm text-muted-foreground">{t('panel.clientsMgmt.allClientsLinked')}</p>
        </div>
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : clients?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{t('panel.clientsMgmt.noClientsYet')}</p>
              <Button>
                <UserPlus className="h-4 w-4 me-2" />
                {t('panel.clientsMgmt.addFirstClient')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {clients?.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {getInitial(client.profile?.full_name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {client.profile?.full_name || t('panel.clientsMgmt.unnamedClient')}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(client.created_at), 'PP', {
                            locale: isHebrew ? he : undefined,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(client.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/coaches?tab=clients&client=${client.id}`}>
                            <Eye className="h-4 w-4 me-2" />
                            {t('panel.clientsMgmt.viewProfile')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 me-2" />
                          {t('panel.clientsMgmt.sendMessage')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 me-2" />
                          {t('panel.clientsMgmt.scheduleSession')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachClientsTab;
