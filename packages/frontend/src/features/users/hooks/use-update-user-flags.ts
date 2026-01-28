import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { axiosInstance } from '@/shared/api/axios-instance';

interface UpdateUserFlagsParams {
    id: string;
    isHolder?: boolean;
    isCourier?: boolean;
    telegramNotifications?: boolean;
}

export const useUpdateUserFlags = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...flags }: UpdateUserFlagsParams) => {
            const { data } = await axiosInstance.patch(`/users/${id}`, flags);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Настройки пользователя обновлены');
        },
    });
};
