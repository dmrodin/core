'use client';

import { ComponentProps } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
    Book,
    Boxes,
    Building2,
    ChartColumnIncreasing,
    Coins,
    FolderKanban,
    HandshakeIcon,
    Home,
    Layers,
    LifeBuoy,
    ListChecks,
    MessageCircle,
    Network,
    Ticket,
    Users,
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
import { NavMain } from '@/widgets';
import { NavSecondary } from '@/widgets';
import { NavUser } from '@/widgets';
import { ThemeToggle } from '@/widgets';

const data = {
    user: {
        name: 'Admin',
        email: 'admin@example.com',
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
            title: 'Справочники',
            url: ROUTER_MAP.GUIDES,
            icon: Book,
        },
        {
            title: 'Пользователи',
            url: ROUTER_MAP.USERS,
            icon: Users,
        },
        {
            title: 'Валюты',
            url: ROUTER_MAP.CURRENCIES,
            icon: Coins,
        },
        {
            title: 'Сети',
            url: ROUTER_MAP.NETWORKS,
            icon: Network,
        },
        {
            title: 'Типы сетей',
            url: ROUTER_MAP.NETWORK_TYPES,
            icon: Layers,
        },
        {
            title: 'Типы операций',
            url: ROUTER_MAP.OPERATION_TYPES,
            icon: ListChecks,
        },
        {
            title: 'Типы кошельков',
            url: ROUTER_MAP.WALLET_TYPES,
            icon: FolderKanban,
        },
        {
            title: 'Платформы',
            url: ROUTER_MAP.PLATFORMS,
            icon: Boxes,
        },
        {
            title: 'Банки',
            url: ROUTER_MAP.BANKS,
            icon: Building2,
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
            title: 'Отчеты',
            url: '#',
            isAction: true,
            icon: ChartColumnIncreasing,
        },
    ],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
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
                <NavMain items={data.navMain} label="Главное" />
                <NavSecondary items={data.projects} label="Данные" />
                <NavSecondary items={data.navSecondary} className="mt-auto" label="Другое" />
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center justify-between gap-2">
                    <NavUser user={data.user} />
                    <ThemeToggle />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
