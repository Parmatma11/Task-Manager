'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CheckSquare, Users, Building2,
  Settings, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';
import { useRole } from '@/lib/hooks/use-role';
import { useTenant } from '@/lib/hooks/use-tenant';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Tasks', href: ROUTES.TASKS, icon: CheckSquare, requiredRole: ['admin', 'user'] },
  { label: 'Users', href: ROUTES.USERS, icon: Users, requiredRole: ['super_admin', 'admin'] },
  { label: 'Tenants', href: ROUTES.TENANTS, icon: Building2, requiredRole: ['super_admin'] },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();
  const { role, checkPermission, isSuperAdmin, hasTenant } = useRole();
  const { tenantName } = useTenant();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.requiredRole) return true;
    if (!hasTenant && !isSuperAdmin) {
      return item.href === ROUTES.DASHBOARD || item.href === ROUTES.SETTINGS;
    }
    return checkPermission(item.requiredRole);
  });

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out',
      isSidebarCollapsed ? 'w-[68px]' : 'w-64'
    )}>
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-5 w-5" />
        </div>
        {!isSidebarCollapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold text-sidebar-foreground">TaskFlow</span>
            <span className="truncate text-[11px] text-muted-foreground">
              {isSuperAdmin ? 'Super Admin' : tenantName || 'Unassigned'}
            </span>
          </div>
        )}
      </div>

      {!isSidebarCollapsed && (
        <div className="px-4 py-2">
          <Badge variant="outline" className={cn('text-[10px] w-full justify-center',
            isSuperAdmin ? 'text-violet-500 border-violet-500/30 bg-violet-500/5'
            : role === 'admin' ? 'text-blue-500 border-blue-500/30 bg-blue-500/5'
            : 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5'
          )}>
            {isSuperAdmin ? 'Super Admin' : role === 'admin' ? 'Admin' : 'User'}
          </Badge>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const linkContent = (
            <Link key={item.href} href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}>
              <item.icon className={cn('h-5 w-5 flex-shrink-0 transition-colors',
                isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
              )} />
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
          if (isSidebarCollapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger render={linkContent} />
                <TooltipContent side="right" sideOffset={10}>{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return linkContent;
        })}
      </nav>

      <Separator />
      <div className="p-3">
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="w-full justify-center"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : (
            <><ChevronLeft className="h-4 w-4 mr-2" /><span className="text-xs">Collapse</span></>
          )}
        </Button>
      </div>
    </aside>
  );
}
