import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { OperationTypeService } from '@/entities/operations/api/operation-type-sevice';

export const useDeleteOperationType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => OperationTypeService.deleteOperationType(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['operation-types'] });
            toast.success(response.message || 'Тип операции успешно удален');
        },
    });
};
