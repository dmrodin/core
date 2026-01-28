import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { currencyApi } from '@/entities/currency/api/currency-api';
import type { CreateCurrencyRequest } from '@/entities/currency/model/currency-schemas';

export const useCreateCurrency = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCurrencyRequest) => currencyApi.createCurrency(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['currencies'] });
            toast.success(response.message || 'Валюта успешно создана');
        },
    });
};
