import {
    GetWalletAnalyticsParams,
    GetWalletAnalyticsResponse,
    GetWalletAnalyticsResponseSchema,
} from '@/entities/analytics/model/analytics-schemas';
import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

export class AnalyticsService {
    public static async getWalletAnalytics(params?: GetWalletAnalyticsParams): Promise<GetWalletAnalyticsResponse> {
        const response = await axiosInstance.get(API_MAP.WALLETS.ANALYTICS, {
            params,
        });
        return GetWalletAnalyticsResponseSchema.parse(response.data);
    }
}
