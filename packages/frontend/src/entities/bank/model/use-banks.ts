'use client';

import { useQuery } from '@tanstack/react-query';

import { BankService } from '../api/bank-service';

export const BANKS_QUERY_KEY = ['banks'];

export const useBanks = () => {
    return useQuery({
        queryKey: BANKS_QUERY_KEY,
        queryFn: () => BankService.getBanks(),
    });
};
