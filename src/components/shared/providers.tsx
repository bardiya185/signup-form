'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { initTheme } from '@/stores/ui.store';
import { Toaster } from '@/components/ui/toaster';
import { PwaRegister } from '@/components/shared/pwa';

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              const status = (error as { status?: number })?.status ?? 0;
              return failureCount < 1 && status !== 401 && status !== 403 && status !== 404;
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    initTheme();
    void useAuthStore.getState().bootstrap();
    const onUnauthorized = () => {
      useAuthStore.getState().setUser(null);
    };
    window.addEventListener('gnk:unauthorized', onUnauthorized);
    return () => window.removeEventListener('gnk:unauthorized', onUnauthorized);
  }, []);

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster />
      <PwaRegister />
    </QueryClientProvider>
  );
}
