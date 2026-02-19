import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { lockedPeriodApi } from '@/entities/locked-period';
import { LOCKED_PERIODS_QUERY_KEY } from '@/entities/locked-period/model/use-locked-periods';

export const useOpenLockedPeriod = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => lockedPeriodApi.openLockedPeriod(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: LOCKED_PERIODS_QUERY_KEY });
            toast.success(response.message || 'Период успешно открыт');
        },
    });
};
