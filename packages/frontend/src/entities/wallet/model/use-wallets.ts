'use client';

import { useEffect } from 'react';

import { InfiniteData, QueryFunctionContext, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { WalletService } from '@/entities/wallet/api/wallet-service';
import { GetWalletsFilter, GetWalletsResponse } from '@/entities/wallet/model/wallet-schemas';
import {
    PINNED_WALLETS_QUERY_KEY,
    WALLETS_QUERY_KEY,
    WALLETS_WITH_FILTERS_KEY,
} from '@/shared/utils/constants/wallets-query-key';

export const usePinnedWallets = (enabled = true) => {
    const queryResult = useQuery({
        queryKey: PINNED_WALLETS_QUERY_KEY,
        queryFn: () => WalletService.getPinnedWallets(),
        enabled,
    });

    useEffect(() => {
        if (queryResult.isError && queryResult.error) {
            toast.error('Не удалось загрузить закрепленные кошельки');
        }
    }, [queryResult.isError, queryResult.error]);

    return queryResult;
};

export const useWallets = (filters?: Partial<GetWalletsFilter>) => {
    const queryResult = useQuery({
        queryKey: [...WALLETS_QUERY_KEY, filters],
        queryFn: () => WalletService.getWallets(filters),
    });

    useEffect(() => {
        if (queryResult.isError && queryResult.error) {
            toast.error('Не удалось загрузить кошельки');
        }
    }, [queryResult.isError, queryResult.error]);

    return queryResult;
};

type WalletFilterWithPagination = Partial<GetWalletsFilter> & {
    page?: number;
    limit?: number;
};

export const useInfiniteWallets = (filters?: Partial<GetWalletsFilter>, defaultLimit = 100) => {
    return useInfiniteQuery<
        GetWalletsResponse,
        Error,
        InfiniteData<GetWalletsResponse>,
        [string, Partial<GetWalletsFilter> | undefined]
    >({
        queryKey: WALLETS_WITH_FILTERS_KEY(filters),

        queryFn: async (context: QueryFunctionContext<[string, Partial<GetWalletsFilter> | undefined]>) => {
            const rawPageParam = context.pageParam;
            const page =
                typeof rawPageParam === 'number'
                    ? rawPageParam
                    : typeof rawPageParam === 'string' && rawPageParam !== ''
                      ? Number(rawPageParam)
                      : 1;

            const queryFilters = context.queryKey[1] ?? {};

            const response = await WalletService.getWallets({
                ...queryFilters,
                page,
                limit: defaultLimit,
            } as WalletFilterWithPagination);

            return response;
        },

        initialPageParam: 1,

        getNextPageParam: (lastPage, allPages) => {
            const total = lastPage?.pagination?.total ?? 0;
            const limit = defaultLimit;
            const totalPages = Math.max(1, Math.ceil(total / limit));
            return allPages.length < totalPages ? allPages.length + 1 : undefined;
        },

        staleTime: 30000,
    });
};
