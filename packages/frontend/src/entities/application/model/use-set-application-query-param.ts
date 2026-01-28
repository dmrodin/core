import { useCallback } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { GetApplicationsFilters } from '@/entities/application/model/application-schemas';

export function useSetApplicationQueryParam() {
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

    function setAllQueryParams(filters: Partial<GetApplicationsFilters>) {
        const params = new URLSearchParams();
        params.set('page', String(filters.page ?? 1));
        params.set('limit', String(filters.limit ?? 10));
        if (filters.search && filters.search.trim() !== '') params.set('search', filters.search);
        if (filters.status) params.set('status', filters.status);
        if (filters.sortField) params.set('sortField', filters.sortField);
        if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
        if (filters.createdFrom) params.set('createdFrom', filters.createdFrom);
        if (filters.createdTo) params.set('createdTo', filters.createdTo);
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    }

    return { setQueryParam, setAllQueryParams, searchParams };
}
