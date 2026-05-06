import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Building2,
  Settings,
} from 'lucide-react';
import { ROLES, ROUTES } from './constants';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Tasks', href: ROUTES.TASKS, icon: CheckSquare, requiredRole: [ROLES.ADMIN, ROLES.USER] },
  { label: 'Users', href: ROUTES.USERS, icon: Users, requiredRole: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
  { label: 'Tenants', href: ROUTES.TENANTS, icon: Building2, requiredRole: [ROLES.SUPER_ADMIN] },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];
