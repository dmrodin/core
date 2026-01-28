import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { networkApi } from '@/entities/network/api/network-api';
import type { UpdateNetworkTypeRequest } from '@/entities/network/model/network-type-schemas';

export const useUpdateNetworkType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateNetworkTypeRequest }) =>
            networkApi.updateNetworkType(id, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['network-types'] });
            toast.success(response.message || 'Тип сети успешно обновлён');
        },
    });
};
