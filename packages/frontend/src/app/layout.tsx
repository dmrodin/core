'use client';

import dynamic from 'next/dynamic';

import { Providers } from '@/shared/ui/components/providers';
import { ThemeInitScript } from '@/shared/ui/components/theme-init-script';
import { Toaster } from '@/shared/ui/shadcn/sonner';

import './globals.css';

const SWRegister = dynamic(() => import('@/features/auth/ui/register/sw-register.client'), {
    ssr: false,
});
const TopLoader = dynamic(() => import('@/shared/ui/components/top-loader'), {
    ssr: false,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <head>
                <title>MonteMove</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0F172A" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <link rel="icon" href="/logo-circle.png" type="image/png" />
                <link rel="apple-touch-icon" href="/logo-circle.png" />
                <ThemeInitScript />
            </head>
            <body className="antialiased" suppressHydrationWarning>
                <TopLoader />
                <SWRegister />
                <Providers>{children}</Providers>
                <Toaster position="top-center" richColors closeButton />
            </body>
        </html>
    );
}
