'use client';

import { useQuery } from '@tanstack/react-query';

import { ParserRatesService } from '../api/parser-rates-service';

export const BANK_RATES_QUERY_KEY = ['parser-rates', 'banks'] as const;

export function useBankRates(enabled = true) {
    return useQuery({
        queryKey: BANK_RATES_QUERY_KEY,
        queryFn: () => ParserRatesService.getBankRates(),
        refetchInterval: 60_000,
        refetchIntervalInBackground: false,
        staleTime: 30_000,
        enabled,
    });
}
