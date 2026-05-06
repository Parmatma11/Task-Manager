import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { createClient } from '@/lib/supabase/client';
import { UNASSIGNED_TENANT_SLUG } from '@/lib/constants';
import { QUERY_KEYS } from '@/lib/query-keys';

/**
 * Hook providing tenant context — current tenant and switch capability.
 * Recognizes the __unassigned__ system tenant as "no real tenant".
 */
export function useTenant() {
  const tenant = useAuthStore((state) => state.tenant);
  const switchTenant = useAuthStore((state) => state.switchTenant);
  const profile = useAuthStore((state) => state.profile);

  const isSuperAdmin = profile?.role === 'super_admin';
  const isRealTenant = !!tenant && tenant.slug !== UNASSIGNED_TENANT_SLUG;

  const { data: allTenants = [] } = useQuery({
    queryKey: QUERY_KEYS.tenants(),
    queryFn: async () => {
      const supabase = createClient();
      if (!supabase) return [];

      const { data } = await supabase
        .from('tenants')
        .select('*')
        .neq('slug', UNASSIGNED_TENANT_SLUG)
        .order('name');

      return data || [];
    },
    enabled: isSuperAdmin,
  });

  return {
    tenant: isRealTenant ? tenant : null,
    tenantId: isRealTenant ? tenant.id : null,
    tenantName: isRealTenant ? tenant.name : '',
    canSwitchTenant: isSuperAdmin,
    allTenants,
    switchTenant,
  };
}
