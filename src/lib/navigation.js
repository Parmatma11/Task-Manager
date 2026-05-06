import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Building2,
  Settings,
} from 'lucide-react';
import { ROUTES } from './constants';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Tasks', href: ROUTES.TASKS, icon: CheckSquare, requiredRole: ['admin', 'user'] },
  { label: 'Users', href: ROUTES.USERS, icon: Users, requiredRole: ['super_admin', 'admin'] },
  { label: 'Tenants', href: ROUTES.TENANTS, icon: Building2, requiredRole: ['super_admin'] },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];
