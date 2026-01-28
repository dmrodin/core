import { useQuery } from '@tanstack/react-query';

import { currencyApi } from '../api/currency-api';

export const useCurrencies = (deleted?: boolean) => {
    return useQuery({
        queryKey: ['currencies', deleted],
        queryFn: () => currencyApi.getCurrencies(deleted),
    });
};
