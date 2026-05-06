/**
 * Centralized, tenant-scoped query keys for TanStack Query.
 * Every query key is a function to ensure tenant isolation.
 */
export const QUERY_KEYS = {
  tasks: (tenantId) => ['tasks', tenantId],
  taskDetail: (taskId) => ['task', taskId],
  tasksByStatus: (tenantId, status) => ['tasks', tenantId, 'status', status],
  usersByTenant: (tenantId) => ['users', tenantId],
  userDetail: (userId) => ['user', userId],
  tenants: () => ['tenants'],
  tenantDetail: (tenantId) => ['tenant', tenantId],
  dashboardStats: (tenantId) => ['dashboard-stats', tenantId],
  activityLogs: (tenantId) => ['activity-logs', tenantId],
  profile: (userId) => ['profile', userId],
};
