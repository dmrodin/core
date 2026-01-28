import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { networkTypeApi } from '@/entities/network/api/network-type-api';
import type { CreateNetworkTypeRequest } from '@/entities/network/model/network-type-schemas';

export const useCreateNetworkType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateNetworkTypeRequest) => networkTypeApi.createNetworkType(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['network-types'] });
            toast.success(response.message || 'Тип сети успешно создан');
        },
    });
};
