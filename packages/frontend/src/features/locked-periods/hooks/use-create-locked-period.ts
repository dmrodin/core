import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { lockedPeriodApi } from '@/entities/locked-period';
import type { CreateLockedPeriodRequest } from '@/entities/locked-period';
import { LOCKED_PERIODS_QUERY_KEY } from '@/entities/locked-period/model/use-locked-periods';

export const useCreateLockedPeriod = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateLockedPeriodRequest) => lockedPeriodApi.createLockedPeriod(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: LOCKED_PERIODS_QUERY_KEY });
            toast.success(response.message || 'Период блокировки успешно создан');
        },
    });
};
