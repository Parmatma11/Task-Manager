'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useUiStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({ children }) {
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const { isAuthenticated, isLoading, _hasHydrated, initSession } = useAuthStore();
  const router = useRouter();

  // ALL hooks BEFORE any conditional returns
  useEffect(() => {
    if (_hasHydrated) {
      initSession();
    }
  }, [_hasHydrated, initSession]);

  useEffect(() => {
    if (!isLoading && _hasHydrated && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isLoading, _hasHydrated, isAuthenticated, router]);

  // Show loading while checking session
  if (isLoading || !_hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-sm">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  // Redirecting — show skeleton
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-sm">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <MobileNav />
      <div
        className={cn(
          'flex flex-col transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-64'
        )}
      >
        <Navbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
