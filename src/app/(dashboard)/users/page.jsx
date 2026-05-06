'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { useRole } from '@/lib/hooks/use-role';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { RoleGuard } from '@/components/shared/role-guard';
import { getInitials } from '@/lib/utils';
import { ROLES, UNASSIGNED_TENANT_SLUG } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuSubContent, DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Users, MoreHorizontal, Shield, ShieldCheck, User, Building2, Search, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { QUERY_KEYS } from '@/lib/query-keys';

const ROLE_CONFIG = {
  [ROLES.SUPER_ADMIN]: { icon: ShieldCheck, label: 'Super Admin', color: 'text-violet-500 bg-violet-500/10' },
  [ROLES.ADMIN]: { icon: Shield, label: 'Admin', color: 'text-blue-500 bg-blue-500/10' },
  [ROLES.USER]: { icon: User, label: 'User', color: 'text-emerald-500 bg-emerald-500/10' },
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const profile = useAuthStore((state) => state.profile);
  const tenant = useAuthStore((state) => state.tenant);
  const { isSuperAdmin, isAdmin } = useRole();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigningUser, setAssigningUser] = useState(null);
  const [assignTenantId, setAssignTenantId] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Use TanStack Query for fetching users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: [...QUERY_KEYS.usersByTenant(tenant?.id || 'all'), debouncedSearch, isSuperAdmin],
    queryFn: async () => {
      const supabase = createClient();
      if (!supabase) return [];

      let query;
      if (isSuperAdmin) {
        query = supabase
          .from('profiles')
          .select('*, tenants(id, name, slug)')
          .order('created_at', { ascending: false });
      } else if (tenant?.id) {
        query = supabase
          .from('profiles')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });
      } else {
        return [];
      }

      if (debouncedSearch) {
        query = query.or(`full_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: isSuperAdmin || !!tenant?.id,
  });

  // Fetch tenants for super admin assignment
  const { data: allTenants = [] } = useQuery({
    queryKey: QUERY_KEYS.tenants(),
    queryFn: async () => {
      const supabase = createClient();
      if (!supabase) return [];
      const { data } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .neq('slug', UNASSIGNED_TENANT_SLUG)
        .order('name');
      return data || [];
    },
    enabled: isSuperAdmin,
  });
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || 'Failed to update role');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.usersByTenant(tenant?.id || 'all') });
      toast.success('User role updated');
    },
    onError: (error) => toast.error(error.message),
  });

  const assignTenantMutation = useMutation({
    mutationFn: async ({ userId, tenantId }) => {
      const response = await fetch('/api/users/assign-tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tenantId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || 'Failed to assign tenant');
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.usersByTenant(tenant?.id || 'all') });
      toast.success(result.message);
      setIsAssignOpen(false);
      setAssigningUser(null);
      setAssignTenantId('');
    },
    onError: (error) => toast.error(error.message),
  });

  const isSubmitting = assignTenantMutation.isPending;


  const handleChangeRole = (userId, newRole) => {
    changeRoleMutation.mutate({ userId, role: newRole });
  };

  const handleAssignTenant = () => {
    if (!assigningUser || !assignTenantId) return;
    assignTenantMutation.mutate({ userId: assigningUser.id, tenantId: assignTenantId });
  };

  const openAssignDialog = (user) => {
    setAssigningUser(user);
    setAssignTenantId(user.tenant_id || '');
    setIsAssignOpen(true);
  };

  if (!isSuperAdmin && !isAdmin) {
    return <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}><div /></RoleGuard>;
  }

  if (usersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperAdmin
              ? 'Manage all users across the platform.'
              : `Manage team members for ${tenant?.name}.`}
          </p>
        </div>

      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Badge variant="outline" className="text-xs w-fit">
          {users.length} member{users.length !== 1 ? 's' : ''}
        </Badge>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border"
          />
        </div>
      </div>

      {/* Assign Tenant Dialog (super_admin only) */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Organization</DialogTitle>
            <DialogDescription>
              Assign {assigningUser?.full_name} to an organization.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Organization</Label>
              <Select value={assignTenantId} onValueChange={setAssignTenantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization">
                    {allTenants.find(t => t.id === assignTenantId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allTenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignTenant} disabled={isSubmitting || !assignTenantId}>
              {isSubmitting ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "No users found" : "No users yet"}
          description={search ? "Try a different search term." : "Users will appear here after signing up."}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                {isSuperAdmin && <TableHead>Organization</TableHead>}
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => {
                const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG[ROLES.USER];
                const RoleIcon = roleConfig.icon;
                const userTenant = user.tenants || null;
                const isSelf = user.id === profile?.id;

                return (
                  <TableRow key={user.id} className="group animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{user.full_name}</p>
                            {isSelf && (
                              <Badge variant="secondary" className="h-4 px-1 text-[9px] font-bold bg-primary/10 text-primary border-none">
                                You
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] gap-1 ${roleConfig.color}`}>
                        <RoleIcon className="h-3 w-3" />{roleConfig.label}
                      </Badge>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        {userTenant && userTenant.slug !== UNASSIGNED_TENANT_SLUG ? (
                          <Badge variant="secondary" className="text-[10px]">{userTenant.name}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">Unassigned</Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {user.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd') : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-muted cursor-pointer outline-none">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {isSelf ? (
                            <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                              <User className="mr-2 h-3.5 w-3.5" />My Settings
                            </DropdownMenuItem>
                          ) : (
                            <>
                              {((isSuperAdmin) || (isAdmin && user.role !== ROLES.USER)) && (
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Shield className="mr-2 h-3.5 w-3.5" />
                                    Change Role
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleChangeRole(user.id, ROLES.ADMIN)}>
                                      <Shield className="mr-2 h-3.5 w-3.5" />Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeRole(user.id, ROLES.USER)}>
                                      <User className="mr-2 h-3.5 w-3.5" />User
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              )}

                              {isSuperAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openAssignDialog(user)}>
                                    <Building2 className="mr-2 h-3.5 w-3.5" />Assign Organization
                                  </DropdownMenuItem>
                                </>
                              )}

                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
