import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { OperationTypeService } from '@/entities/operations/api/operation-type-sevice';
import type { UpdateOperationTypeRequest } from '@/entities/operations/model/operation-type-schemas';

export const useUpdateOperationType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOperationTypeRequest }) =>
            OperationTypeService.updateOperationType(id, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['operation-types'] });
            toast.success(response.message || 'Тип операции успешно обновлен');
        },
    });
};
