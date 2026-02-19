import { useQuery } from '@tanstack/react-query';

import { lockedPeriodApi } from '../api/locked-period-api';

export const LOCKED_PERIODS_QUERY_KEY = ['locked-periods'];

export const useLockedPeriods = () => {
    return useQuery({
        queryKey: LOCKED_PERIODS_QUERY_KEY,
        queryFn: () => lockedPeriodApi.getLockedPeriods(),
    });
};
