import { axiosInstance } from '@/shared/api/axios-instance';

import { GetWalletMonthlyAnalyticsResponseSchema } from '../model/monthly-analytics-schemas';

export const monthlyAnalyticsService = {
    getMonthlyAnalytics: async () => {
        const response = await axiosInstance.get('/wallets/analytics/monthly');
        return GetWalletMonthlyAnalyticsResponseSchema.parse(response.data);
    },
};
