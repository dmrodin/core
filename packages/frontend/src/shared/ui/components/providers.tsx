'use client';

import { useEffect } from 'react';

import { ThemeProvider } from 'next-themes';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { ThemeColorLoader } from '@/shared/ui/components/theme-color-loader';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <QueryClientProvider client={queryClient}>
                <ThemeColorLoader />
                {children}
            </QueryClientProvider>
        </ThemeProvider>
    );
}
