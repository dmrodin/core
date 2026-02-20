'use client';

import { useEffect } from 'react';

import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { FileText, Plus, Wallet } from 'lucide-react';

import { UserRole } from '@/entities/users/model/user-schemas';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { ReportsSheet } from '@/features/reports';
import { useIsMobile, Button, ROUTER_MAP } from '@/shared';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared';
import { DynamicBreadcrumb } from '@/widgets';
import { AppSidebar } from '@/widgets';

const PageTransition = dynamic(() => import('@/shared/ui/components/page-transition'), {
    ssr: false,
});

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const USER_RESTRICTED_ROUTE_PREFIXES = [
    ROUTER_MAP.USERS,
    ROUTER_MAP.CURRENCIES,
    ROUTER_MAP.NETWORKS,
    ROUTER_MAP.NETWORK_TYPES,
    ROUTER_MAP.OPERATION_TYPES,
    ROUTER_MAP.WALLET_TYPES,
    ROUTER_MAP.PLATFORMS,
    ROUTER_MAP.BANKS,
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { isTablet } = useIsMobile();
    const pathname = usePathname();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const hasAdminRole = user?.roles?.some((role) => role.code === UserRole.ADMIN) ?? false;
    const isRestrictedRole =
        !hasAdminRole &&
        (user?.roles?.some((role) => role.code === UserRole.USER || role.code === UserRole.MODERATOR) ?? false);

    useEffect(() => {
        if (!isRestrictedRole) return;

        const isRestrictedRoute = USER_RESTRICTED_ROUTE_PREFIXES.some(
            (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
        );

        if (isRestrictedRoute) {
            router.replace(ROUTER_MAP.DASHBOARD);
        }
    }, [isRestrictedRole, pathname, router]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4 w-full">
                        {isTablet && <SidebarTrigger />}
                        <DynamicBreadcrumb />
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(ROUTER_MAP.OPERATIONS_CREATE)}
                                title="Создать операцию"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Операция</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(ROUTER_MAP.APPLICATIONS_CREATE)}
                                title="Создать заявку"
                            >
                                <FileText className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Заявка</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(ROUTER_MAP.WALLETS_CREATE)}
                                title="Создать кошелек"
                            >
                                <Wallet className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Кошелек</span>
                            </Button>
                        </div>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="max-w-5xl mx-auto w-full">
                        <PageTransition>{children}</PageTransition>
                    </div>
                </main>
            </SidebarInset>
            <ReportsSheet />
        </SidebarProvider>
    );
}
