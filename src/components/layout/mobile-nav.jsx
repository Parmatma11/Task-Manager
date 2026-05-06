'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui-store';
import { useRole } from '@/lib/hooks/use-role';
import { useTenant } from '@/lib/hooks/use-tenant';
import { ROUTES } from '@/lib/constants';
import { NAV_ITEMS } from '@/lib/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';


export function MobileNav() {
  const pathname = usePathname();
  const { isMobileNavOpen, setMobileNavOpen } = useUiStore();
  const { checkPermission, isSuperAdmin, hasTenant } = useRole();
  const { tenantName } = useTenant();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.requiredRole) return true;
    if (!hasTenant && !isSuperAdmin) {
      return item.href === ROUTES.DASHBOARD || item.href === ROUTES.SETTINGS;
    }
    return checkPermission(item.requiredRole);
  });

  return (
    <Sheet open={isMobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <SheetTitle className="text-sm font-bold">TaskFlow</SheetTitle>
              <span className="text-[11px] text-muted-foreground">
                {isSuperAdmin ? 'Super Admin' : tenantName || 'Unassigned'}
              </span>
            </div>
          </div>
        </SheetHeader>

        <nav className="space-y-1 p-3">
          {visibleItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-accent text-primary' : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground'
                )}>
                <item.icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-foreground/50')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
