'use client';

import { useRole } from '@/lib/hooks/use-role';

/**
 * Renders children only if the current user's role is in the allowedRoles list.
 * Super Admins bypass all restrictions.
 */
export function RoleGuard({ allowedRoles = [], children, fallback = null }) {
  const { checkPermission } = useRole();

  if (!checkPermission(allowedRoles)) {
    return fallback;
  }

  return children;
}
