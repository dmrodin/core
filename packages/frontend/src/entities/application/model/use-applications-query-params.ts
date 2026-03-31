'use client';

import { useMemo } from 'react';

import { useSearchParams } from 'next/navigation';

import { GetApplicationsFilters } from '@/entities/application/model/application-schemas';

export function useApplicationsQueryParams(): GetApplicationsFilters {
    const searchParams = useSearchParams();

    const search = searchParams.get('search') ?? undefined;
    const status = searchParams.get('status') === 'all' ? undefined : (searchParams.get('status') ?? 'open');
    const sortField = searchParams.get('sortField') ?? undefined;
    const sortOrder = searchParams.get('sortOrder') ?? undefined;
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');
    const limit = limitParam ? Number(limitParam) : 10;

    const createdFrom = searchParams.get('createdFrom') ?? undefined;
    const createdTo = searchParams.get('createdTo') ?? undefined;

    return useMemo(() => {
        const params: GetApplicationsFilters = {};

        if (search) params.search = search;
        if (status) params.status = status as 'open' | 'done';
        if (sortField) params.sortField = sortField as 'status' | 'amount' | 'meetingDate' | 'createdAt' | 'updatedAt';
        if (sortOrder) params.sortOrder = sortOrder as 'asc' | 'desc';

        if (createdFrom) params.createdFrom = createdFrom;
        if (createdTo) params.createdTo = createdTo;

        params.page = pageParam ? Number(pageParam) : 1;
        params.limit = limit;

        return params;
    }, [search, status, sortField, sortOrder, limit, pageParam, createdFrom, createdTo]);
}
