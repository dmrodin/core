import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { networkTypeApi } from '@/entities/network/api/network-type-api';

export const useRestoreNetworkType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => networkTypeApi.restoreNetworkType(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['network-types'] });
            toast.success(response.message || 'Тип сети успешно восстановлен');
        },
    });
};
