import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { networkApi } from '@/entities/network/api/network-api';

export const useRestoreNetwork = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => networkApi.restoreNetwork(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['networks'] });
            toast.success(response.message || 'Сеть успешно восстановлена');
        },
    });
};
