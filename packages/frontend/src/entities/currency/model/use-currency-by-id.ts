import { useQuery } from '@tanstack/react-query';

import { currencyApi } from '../api/currency-api';

export const useCurrencyById = (id: string) => {
    return useQuery({
        queryKey: ['currency', id],
        queryFn: async () => {
            const response = await currencyApi.getCurrencies();
            const currency = response.currencies.find((c) => c.id === id);
            if (!currency) {
                throw new Error('Валюта не найдена');
            }
            return currency;
        },
        enabled: !!id,
    });
};
