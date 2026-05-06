'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { STALE_TIME_MS, GC_TIME_MS } from '@/lib/constants';

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MS,
            gcTime: GC_TIME_MS,
            retry: 2,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={0}>
          <NuqsAdapter>
            {children}
          </NuqsAdapter>
        </TooltipProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '0.75rem',
            },
          }}
          richColors
          closeButton
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
