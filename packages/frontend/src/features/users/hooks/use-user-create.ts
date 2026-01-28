'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { RegisterRequest } from '@/entities/auth';
import { UserService } from '@/entities/users/api/users-service';
import { USERS_QUERY_KEY } from '@/shared/utils/constants/users-query-key';

export const useCreateUser = () => {
    return useMutation({
        mutationKey: USERS_QUERY_KEY,
        mutationFn: (userData: RegisterRequest) => UserService.createUser(userData),

        onSuccess: (data) => {
            toast.success(`Пользователь "${data.username}" создан успешно`);
        },
    });
};
