import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { walletTypeApi } from '@/entities/wallet-type';
import type { UpdateWalletTypeRequest } from '@/entities/wallet-type/model/wallet-type-schemas';

export const useUpdateWalletType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateWalletTypeRequest }) =>
            walletTypeApi.updateWalletType(id, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['wallet-types'] });
            toast.success(response.message || 'Тип кошелька успешно обновлён');
        },
    });
};
