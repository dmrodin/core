import { axiosInstance } from '@/shared/api/axios-instance';

import {
    CreateCurrencyRequest,
    CreateCurrencyResponseSchema,
    DeleteCurrencyResponseSchema,
    GetCurrenciesResponseSchema,
    RestoreCurrencyResponseSchema,
    UpdateCurrencyRequest,
    UpdateCurrencyResponseSchema,
} from '../model/currency-schemas';

import type {
    CreateCurrencyResponse,
    DeleteCurrencyResponse,
    GetCurrenciesResponse,
    RestoreCurrencyResponse,
    UpdateCurrencyResponse,
} from '../model/currency-schemas';

export const currencyApi = {
    getCurrencies: async (deleted?: boolean): Promise<GetCurrenciesResponse> => {
        const { data } = await axiosInstance.get('/currencies', {
            params: deleted !== undefined ? { deleted } : {},
        });
        return GetCurrenciesResponseSchema.parse(data);
    },

    createCurrency: async (dto: CreateCurrencyRequest): Promise<CreateCurrencyResponse> => {
        const { data } = await axiosInstance.post('/currencies', dto);
        return CreateCurrencyResponseSchema.parse(data);
    },

    updateCurrency: async (id: string, dto: UpdateCurrencyRequest): Promise<UpdateCurrencyResponse> => {
        const { data } = await axiosInstance.put(`/currencies/${id}`, dto);
        return UpdateCurrencyResponseSchema.parse(data);
    },

    deleteCurrency: async (id: string): Promise<DeleteCurrencyResponse> => {
        const { data } = await axiosInstance.delete(`/currencies/${id}`);
        return DeleteCurrencyResponseSchema.parse(data);
    },

    restoreCurrency: async (id: string): Promise<RestoreCurrencyResponse> => {
        const { data } = await axiosInstance.put(`/currencies/${id}/restore`);
        return RestoreCurrencyResponseSchema.parse(data);
    },
};
