'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { NetworkService } from '@/entities/network/api/network-service';
import { NETWORK_TYPES_QUERY_KEY } from '@/shared/utils/constants/network-query-key';

export const useNetworkTypes = (networkId?: string) => {
    const queryResult = useQuery({
        queryKey: [...NETWORK_TYPES_QUERY_KEY, networkId ?? 'all'],
        queryFn: () => NetworkService.getNetworkTypes(networkId),
    });

    useEffect(() => {
        if (queryResult.isError && queryResult.error) {
            toast.error('Не удалось загрузить типы сетей');
        }
    }, [queryResult.isError, queryResult.error]);

    return queryResult;
};
