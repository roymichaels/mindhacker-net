import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, Shield, Crown, GraduationCap, Users as UsersIcon, Edit, Loader2, Key, Save } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const ROLE_ICONS: Record<AppRole, React.ReactNode> = {
  admin: <Crown className="h-4 w-4" />,
  practitioner: <GraduationCap className="h-4 w-4" />,
  affiliate: <UsersIcon className="h-4 w-4" />,
  user: <UsersIcon className="h-4 w-4" />,
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  practitioner: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  affiliate: 'bg-green-500/10 text-green-600 border-green-500/30',
  user: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
};

const RolesManager = () => {
  const { t, isRTL } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<AppRole[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch users with their roles
  const { data: usersWithRoles, isLoading: usersLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: allRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Map roles to users
      const rolesByUser = allRoles?.reduce((acc, { user_id, role }) => {
        if (!acc[user_id]) acc[user_id] = [];
        acc[user_id].push(role);
        return acc;
      }, {} as Record<string, AppRole[]>) || {};

      return profiles?.map(p => ({
        id: p.id,
        name: p.full_name || 'Unknown',
        roles: rolesByUser[p.id] || [],
      })) || [];
    },
  });

  // Fetch role permissions
  const { data: rolePermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('category')
        .order('permission_key');

      if (error) throw error;
      return data || [];
    },
  });

  // Update user roles mutation
  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: AppRole[] }) => {
      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insert new roles
      if (roles.length > 0) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(roles.map(role => ({ user_id: userId, role })));

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast.success(t('panel.rolesUpdated'));
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating roles:', error);
      toast.error(t('panel.rolesUpdateError'));
    },
  });

  // Toggle permission mutation
  const togglePermissionMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const { error } = await supabase
        .from('role_permissions')
        .update({ is_enabled: isEnabled })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success(t('panel.permissionUpdated'));
    },
    onError: (error) => {
      console.error('Error updating permission:', error);
      toast.error(t('panel.permissionUpdateError'));
    },
  });

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!usersWithRoles) return [];
    if (!searchQuery) return usersWithRoles;
    
    const query = searchQuery.toLowerCase();
    return usersWithRoles.filter(u => 
      u.name.toLowerCase().includes(query) ||
      u.roles.some(r => r.toLowerCase().includes(query))
    );
  }, [usersWithRoles, searchQuery]);

  // Group permissions by role and category
  const permissionsByRole = useMemo(() => {
    if (!rolePermissions) return {};
    
    return rolePermissions.reduce((acc, perm) => {
      if (!acc[perm.role]) acc[perm.role] = {};
      if (!acc[perm.role][perm.category || 'general']) acc[perm.role][perm.category || 'general'] = [];
      acc[perm.role][perm.category || 'general'].push(perm);
      return acc;
    }, {} as Record<string, Record<string, typeof rolePermissions>>);
  }, [rolePermissions]);

  const handleEditUser = (user: typeof filteredUsers[0]) => {
    setSelectedUser({ id: user.id, name: user.name, email: '' });
    setSelectedUserRoles([...user.roles]);
    setIsEditDialogOpen(true);
  };

  const handleRoleToggle = (role: AppRole) => {
    setSelectedUserRoles(prev => 
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSaveRoles = () => {
    if (!selectedUser) return;
    updateRolesMutation.mutate({ userId: selectedUser.id, roles: selectedUserRoles });
  };

  const availableRoles: AppRole[] = ['admin', 'practitioner', 'affiliate'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Key className="h-6 w-6" />
          {t('panel.rolesManager')}
        </h1>
        <p className="text-muted-foreground">{t('panel.rolesManagerDescription')}</p>
      </div>

      <Tabs defaultValue="users" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <UsersIcon className="h-4 w-4" />
            {t('panel.usersTab')}
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            {t('panel.rolesTab')}
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Key className="h-4 w-4" />
            {t('panel.permissionsTab')}
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <CardTitle>{t('panel.userRoles')}</CardTitle>
                  <CardDescription>{t('panel.userRolesDescription')}</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('panel.searchUsers')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('panel.userName')}</TableHead>
                      <TableHead>{t('panel.roles')}</TableHead>
                      <TableHead className="w-20">{t('panel.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length === 0 ? (
                              <span className="text-muted-foreground text-sm">{t('panel.noRoles')}</span>
                            ) : (
                              user.roles.map((role) => (
                                <Badge 
                                  key={role} 
                                  variant="outline" 
                                  className={`${ROLE_COLORS[role]} gap-1`}
                                >
                                  {ROLE_ICONS[role]}
                                  {t(`panel.role.${role}`)}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {availableRoles.map((role) => {
              const rolePerms = permissionsByRole[role] || {};
              const totalPerms = Object.values(rolePerms).flat().length;
              
              return (
                <Card key={role}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className={`p-2 rounded-lg ${ROLE_COLORS[role]}`}>
                        {ROLE_ICONS[role]}
                      </span>
                      {t(`panel.role.${role}`)}
                    </CardTitle>
                    <CardDescription>
                      {totalPerms} {t('panel.permissions')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t(`panel.roleDescription.${role}`)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          {permissionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            availableRoles.map((role) => {
              const rolePerms = permissionsByRole[role] || {};
              
              return (
                <Card key={role}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className={`p-2 rounded-lg ${ROLE_COLORS[role]}`}>
                        {ROLE_ICONS[role]}
                      </span>
                      {t(`panel.role.${role}`)} - {t('panel.permissions')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(rolePerms).map(([category, perms]) => (
                      <div key={category}>
                        <h4 className="font-medium mb-3 capitalize">{category}</h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {perms.map((perm) => (
                            <div 
                              key={perm.id} 
                              className="flex items-center justify-between p-3 rounded-lg border bg-card"
                            >
                              <div>
                                <Label className="text-sm font-medium">
                                  {isRTL ? perm.description : perm.description_en}
                                </Label>
                                <p className="text-xs text-muted-foreground">{perm.permission_key}</p>
                              </div>
                              <Switch
                                checked={perm.is_enabled}
                                onCheckedChange={(checked) => 
                                  togglePermissionMutation.mutate({ id: perm.id, isEnabled: checked })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Edit User Roles Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('panel.editUserRoles')}</DialogTitle>
            <DialogDescription>
              {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {availableRoles.map((role) => (
              <div 
                key={role}
                className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                onClick={() => handleRoleToggle(role)}
              >
                <Checkbox
                  id={`role-${role}`}
                  checked={selectedUserRoles.includes(role)}
                  onCheckedChange={() => handleRoleToggle(role)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <span className={`p-1.5 rounded ${ROLE_COLORS[role]}`}>
                    {ROLE_ICONS[role]}
                  </span>
                  <div>
                    <Label htmlFor={`role-${role}`} className="font-medium cursor-pointer">
                      {t(`panel.role.${role}`)}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t(`panel.roleDescription.${role}`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSaveRoles}
              disabled={updateRolesMutation.isPending}
            >
              {updateRolesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <Save className="h-4 w-4 me-2" />
              )}
              {t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesManager;
