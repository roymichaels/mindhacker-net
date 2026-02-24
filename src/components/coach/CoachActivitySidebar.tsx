/**
 * CoachActivitySidebar - Right sidebar for client list, pipeline, activity feed & quick actions.
 * All data flows through domain hooks — no direct DB calls.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelLeftClose, PanelLeftOpen, UserPlus, MessageSquare, Calendar, Search, Brain, Loader2 } from 'lucide-react';
import { useCoachClients, useCoachClientStats, useAddCoachClient, PractitionerClient } from '@/hooks/useCoachClients';
import { useMyCoachProfile, useCoachActivityFeed } from '@/domain/coaches';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CoachActivitySidebarProps {
  selectedClientId?: string | null;
  onSelectClient?: (clientId: string | null) => void;
}

export function CoachActivitySidebar({ selectedClientId, onSelectClient }: CoachActivitySidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const [search, setSearch] = useState('');
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { stats } = useCoachClientStats();
  const { data: clients } = useCoachClients();
  const { data: myProfile } = useMyCoachProfile();

  // Add client dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [foundUser, setFoundUser] = useState<{ id: string; full_name: string | null } | null>(null);
  const [searching, setSearching] = useState(false);
  const addClient = useAddCoachClient();

  const filteredClients = (clients || []).filter((c) => {
    if (!search) return true;
    return c.profile?.full_name?.toLowerCase().includes(search.toLowerCase());
  });

  // Activity feed from domain hook
  const { data: rawActivity = [] } = useCoachActivityFeed(myProfile?.id);
  const activityFeed = rawActivity.map(event => ({
    ...event,
    icon: event.type === 'new_client' ? UserPlus : MessageSquare,
    color: event.type === 'new_client' ? 'text-purple-400' : 'text-amber-400',
  }));

  const handleClientClick = (client: PractitionerClient) => {
    onSelectClient?.(selectedClientId === client.id ? null : client.id);
  };

  const handlePlan = () => {
    const activeClients = clients?.filter(c => c.status === 'active') || [];
    if (activeClients.length > 0 && onSelectClient) {
      onSelectClient(activeClients[0].id);
    } else {
      toast.info(isHe ? 'הוסיפו מתאמן קודם כדי ליצור תוכנית' : 'Add a client first to create a plan');
    }
  };

  const handleAdd = () => {
    if (collapsed) setCollapsed(false);
    setAddDialogOpen(true);
  };

  const handleSearchUser = async () => {
    if (!searchName.trim()) return;
    setSearching(true);
    setFoundUser(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${searchName.trim()}%`)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setFoundUser(data);
      } else {
        toast.error(isHe ? 'לא נמצא משתמש' : 'No user found');
      }
    } catch {
      toast.error(isHe ? 'שגיאה בחיפוש' : 'Search error');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!foundUser) return;
    addClient.mutate(
      { clientUserId: foundUser.id },
      {
        onSuccess: () => {
          setAddDialogOpen(false);
          setSearchName('');
          setFoundUser(null);
        },
      }
    );
  };

  const quickActions = [
    { icon: Brain, label: isHe ? 'תוכנית' : 'Plan', color: 'text-indigo-400', onClick: handlePlan },
    { icon: UserPlus, label: isHe ? 'הוסף' : 'Add', color: 'text-purple-400', onClick: handleAdd },
  ];

  return (
    <>
      <aside
        className={cn(
          "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
          "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
          "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
          "ltr:border-e rtl:border-s border-border/50 dark:border-purple-500/15",
          collapsed ? "w-[54px] min-w-[54px]" : "fixed top-14 bottom-14 inset-x-0 z-50 w-full lg:relative lg:top-auto lg:bottom-auto lg:inset-x-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
        )}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
            collapsed
              ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
              : "ltr:right-2 rtl:left-2"
          )}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed
            ? (isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />)
            : (isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)
          }
        </button>

        {/* ===== COLLAPSED MINI VIEW ===== */}
        {collapsed && (
          <div className="flex flex-col items-center justify-between h-full pt-8 pb-3 px-0.5 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
                <div className="w-9 h-9 rounded-full border-2 border-purple-500/40 flex items-center justify-center bg-background/50">
                  <span className="text-[9px] font-bold text-purple-400">{stats.total}</span>
                </div>
                <span className="text-[8px] text-muted-foreground leading-none">{isHe ? 'לקוחות' : 'Clients'}</span>
              </div>

              <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

              {/* Client avatar dots */}
              <div className="flex flex-col items-center gap-1.5">
                {(clients || []).slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCollapsed(false); handleClientClick(c); }}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                      selectedClientId === c.id
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                        : "bg-primary/20 text-primary border border-border/30 hover:bg-primary/30"
                    )}
                    title={c.profile?.full_name || ''}
                  >
                    {c.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </button>
                ))}
              </div>

              <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-1" />

              {quickActions.map((a, i) => (
                <button
                  key={i}
                  onClick={a.onClick}
                  className="p-2 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10 transition-colors"
                  title={a.label}
                >
                  <a.icon className={cn("w-4 h-4", a.color)} />
                </button>
              ))}
            </div>

            <button className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors" title={isHe ? 'פגישות' : 'Sessions'}>
              <Calendar className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        )}

        {/* ===== EXPANDED FULL VIEW ===== */}
        {!collapsed && (
          <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {isHe ? 'הלקוחות שלי' : 'My Clients'}
              </span>
              <div className="flex items-center gap-1">
                {quickActions.map((a) => (
                  <button
                    key={a.label}
                    onClick={a.onClick}
                    className="p-1.5 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10 transition-colors"
                    title={a.label}
                  >
                    <a.icon className={cn("w-3.5 h-3.5", a.color)} />
                  </button>
                ))}
              </div>
            </div>

            {/* Client Stats */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <div className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold leading-none">{stats.total}</span>
                <span className="text-[9px] text-muted-foreground">{isHe ? 'סה"כ' : 'Total'}</span>
              </div>
              <div className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold leading-none text-emerald-400">{stats.active}</span>
                <span className="text-[9px] text-muted-foreground">{isHe ? 'פעילים' : 'Active'}</span>
              </div>
              <div className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold leading-none">{stats.completed}</span>
                <span className="text-[9px] text-muted-foreground">{isHe ? 'הושלמו' : 'Done'}</span>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute ltr:left-2 rtl:right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isHe ? 'חפש מתאמן...' : 'Search client...'}
                className="h-8 text-xs ltr:pl-7 rtl:pr-7 bg-muted/30 border-border/30"
              />
            </div>

            {/* Scrollable Client List */}
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1 mb-2">
              {filteredClients.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">{isHe ? 'אין מתאמנים' : 'No clients'}</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleClientClick(client)}
                    className={cn(
                      "w-full flex items-center gap-2.5 p-2 rounded-xl text-start transition-all",
                      selectedClientId === client.id
                        ? "bg-primary/10 border border-primary/30 shadow-sm"
                        : "hover:bg-muted/40 border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                      selectedClientId === client.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/20 text-primary"
                    )}>
                      {client.profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">
                        {client.profile?.full_name || (isHe ? 'מתאמן' : 'Client')}
                      </p>
                      <p className={cn(
                        "text-[10px]",
                        client.status === 'active' ? 'text-emerald-400' : 'text-muted-foreground'
                      )}>
                        {client.status === 'active' ? (isHe ? 'פעיל' : 'Active') :
                         client.status === 'completed' ? (isHe ? 'הושלם' : 'Done') : client.status}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-2" />

            {/* Activity Feed */}
            <div className="max-h-[160px] overflow-y-auto scrollbar-hide">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">
                {isHe ? 'פעילות אחרונה' : 'Recent Activity'}
              </span>

              {activityFeed.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">{isHe ? 'אין פעילות' : 'No activity'}</p>
              ) : (
                <div className="relative flex flex-col gap-0 w-full">
                  <div className="absolute top-0 bottom-0 w-[2px] bg-purple-500/10 rounded-full ltr:left-[7px] rtl:right-[7px]" />
                  {activityFeed.slice(0, 4).map((event) => (
                    <div key={event.id} className="relative flex items-start gap-2.5 py-1 ltr:pl-5 rtl:pr-5">
                      <div className={cn(
                        "absolute ltr:left-0 rtl:right-0 top-2 w-[14px] h-[14px] rounded-full flex items-center justify-center",
                        "bg-muted/50 border border-purple-500/20"
                      )}>
                        <event.icon className={cn("w-2 h-2", event.color)} />
                      </div>
                      <div className="flex flex-col gap-0">
                        <span className="text-[11px] font-medium leading-tight">{event.label}</span>
                        <span className="text-[9px] text-muted-foreground">{event.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Add Client Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isHe ? 'הוספת מתאמן חדש' : 'Add New Client'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={isHe ? 'חפשו לפי שם...' : 'Search by name...'}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                dir="ltr"
              />
              <Button onClick={handleSearchUser} disabled={searching} size="icon" variant="outline">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            {foundUser && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{foundUser.full_name || (isHe ? 'ללא שם' : 'No name')}</p>
                  <p className="text-xs text-muted-foreground">{foundUser.id.slice(0, 8)}...</p>
                </div>
                <Button
                  size="sm"
                  onClick={handleConfirmAdd}
                  disabled={addClient.isPending}
                >
                  {addClient.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : (isHe ? 'הוסף' : 'Add')}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
