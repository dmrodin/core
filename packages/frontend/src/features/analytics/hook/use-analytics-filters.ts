'use client';

import { useCallback, useMemo } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { GetWalletAnalyticsParams } from '@/entities/analytics/model/analytics-schemas';

export function useAnalyticsFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const filters = useMemo<GetWalletAnalyticsParams>(() => {
        return {
            currency: searchParams.get('currency') || undefined,
            holder: searchParams.get('holder') || undefined,
            dateStart: searchParams.get('dateStart') || undefined,
            dateEnd: searchParams.get('dateEnd') || undefined,
            includeDeleted: searchParams.get('includeDeleted') === 'true',
            includeCash: searchParams.get('includeCash') !== 'false',
            includeVisa: searchParams.get('includeVisa') !== 'false',
        };
    }, [searchParams]);

    const setFilters = useCallback(
        (newFilters: Partial<GetWalletAnalyticsParams>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(newFilters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.set(key, String(value));
                } else {
                    params.delete(key);
                }
            });

            router.push(`${window.location.pathname}?${params.toString()}`);
        },
        [searchParams, router],
    );

    const resetFilters = useCallback(() => {
        router.push(window.location.pathname);
    }, [router]);

    return {
        filters,
        setFilters,
        resetFilters,
    };
}
