import { useAuthStore } from '@/store/auth-store';
import { ROLES, UNASSIGNED_TENANT_SLUG } from '@/lib/constants';
import { hasPermission } from '@/lib/utils';

/**
 * Hook providing role-based access control utilities.
 * 
 * isUnassigned: true when user has no tenant OR is in the system "__unassigned__" tenant.
 * hasTenant: true only when user has a REAL tenant (not the unassigned placeholder).
 */
export function useRole() {
  const profile = useAuthStore((state) => state.profile);
  const tenant = useAuthStore((state) => state.tenant);
  const role = profile?.role || null;

  // User is unassigned if they have no tenant OR their tenant is the system placeholder
  const isRealTenant = !!tenant && tenant.slug !== UNASSIGNED_TENANT_SLUG;

  return {
    role,
    isSuperAdmin: role === ROLES.SUPER_ADMIN,
    isAdmin: role === ROLES.ADMIN,
    isUser: role === ROLES.USER,
    isAdminOrAbove: role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN,
    isUnassigned: !isRealTenant && role !== ROLES.SUPER_ADMIN,
    hasTenant: isRealTenant,
    canManageUsers: role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN,
    canManageTenants: role === ROLES.SUPER_ADMIN,
    canCreateTasks: role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN,
    canDeleteTasks: role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN,
    canAssignTasks: role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN,
    canEditAllTasks: role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN,
    checkPermission: (allowedRoles) => hasPermission(role, allowedRoles),
  };
}
