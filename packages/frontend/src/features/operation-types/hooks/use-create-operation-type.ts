import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { OperationTypeService } from '@/entities/operations/api/operation-type-sevice';
import type { CreateOperationTypeRequest } from '@/entities/operations/model/operation-type-schemas';

export const useCreateOperationType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOperationTypeRequest) => OperationTypeService.createOperationType(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['operation-types'] });
            toast.success(response.message || 'Тип операции успешно создан');
        },
    });
};
