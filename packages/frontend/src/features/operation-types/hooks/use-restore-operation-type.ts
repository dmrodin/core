'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { OperationTypeService } from '@/entities/operations';

export const useRestoreOperationType = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => OperationTypeService.restoreOperationType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operationTypes'] });
            toast.success('Тип операции успешно восстановлен');
        },
    });
};
