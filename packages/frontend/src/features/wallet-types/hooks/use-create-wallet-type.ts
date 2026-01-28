import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { walletTypeApi } from '@/entities/wallet-type';
import type { CreateWalletTypeRequest } from '@/entities/wallet-type/model/wallet-type-schemas';

export const useCreateWalletType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateWalletTypeRequest) => walletTypeApi.createWalletType(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['wallet-types'] });
            toast.success(response.message || 'Тип кошелька успешно создан');
        },
    });
};
