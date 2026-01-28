import { useQuery } from '@tanstack/react-query';

import { monthlyAnalyticsService } from '../api/monthly-analytics-service';

export const useMonthlyAnalytics = () => {
    return useQuery({
        queryKey: ['monthly-analytics'],
        queryFn: () => monthlyAnalyticsService.getMonthlyAnalytics(),
    });
};
