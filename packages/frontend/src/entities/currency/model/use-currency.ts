'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CurrencyService } from '@/entities/currency/api/currency-service';
import { CURRENCY_QUERY_KEY } from '@/shared/utils/constants/currency-query-key';

export const useCurrency = (enabled = true) => {
    const queryResult = useQuery({
        queryKey: [CURRENCY_QUERY_KEY],
        queryFn: () => CurrencyService.getCurrencies(),
        enabled,
    });

    useEffect(() => {
        if (queryResult.isError && queryResult.error) {
            toast.error('Не удалось загрузить валюты');
        }
    }, [queryResult.isError, queryResult.error]);

    return queryResult;
};
