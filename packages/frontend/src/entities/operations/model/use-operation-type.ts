'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { OperationTypeService } from '@/entities/operations/api/operation-type-sevice';
import { OperationType } from '@/entities/operations/model/operation-type-schemas';
import { OPERATION_TYPES_QUERY_KEY } from '@/shared/utils/constants/operation-types-query-key';

export const useOperationTypes = (deleted?: boolean, enabled = true) => {
    const queryResult = useQuery<OperationType[]>({
        queryKey: [OPERATION_TYPES_QUERY_KEY, deleted],
        queryFn: (): Promise<OperationType[]> => OperationTypeService.getOperationTypes(deleted),
        enabled,
    });

    useEffect(() => {
        if (queryResult.isError && queryResult.error) {
            toast.error('Не удалось загрузить типы операций');
        }
    }, [queryResult.isError, queryResult.error]);

    return queryResult;
};
