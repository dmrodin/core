import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { currencyApi } from '@/entities/currency/api/currency-api';
import type { UpdateCurrencyRequest } from '@/entities/currency/model/currency-schemas';

export const useUpdateCurrency = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCurrencyRequest }) => currencyApi.updateCurrency(id, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['currencies'] });
            toast.success(response.message || 'Валюта успешно обновлена');
        },
    });
};
