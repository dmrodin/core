'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { UserService } from '@/entities/users/api/users-service';

export const USERS_QUERY_KEY = 'users';

export const useUsers = (enabled = true) => {
    const queryResult = useQuery({
        queryKey: [USERS_QUERY_KEY],
        queryFn: () => UserService.getUsers(),
        enabled,
    });

    useEffect(() => {
        if (queryResult.isError && queryResult.error) {
            toast.error('Не удалось загрузить пользователей');
        }
    }, [queryResult.isError, queryResult.error]);

    return queryResult;
};
