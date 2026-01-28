import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { networkApi } from '@/entities/network/api/network-api';

export const useDeleteNetworkType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => networkApi.deleteNetworkType(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['network-types'] });
            toast.success(response.message || 'Тип сети успешно удалён');
        },
    });
};
