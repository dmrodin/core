import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { networkApi } from '@/entities/network/api/network-api';
import type { UpdateNetworkRequest } from '@/entities/network/model/network-schemas';

export const useUpdateNetwork = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateNetworkRequest }) => networkApi.updateNetwork(id, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['networks'] });
            toast.success(response.message || 'Сеть успешно обновлена');
        },
    });
};
