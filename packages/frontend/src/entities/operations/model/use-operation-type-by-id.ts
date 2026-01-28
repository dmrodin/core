import { useQuery } from '@tanstack/react-query';

import { OperationTypeService } from '../api/operation-type-sevice';

export const useOperationTypeById = (id: string) => {
    return useQuery({
        queryKey: ['operation-type', id],
        queryFn: () => OperationTypeService.getOperationTypeById(id),
        enabled: !!id,
    });
};
