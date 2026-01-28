import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { networkApi } from '@/entities/network/api/network-api';
import type { CreateNetworkRequest } from '@/entities/network/model/network-schemas';

export const useCreateNetwork = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateNetworkRequest) => networkApi.createNetwork(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['networks'] });
            toast.success(response.message || 'Сеть успешно создана');
        },
    });
};
