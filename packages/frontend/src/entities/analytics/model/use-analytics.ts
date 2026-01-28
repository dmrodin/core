'use client';

import { useQuery } from '@tanstack/react-query';

import { AnalyticsService } from '@/entities/analytics/api/analytics-service';
import { GetWalletAnalyticsParams } from '@/entities/analytics/model/analytics-schemas';
import { ANALYTICS_QUERY_KEY } from '@/shared/utils/constants/analytics-query-key';

export function useWalletAnalytics(params?: GetWalletAnalyticsParams) {
    return useQuery({
        queryKey: [ANALYTICS_QUERY_KEY, params],
        queryFn: () => AnalyticsService.getWalletAnalytics(params),
    });
}
