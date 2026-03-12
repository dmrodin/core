import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { axiosInstance } from '@/shared/api/axios-instance';

interface ResetUserPasswordParams {
    id: string;
    password: string;
}

export const useResetUserPassword = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, password }: ResetUserPasswordParams) => {
            const { data } = await axiosInstance.patch(`/users/${id}`, { password });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Пароль обновлён');
        },
    });
};
