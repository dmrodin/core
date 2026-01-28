import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { axiosInstance } from '@/shared/api/axios-instance';

export const useRestoreWalletType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await axiosInstance.patch(`/wallet-types/${id}/restore`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet-types'] });
            toast.success('Тип кошелька восстановлен');
        },
    });
};
