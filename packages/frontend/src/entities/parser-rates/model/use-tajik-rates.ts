'use client';

import { useQuery } from '@tanstack/react-query';

import { ParserRatesService } from '../api/parser-rates-service';

export const TAJIK_RATES_QUERY_KEY = ['parser-rates', 'tajik'] as const;

export function useTajikRates(enabled = true) {
    return useQuery({
        queryKey: TAJIK_RATES_QUERY_KEY,
        queryFn: () => ParserRatesService.getTajikRates(),
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
        staleTime: 10_000,
        enabled,
    });
}
