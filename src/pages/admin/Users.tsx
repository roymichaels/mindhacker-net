import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, Loader2, Gift, Eye, UserCog, Shield, Link2, 
  Check, X, MoreHorizontal, Users as UsersIcon 
} from "lucide-react";
import { handleError, generateErrorId } from "@/lib/errorHandling";
import AdminGrantPurchaseDialog from "@/components/admin/AdminGrantPurchaseDialog";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

interface UserData {
  id: string;
  email: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url?: string | null;
  };
  purchases?: {
    id: string;
    sessions_remaining: number;
  }[];
  user_roles?: {
    role: AppRole;
  }[];
}

const AVAILABLE_ROLES: { role: AppRole; label: string; labelHe: string; icon: React.ElementType; color: string }[] = [
  { role: 'admin', label: 'Admin', labelHe: 'מנהל', icon: Shield, color: 'text-red-500' },
  { role: 'practitioner', label: 'Coach', labelHe: 'מאמן', icon: UserCog, color: 'text-blue-500' },
  { role: 'affiliate', label: 'Affiliate', labelHe: 'שותף', icon: Link2, color: 'text-green-500' },
];

const Users = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    email: string;
    full_name: string | null;
  } | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();

  const locale = language === 'he' ? 'he-IL' : 'en-US';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          created_at
        `);

      if (profilesError) throw profilesError;

      const { data: purchasesData } = await supabase
        .from("purchases")
        .select("user_id, id, sessions_remaining");

      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const getUserEmail = async (userId: string) => {
        try {
          const { data, error } = await supabase.functions.invoke('get-user-data', {
            body: { userId }
          });

          if (error) throw error;
          return data.user?.email || t('common.unknown');
        } catch (error) {
          console.error("Error fetching user email - ID:", generateErrorId());
          return t('common.unknown');
        }
      };

      const usersWithData = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const email = await getUserEmail(profile.id);
          const userPurchases = purchasesData?.filter(p => p.user_id === profile.id) || [];
          const userRoles = rolesData?.filter(r => r.user_id === profile.id) || [];

          return {
            id: profile.id,
            email,
            created_at: profile.created_at,
            profiles: {
              full_name: profile.full_name,
            },
            purchases: userPurchases,
            user_roles: userRoles as { role: AppRole }[],
          };
        })
      );

      setUsers(usersWithData);
    } catch (error: unknown) {
      handleError(error, t('messages.loadError'), "Users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, role: AppRole, currentlyHasRole: boolean) => {
    setUpdatingRole(`${userId}-${role}`);
    try {
      if (currentlyHasRole) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        
        if (error) throw error;
        
        toast({
          title: language === 'he' ? 'התפקיד הוסר' : 'Role Removed',
          description: language === 'he' ? `התפקיד ${AVAILABLE_ROLES.find(r => r.role === role)?.labelHe} הוסר` : `${role} role removed`,
        });
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (error) throw error;
        
        toast({
          title: language === 'he' ? 'התפקיד נוסף' : 'Role Added',
          description: language === 'he' ? `התפקיד ${AVAILABLE_ROLES.find(r => r.role === role)?.labelHe} נוסף` : `${role} role added`,
        });
      }
      
      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.id !== userId) return user;
        
        const newRoles = currentlyHasRole
          ? (user.user_roles?.filter(r => r.role !== role) || [])
          : [...(user.user_roles || []), { role }];
        
        return { ...user, user_roles: newRoles };
      }));
    } catch (error) {
      handleError(error, language === 'he' ? 'שגיאה בעדכון תפקיד' : 'Failed to update role', 'toggleUserRole');
    } finally {
      setUpdatingRole(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const userName = user.profiles?.full_name?.toLowerCase() || "";
    const email = user.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return userName.includes(search) || email.includes(search);
  });

  const handleGrantClick = (user: UserData) => {
    setSelectedUser({
      id: user.id,
      email: user.email,
      full_name: user.profiles?.full_name || null,
    });
    setGrantDialogOpen(true);
  };

  const getInitials = (name: string | null | undefined, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <UsersIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t('adminUsers.pageTitle')}</h1>
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} {language === 'he' ? 'משתמשים' : 'users'}
            </p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 h-4 w-4 text-muted-foreground`} />
          <Input
            placeholder={t('adminUsers.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn("h-9", isRTL ? 'pr-9' : 'pl-9')}
          />
        </div>
      </div>

      {/* Compact Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn("py-2", isRTL ? 'text-right' : 'text-left')}>
                {t('adminUsers.name')}
              </TableHead>
              <TableHead className={cn("py-2 hidden sm:table-cell", isRTL ? 'text-right' : 'text-left')}>
                {t('adminUsers.joinDate')}
              </TableHead>
              <TableHead className={cn("py-2", isRTL ? 'text-right' : 'text-left')}>
                {t('adminUsers.role')}
              </TableHead>
              <TableHead className={cn("py-2 w-[100px]", isRTL ? 'text-right' : 'text-left')}>
                {t('adminUsers.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {t('adminUsers.noUsersFound')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const userRoles = user.user_roles?.map(r => r.role) || [];

                return (
                  <TableRow key={user.id} className="group">
                    {/* User Info - Compact & Clickable */}
                    <TableCell className="py-2">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/panel/users/${user.id}`)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(user.profiles?.full_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate hover:text-primary transition-colors">
                            {user.profiles?.full_name || t('adminUsers.notDefined')}
                          </p>
                          <p className="text-xs text-muted-foreground truncate hover:text-primary/70 transition-colors">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Join Date */}
                    <TableCell className="py-2 hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString(locale)}
                    </TableCell>
                    
                    {/* Roles - Compact Badges with Dropdown */}
                    <TableCell className="py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-1 gap-1 hover:bg-muted"
                          >
                            <div className="flex gap-1 flex-wrap">
                              {userRoles.length === 0 ? (
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  User
                                </Badge>
                              ) : (
                                userRoles.map((role) => {
                                  const roleConfig = AVAILABLE_ROLES.find(r => r.role === role);
                                  const Icon = roleConfig?.icon || Shield;
                                  return (
                                    <Badge 
                                      key={role} 
                                      variant="secondary" 
                                      className="text-xs px-1.5 py-0 gap-0.5"
                                    >
                                      <Icon className={cn("h-3 w-3", roleConfig?.color)} />
                                      <span className="hidden sm:inline">
                                        {language === 'he' ? roleConfig?.labelHe : roleConfig?.label}
                                      </span>
                                    </Badge>
                                  );
                                })
                              )}
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? "end" : "start"} className="w-48 bg-card border border-border z-[100]">
                          <DropdownMenuLabel className="text-xs">
                            {language === 'he' ? 'ניהול תפקידים' : 'Manage Roles'}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {AVAILABLE_ROLES.map(({ role, label, labelHe, icon: Icon, color }) => {
                            const hasRole = userRoles.includes(role);
                            const isUpdating = updatingRole === `${user.id}-${role}`;
                            
                            return (
                              <DropdownMenuCheckboxItem
                                key={role}
                                checked={hasRole}
                                disabled={isUpdating}
                                onCheckedChange={() => toggleUserRole(user.id, role, hasRole)}
                                className="gap-2"
                              >
                                {isUpdating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Icon className={cn("h-4 w-4", color)} />
                                )}
                                {language === 'he' ? labelHe : label}
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    
                    {/* Actions - Compact Dropdown */}
                    <TableCell className="py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? "start" : "end"} className="bg-card border border-border z-[100]">
                          <DropdownMenuItem onClick={() => navigate(`/panel/users/${user.id}`)}>
                            <Eye className="h-4 w-4 me-2" />
                            {t('common.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGrantClick(user)}>
                            <Gift className="h-4 w-4 me-2" />
                            {t('adminUsers.grantPurchase')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AdminGrantPurchaseDialog
        open={grantDialogOpen}
        onOpenChange={setGrantDialogOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default Users;
