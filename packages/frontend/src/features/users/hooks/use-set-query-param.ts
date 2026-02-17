'use client';

import { useCallback } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { GetUsersParams } from '@/entities/users/model/user-schemas';

export function useSetQueryParam() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const setQueryParam = useCallback(
        (key: string, value: string | number | undefined) => {
            const params = new URLSearchParams(searchParams.toString());

            if (!value) {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }

            const qs = params.toString();
            router.push(qs ? `${pathname}?${qs}` : pathname);
        },
        [searchParams, router, pathname],
    );

    function setAllQueryParams(filters: Partial<GetUsersParams>) {
        const params = new URLSearchParams();
        params.set('page', String(filters.page ?? 1));
        params.set('limit', String(filters.limit ?? 100));
        if (filters.search && filters.search.trim() !== '') params.set('search', filters.search);
        if (filters.roleCode) params.set('roleCode', filters.roleCode);
        if (filters.isHolder !== undefined) params.set('isHolder', String(filters.isHolder));
        if (filters.isCourier !== undefined) params.set('isCourier', String(filters.isCourier));
        if (filters.blocked !== undefined) params.set('blocked', String(filters.blocked));
        if (filters.telegramNotifications !== undefined)
            params.set('telegramNotifications', String(filters.telegramNotifications));
        if (filters.telegramId && filters.telegramId.trim() !== '') params.set('telegramId', filters.telegramId);
        if (filters.sortField) params.set('sortField', filters.sortField);
        if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }

    return { setQueryParam, setAllQueryParams, searchParams };
}
