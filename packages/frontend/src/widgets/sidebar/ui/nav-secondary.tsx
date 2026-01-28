import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { FileText, type LucideIcon } from 'lucide-react';

import { usePopapStore } from '@/entities/reports';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/shared';
import { useSidebar } from '@/shared';

export function NavSecondary({
    items,
    label,
    ...props
}: {
    items: {
        title: string;
        url: string;
        isAction?: boolean;
        icon: LucideIcon;
    }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup> & {
        label?: string;
    }) {
    const { isMobile, setOpenMobile } = useSidebar();
    const pathname = usePathname();

    const handleNavigate = () => {
        if (isMobile) setOpenMobile(false);
    };

    const toggleActive = usePopapStore((state) => state.toggleActive);

    return (
        <SidebarGroup {...props}>
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            {item.isAction ? (
                                <SidebarMenuButton size="sm" onClick={toggleActive} className="gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>Отчёты</span>
                                </SidebarMenuButton>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    size="sm"
                                    isActive={pathname.startsWith(item.url)}
                                    className="data-[active=true]:bg-primary! data-[active=true]:text-primary-foreground!"
                                >
                                    <Link href={item.url} onClick={handleNavigate}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
