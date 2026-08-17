'use client';

import { useEffect } from 'react';

import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { Book, FileText, HandshakeIcon, Home, LogOut, Plus, Ticket, Wallet } from 'lucide-react';

import { UserRole } from '@/entities/users/model/user-schemas';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { useLogout } from '@/features/auth';
import { ReportsSheet } from '@/features/reports';
import { useIsMobile, Button, ROUTER_MAP } from '@/shared';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared';
import { DynamicBreadcrumb, ThemeToggle } from '@/widgets';
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
    const { isMobile, isTablet } = useIsMobile();
    const pathname = usePathname();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
    const clearToken = useAuthStore((state) => state.clearToken);
    const logoutMutation = useLogout();

    const hasAdminRole = user?.roles?.some((role) => role.code === UserRole.ADMIN) ?? false;
    const isUserRole = user?.roles?.some((role) => role.code === UserRole.USER) ?? false;
    const isAuthResolving = !isAuthInitialized || (Boolean(token) && !user);
    const isRouteActive = (route: string) => pathname === route || pathname.startsWith(`${route}/`);
    const isRestrictedRole =
        isAuthResolving ||
        (!hasAdminRole &&
            (user?.roles?.some((role) => role.code === UserRole.USER || role.code === UserRole.MODERATOR) ?? false));

    useEffect(() => {
        if (!isAuthInitialized || (token && user)) return;

        void clearToken();

        const loginUrl = new URL(ROUTER_MAP.LOGIN, window.location.origin);
        loginUrl.searchParams.set('next', `${pathname}${window.location.search}`);
        router.replace(`${loginUrl.pathname}${loginUrl.search}`);
    }, [clearToken, isAuthInitialized, pathname, router, token, user]);

    useEffect(() => {
        if (!isRestrictedRole) return;

        const isRestrictedRoute = USER_RESTRICTED_ROUTE_PREFIXES.some(
            (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
        );

        if (isRestrictedRoute) {
            router.replace(ROUTER_MAP.DASHBOARD);
        }
    }, [isRestrictedRole, pathname, router]);

    if (!isAuthInitialized || !token || !user) {
        return null;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 sm:h-16">
                    <div className="flex items-center gap-2 px-4 w-full">
                        {isMobile ? (
                            <>
                                <SidebarTrigger />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push(ROUTER_MAP.DASHBOARD)}
                                    title="Главная"
                                >
                                    <Home className="h-5 w-5" />
                                </Button>
                                <div className="min-w-0 flex-1 overflow-hidden">
                                    <DynamicBreadcrumb compact />
                                </div>
                                <div className="ml-auto flex shrink-0 items-center gap-1">
                                    <ThemeToggle />
                                    {user?.username && (
                                        <span className="hidden max-w-[64px] truncate text-sm font-medium min-[360px]:inline">
                                            {user.username}
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => logoutMutation.mutate()}
                                        disabled={logoutMutation.isPending}
                                        title="Выйти"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
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
                                    {!isUserRole && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(ROUTER_MAP.WALLETS_CREATE)}
                                            title="Создать кошелек"
                                        >
                                            <Wallet className="h-4 w-4 mr-1" />
                                            <span className="hidden sm:inline">Кошелек</span>
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="max-w-5xl mx-auto w-full">
                        {isMobile && (
                            <div className="pb-2">
                                <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 gap-1 border-t bg-background/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-lg backdrop-blur">
                                    <Button
                                        variant={isRouteActive(ROUTER_MAP.OPERATIONS) ? 'default' : 'ghost'}
                                        className="flex h-auto flex-col gap-1 py-2"
                                        onClick={() => router.push(ROUTER_MAP.OPERATIONS)}
                                        aria-current={isRouteActive(ROUTER_MAP.OPERATIONS) ? 'page' : undefined}
                                    >
                                        <HandshakeIcon className="h-5 w-5" />
                                        <span className="text-xs">Операции</span>
                                    </Button>
                                    <Button
                                        variant={isRouteActive(ROUTER_MAP.WALLETS) ? 'default' : 'ghost'}
                                        className="flex h-auto flex-col gap-1 py-2"
                                        onClick={() => router.push(ROUTER_MAP.WALLETS)}
                                        aria-current={isRouteActive(ROUTER_MAP.WALLETS) ? 'page' : undefined}
                                    >
                                        <Wallet className="h-5 w-5" />
                                        <span className="text-xs">Кошельки</span>
                                    </Button>
                                    <Button
                                        variant={isRouteActive(ROUTER_MAP.APPLICATIONS) ? 'default' : 'ghost'}
                                        className="flex h-auto flex-col gap-1 py-2"
                                        onClick={() => router.push(ROUTER_MAP.APPLICATIONS)}
                                        aria-current={isRouteActive(ROUTER_MAP.APPLICATIONS) ? 'page' : undefined}
                                    >
                                        <Ticket className="h-5 w-5" />
                                        <span className="text-xs">Заявки</span>
                                    </Button>
                                    <Button
                                        variant={isRouteActive(ROUTER_MAP.GUIDES) ? 'default' : 'ghost'}
                                        className="flex h-auto flex-col gap-1 py-2"
                                        onClick={() => router.push(ROUTER_MAP.GUIDES)}
                                        aria-current={isRouteActive(ROUTER_MAP.GUIDES) ? 'page' : undefined}
                                    >
                                        <Book className="h-5 w-5" />
                                        <span className="text-xs">Гайды</span>
                                    </Button>
                                </div>
                                <div className={`grid gap-2 ${isUserRole ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                    <Button
                                        variant="default"
                                        className="h-10 min-w-0 gap-1 overflow-hidden px-2 text-xs"
                                        onClick={() => router.push(ROUTER_MAP.OPERATIONS_CREATE)}
                                        aria-label="Новая операция"
                                    >
                                        <Plus className="h-4 w-4 shrink-0" />
                                        <span className="truncate">Операция</span>
                                    </Button>
                                    {!isUserRole && (
                                        <Button
                                            variant="default"
                                            className="h-10 min-w-0 gap-1 overflow-hidden px-2 text-xs"
                                            onClick={() => router.push(ROUTER_MAP.WALLETS_CREATE)}
                                            aria-label="Новый кошелек"
                                        >
                                            <Plus className="h-4 w-4 shrink-0" />
                                            <span className="truncate">Кошелек</span>
                                        </Button>
                                    )}
                                    <Button
                                        variant="default"
                                        className="h-10 min-w-0 gap-1 overflow-hidden px-2 text-xs"
                                        onClick={() => router.push(ROUTER_MAP.APPLICATIONS_CREATE)}
                                        aria-label="Новая заявка"
                                    >
                                        <Plus className="h-4 w-4 shrink-0" />
                                        <span className="truncate">Заявка</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className={isMobile ? 'pb-20' : undefined}>
                            <PageTransition>{children}</PageTransition>
                        </div>
                    </div>
                </main>
            </SidebarInset>
            <ReportsSheet />
        </SidebarProvider>
    );
}
