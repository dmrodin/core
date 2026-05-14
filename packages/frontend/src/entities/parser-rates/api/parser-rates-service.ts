import axios from 'axios';

import { axiosInstance } from '@/shared/api/axios-instance';

import { BankRates, BankRatesResponseSchema, parseTajikRatesResponse, TajikRates } from '../model/parser-rates-schemas';

export const ParserRatesService = {
    async getTajikRates(): Promise<TajikRates> {
        const { data } = await axios.get('/api/parser-rates/tajik');
        return parseTajikRatesResponse(data);
    },

    async getBankRates(): Promise<BankRates> {
        const { data } = await axiosInstance.get('/parser/latest-bank-rates');
        return BankRatesResponseSchema.parse(data);
    },
};
