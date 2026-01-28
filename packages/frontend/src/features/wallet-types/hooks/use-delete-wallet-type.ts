import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { walletTypeApi } from '@/entities/wallet-type';

export const useDeleteWalletType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => walletTypeApi.deleteWalletType(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['wallet-types'] });
            toast.success(response.message || 'Тип кошелька успешно удалён');
        },
    });
};
