'use client';

import { Fragment } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/shadcn/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/shared/ui/shadcn/sidebar';
import { useSidebar } from '@/shared/ui/shadcn/sidebar';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export function NavMain({
    items,
    label,
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
    label?: string;
}) {
    const { isMobile, setOpenMobile } = useSidebar();
    const pathname = usePathname();

    const handleNavigate = () => {
        if (isMobile) setOpenMobile(false);
    };

    const isMainActive = (url: string) => {
        if (url === ROUTER_MAP.DASHBOARD) return pathname === ROUTER_MAP.DASHBOARD;
        return pathname.startsWith(url);
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={isMainActive(item.url)}
                                className="data-[active=true]:bg-primary/90! data-[active=true]:text-primary-foreground!"
                            >
                                <Link href={item.url} onClick={handleNavigate}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                            {item.items?.length ? (
                                <Fragment>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                                            <ChevronRight />
                                            <span className="sr-only">Переключить</span>
                                        </SidebarMenuAction>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={pathname.startsWith(subItem.url)}
                                                        className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                                                    >
                                                        <Link href={subItem.url} onClick={handleNavigate}>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </Fragment>
                            ) : null}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
