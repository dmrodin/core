import { useQuery } from '@tanstack/react-query';

import { fetchRatesSnapshot } from '@/entities/calculator/api/rates';

export const RATES_SNAPSHOT_QUERY_KEY = ['rates-snapshot'] as const;

export function useRatesSnapshot() {
    return useQuery({
        queryKey: RATES_SNAPSHOT_QUERY_KEY,
        queryFn: fetchRatesSnapshot,
        refetchInterval: 15 * 60 * 1000,
    });
}
