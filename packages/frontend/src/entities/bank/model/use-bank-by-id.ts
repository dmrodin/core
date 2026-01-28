'use client';

import { useQuery } from '@tanstack/react-query';

import { BankService } from '../api/bank-service';
import { BANKS_QUERY_KEY } from './use-banks';

export const useBankById = (id: string) => {
    return useQuery({
        queryKey: [...BANKS_QUERY_KEY, id],
        queryFn: () => BankService.getBankById(id),
        enabled: !!id,
    });
};
