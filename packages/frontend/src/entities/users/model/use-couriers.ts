'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { UserService } from '@/entities/users/api/users-service';
import { COURIERS_QUERY_KEY } from '@/shared/utils/constants/users-query-key';

export const useCouriers = () => {
    const queryResult = useQuery({
        queryKey: COURIERS_QUERY_KEY,
        queryFn: () => UserService.getCouriers(),
    });

    useEffect(() => {
        if (queryResult.isError && queryResult.error) {
            toast.error('Не удалось загрузить исполнителей');
        }
    }, [queryResult.isError, queryResult.error]);

    return queryResult;
};
