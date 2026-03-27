'use client';

import { ComponentProps } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
    Book,
    ChartColumnIncreasing,
    ClipboardList,
    HandshakeIcon,
    Home,
    LifeBuoy,
    MessageCircle,
    Ticket,
    Wallet,
} from 'lucide-react';
import {
    ROUTER_MAP,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/shared';
import { UserRole } from '@/entities/users/model/user-schemas';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { NavMain } from '@/widgets';
import { NavSecondary } from '@/widgets';
import { NavUser } from '@/widgets';
import { ThemeToggle } from '@/widgets';

const data = {
    user: {
        name: 'User',
        email: '',
        avatar: '/avatars/admin.jpg',
    },
    navMain: [
        {
            title: 'Главная',
            url: ROUTER_MAP.DASHBOARD,
            icon: Home,
            isActive: true,
        },
        {
            title: 'Операции',
            url: ROUTER_MAP.OPERATIONS,
            icon: HandshakeIcon,
        },
        {
            title: 'Кошельки',
            url: ROUTER_MAP.WALLETS,
            icon: Wallet,
        },
        {
            title: 'Заявки',
            url: ROUTER_MAP.APPLICATIONS,
            icon: Ticket,
        },
        {
            title: 'Регламенты',
            url: ROUTER_MAP.REGULATIONS,
            icon: ClipboardList,
        },
        {
            title: 'Справочники',
            url: ROUTER_MAP.GUIDES,
            icon: Book,
            items: [
                {
                    title: 'Гайды',
                    url: ROUTER_MAP.GUIDES,
                },
                {
                    title: 'Пользователи',
                    url: ROUTER_MAP.USERS,
                },
                {
                    title: 'Валюты',
                    url: ROUTER_MAP.CURRENCIES,
                },
                {
                    title: 'Сети',
                    url: ROUTER_MAP.NETWORKS,
                },
                {
                    title: 'Типы сетей',
                    url: ROUTER_MAP.NETWORK_TYPES,
                },
                {
                    title: 'Типы операций',
                    url: ROUTER_MAP.OPERATION_TYPES,
                },
                {
                    title: 'Типы кошельков',
                    url: ROUTER_MAP.WALLET_TYPES,
                },
                {
                    title: 'Платформы',
                    url: ROUTER_MAP.PLATFORMS,
                },
                {
                    title: 'Банки',
                    url: ROUTER_MAP.BANKS,
                },
                {
                    title: 'Блокировка периодов',
                    url: ROUTER_MAP.ADMIN,
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: 'Помощь',
            url: ROUTER_MAP.HELP,
            icon: LifeBuoy,
        },
        {
            title: 'Обратная связь',
            url: ROUTER_MAP.FEEDBACK,
            icon: MessageCircle,
        },
    ],
    projects: [
        {
            title: 'Аналитика',
            url: ROUTER_MAP.ANALYTICS,
            icon: ChartColumnIncreasing,
        },
        {
            title: 'Отчёты',
            url: '#',
            isAction: true,
            icon: ChartColumnIncreasing,
        },
    ],
};

const USER_RESTRICTED_NAV_URLS = new Set<string>([
    ROUTER_MAP.USERS,
    ROUTER_MAP.CURRENCIES,
    ROUTER_MAP.NETWORKS,
    ROUTER_MAP.NETWORK_TYPES,
    ROUTER_MAP.OPERATION_TYPES,
    ROUTER_MAP.WALLET_TYPES,
    ROUTER_MAP.PLATFORMS,
    ROUTER_MAP.BANKS,
    ROUTER_MAP.ADMIN,
]);

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
    const currentUser = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
    const hasAdminRole = currentUser?.roles?.some((role) => role.code === UserRole.ADMIN) ?? false;
    const isAuthResolving = !isAuthInitialized || (Boolean(token) && !currentUser);
    const isRestrictedRole =
        isAuthResolving ||
        (!hasAdminRole &&
            (currentUser?.roles?.some((role) => role.code === UserRole.USER || role.code === UserRole.MODERATOR) ??
                false));
    const navMainItems = isRestrictedRole
        ? data.navMain
              .map((item) => {
                  if (!item.items?.length) {
                      return USER_RESTRICTED_NAV_URLS.has(item.url) ? null : item;
                  }

                  const filteredItems = item.items.filter((subItem) => !USER_RESTRICTED_NAV_URLS.has(subItem.url));

                  if (!filteredItems.length) return null;

                  if (filteredItems.length === 1 && filteredItems[0].url === ROUTER_MAP.GUIDES) {
                      return {
                          title: filteredItems[0].title,
                          url: filteredItems[0].url,
                          icon: item.icon,
                      };
                  }

                  return {
                      ...item,
                      items: filteredItems,
                  };
              })
              .filter((item): item is (typeof data.navMain)[number] => Boolean(item))
        : data.navMain;

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={ROUTER_MAP.DASHBOARD}>
                                <Image
                                    src="/logo-circle.png"
                                    alt="MonteMove"
                                    width={32}
                                    height={32}
                                    className="w-8 h-8"
                                />
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">MonteMove</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMainItems} label="Главное" />
                <NavSecondary items={data.projects} label="Данные" />
                <NavSecondary items={data.navSecondary} className="mt-auto" label="Другое" />
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center justify-between gap-2">
                    <NavUser
                        user={{
                            name: currentUser?.username ?? data.user.name,
                            email: data.user.email,
                            avatar: data.user.avatar,
                        }}
                    />
                    <ThemeToggle />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
