'use client';

import { useState, useEffect } from 'react';
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
  Users, MoreHorizontal, Shield, ShieldCheck, User, UserPlus, Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const ROLE_CONFIG = {
  [ROLES.SUPER_ADMIN]: { icon: ShieldCheck, label: 'Super Admin', color: 'text-violet-500 bg-violet-500/10' },
  [ROLES.ADMIN]: { icon: Shield, label: 'Admin', color: 'text-blue-500 bg-blue-500/10' },
  [ROLES.USER]: { icon: User, label: 'User', color: 'text-emerald-500 bg-emerald-500/10' },
};

export default function UsersPage() {
  const tenant = useAuthStore((state) => state.tenant);
  const { isSuperAdmin, isAdmin } = useRole();
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigningUser, setAssigningUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ email: '', fullName: '', role: ROLES.USER });
  const [assignTenantId, setAssignTenantId] = useState('');

  const fetchUsers = async () => {
    const supabase = createClient();
    if (!supabase) return;

    if (isSuperAdmin) {
      // Super admin: fetch ALL users + their tenant info
      const { data, error } = await supabase
        .from('profiles')
        .select('*, tenants(id, name, slug)')
        .order('created_at', { ascending: false });
      if (!error) setUsers(data || []);
    } else if (tenant?.id) {
      // Admin: fetch only tenant users
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
      if (!error) setUsers(data || []);
    }
    setLoading(false);
  };

  const fetchTenants = async () => {
    if (!isSuperAdmin) return;
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase.from('tenants').select('id, name, slug').neq('slug', UNASSIGNED_TENANT_SLUG).order('name');
    setTenants(data || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchTenants();
  }, [tenant?.id, isSuperAdmin]);

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || 'Failed to invite user');
      toast.success('Invitation sent successfully');
      setIsInviteOpen(false);
      setFormData({ email: '', fullName: '', role: ROLES.USER });
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || 'Failed to update role');
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAssignTenant = async () => {
    if (!assigningUser || !assignTenantId) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users/assign-tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: assigningUser.id, tenantId: assignTenantId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || 'Failed to assign tenant');
      toast.success(result.message);
      setIsAssignOpen(false);
      setAssigningUser(null);
      setAssignTenantId('');
      fetchUsers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignDialog = (user) => {
    setAssigningUser(user);
    setAssignTenantId(user.tenant_id || '');
    setIsAssignOpen(true);
  };

  if (!isSuperAdmin && !isAdmin) {
    return <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}><div /></RoleGuard>;
  }

  if (loading) {
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

        {/* Admin-only: Invite user to their tenant */}
        {isAdmin && (
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger render={<Button className="gap-1.5" />}>
              <UserPlus className="h-4 w-4" />Invite User
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleInviteUser}>
                <DialogHeader>
                  <DialogTitle>Invite User</DialogTitle>
                  <DialogDescription>Send an email invitation to a new team member.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="John Doe" value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Inviting...' : 'Invite User'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Badge variant="outline" className="text-xs">
        {users.length} member{users.length !== 1 ? 's' : ''}
      </Badge>

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
                <SelectTrigger><SelectValue placeholder="Select organization" /></SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
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
        <EmptyState icon={Users} title="No users yet" description="Users will appear here after signing up." />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                {isSuperAdmin && <TableHead>Organization</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => {
                const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG[ROLES.USER];
                const RoleIcon = roleConfig.icon;
                const userTenant = user.tenants || null;

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
                          <p className="text-sm font-medium">{user.full_name}</p>
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
                      <Badge variant={user.is_active ? 'default' : 'secondary'} className="text-[10px]">
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
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
                        <DropdownMenuContent align="end">
                          {isSuperAdmin && (
                            <>
                              <DropdownMenuGroup>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleChangeRole(user.id, ROLES.USER)}>
                                      <User className="mr-2 h-3.5 w-3.5" />User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeRole(user.id, ROLES.ADMIN)}>
                                      <Shield className="mr-2 h-3.5 w-3.5" />Admin
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openAssignDialog(user)}>
                                <Building2 className="mr-2 h-3.5 w-3.5" />Assign Organization
                              </DropdownMenuItem>
                            </>
                          )}
                          {isAdmin && !isSuperAdmin && (
                            <DropdownMenuGroup>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => handleChangeRole(user.id, ROLES.USER)}>User</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleChangeRole(user.id, ROLES.ADMIN)}>Admin</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuGroup>
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
