'use client';

import { Fragment } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/shared/ui/shadcn/breadcrumb';
import { ROUTER_MAP, ROUTER_TITLES } from '@/shared/utils/constants/router-map';

export function DynamicBreadcrumb({ compact = false }: { compact?: boolean }) {
    const pathname = usePathname();

    const segments = pathname.split('/').filter(Boolean);
    const isDashboard = segments[0] === 'dashboard';
    const subSegments = isDashboard ? segments.slice(1) : segments;
    const dashboardHref = ROUTER_MAP.DASHBOARD;
    const dashboardTitle = ROUTER_TITLES[dashboardHref] ?? 'Панель управления';

    const isUUID = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    };

    const items = subSegments
        .filter((segment) => !isUUID(segment))
        .map((segment, index) => {
            const href = [ROUTER_MAP.DASHBOARD, ...subSegments.filter((s) => !isUUID(s)).slice(0, index + 1)].join('/');
            const title = ROUTER_TITLES[href] ?? decodeURIComponent(segment);

            const isLast = index === subSegments.filter((s) => !isUUID(s)).length - 1;

            return { href, title, isLast };
        });

    if (compact) {
        const currentTitle = items.at(-1)?.title ?? dashboardTitle;

        return (
            <Breadcrumb className="min-w-0 overflow-hidden">
                <BreadcrumbList className="flex-nowrap overflow-hidden">
                    <BreadcrumbItem className="min-w-0">
                        <BreadcrumbPage className="truncate text-sm">{currentTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        );
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.length === 0 ? (
                    <BreadcrumbItem>
                        <BreadcrumbPage>{dashboardTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                ) : (
                    <Fragment>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={dashboardHref}>{dashboardTitle}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        {items.map((item, idx) => (
                            <Fragment key={item.href}>
                                <BreadcrumbItem key={item.href}>
                                    {item.isLast ? (
                                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={item.href}>{item.title}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {idx < items.length - 1 && <BreadcrumbSeparator key={`${item.href}-sep`} />}
                            </Fragment>
                        ))}
                    </Fragment>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
