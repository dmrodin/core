'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { NetworkService } from '@/entities/network/api/network-service';
import { NETWORKS_QUERY_KEY } from '@/shared/utils/constants/network-query-key';

export const useNetworks = () => {
    const queryResult = useQuery({
        queryKey: NETWORKS_QUERY_KEY,
        queryFn: () => NetworkService.getNetworks(),
    });

    useEffect(() => {
        if (queryResult.isError && queryResult.error) {
            toast.error('Не удалось загрузить сети');
        }
    }, [queryResult.isError, queryResult.error]);

    return queryResult;
};
