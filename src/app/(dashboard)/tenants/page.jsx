'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRole } from '@/lib/hooks/use-role';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/shared/role-guard';
import { EmptyState } from '@/components/shared/empty-state';
import { ROLES, UNASSIGNED_TENANT_SLUG } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { QUERY_KEYS } from '@/lib/query-keys';

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useRole();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', slug: '' });

  // Use TanStack Query for fetching
  const { data: tenants = [], isLoading: loading } = useQuery({
    queryKey: [...QUERY_KEYS.tenants(), debouncedSearch],
    queryFn: async () => {
      const supabase = createClient();
      if (!supabase) return [];

      let query = supabase
        .from('tenants')
        .select('*')
        .neq('slug', UNASSIGNED_TENANT_SLUG)
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,slug.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newTenant) => {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenant),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || 'Failed to create organization');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenants() });
      toast.success('Organization created successfully');
      setIsCreateOpen(false);
      setFormData({ name: '', slug: '' });
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/tenants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || 'Failed to update organization');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenants() });
      toast.success('Organization updated successfully');
      setIsEditOpen(false);
      setSelectedTenant(null);
      setFormData({ name: '', slug: '' });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/tenants/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || result.message || 'Failed to delete organization');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenants() });
      toast.success('Organization deleted successfully');
      setIsDeleteOpen(false);
      setSelectedTenant(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleCreateTenant = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleUpdateTenant = (e) => {
    e.preventDefault();
    if (!selectedTenant) return;
    updateMutation.mutate({ id: selectedTenant.id, data: formData });
  };

  const handleDeleteTenant = () => {
    if (!selectedTenant) return;
    deleteMutation.mutate(selectedTenant.id);
  };

  const updateSlug = (name) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData(prev => ({ ...prev, name, slug }));
  };

  const openEdit = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({ name: tenant.name, slug: tenant.slug });
    setIsEditOpen(true);
  };

  const openDelete = (tenant) => {
    setSelectedTenant(tenant);
    setIsDeleteOpen(true);
  };

  if (!isSuperAdmin) {
    return (
      <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
        <div />
      </RoleGuard>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all organizations in the system.
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button className="gap-1.5" />}>
            <Plus className="h-4 w-4" />
            New Organization
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateTenant}>
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
                <DialogDescription>
                  Add a new organization to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    placeholder="Acme Corp"
                    value={formData.name}
                    onChange={(e) => updateSlug(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL friendly) *</Label>
                  <Input
                    id="slug"
                    placeholder="acme-corp"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Organization'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Badge variant="outline" className="text-xs w-fit">
          {tenants.length} organization{tenants.length !== 1 ? 's' : ''}
        </Badge>
        
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border"
          />
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleUpdateTenant}>
            <DialogHeader>
              <DialogTitle>Edit Organization</DialogTitle>
              <DialogDescription>
                Update organization details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Organization Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => updateSlug(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug (URL friendly)</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedTenant?.name}</strong>? This action is permanent and will delete all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTenant}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {tenants.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={search ? "No matches found" : "No organizations yet"}
          description={search ? "Try a different search term." : "Organizations are created when users sign up or by super admins."}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant, index) => (
            <Card
              key={tenant.id}
              className="group animate-fade-in hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{tenant.name}</h3>
                      <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-lg hover:bg-muted cursor-pointer outline-none"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(tenant)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDelete(tenant)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  {tenant.created_at ? `Created ${format(new Date(tenant.created_at), 'MMM d, yyyy')}` : ''}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
