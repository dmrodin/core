import { CurrenciesResponse, GetCurrenciesResponseSchema } from '@/entities/currency/model/currency-schemas';
import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

export class CurrencyService {
    public static async getCurrencies(): Promise<CurrenciesResponse> {
        const response = await axiosInstance.get(API_MAP.CURRENCIES.CURRENCIES);
        const parsedData = GetCurrenciesResponseSchema.parse(response.data);
        return parsedData;
    }
}
