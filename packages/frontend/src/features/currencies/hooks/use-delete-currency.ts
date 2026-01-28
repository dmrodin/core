import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { currencyApi } from '@/entities/currency/api/currency-api';

export const useDeleteCurrency = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => currencyApi.deleteCurrency(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['currencies'] });
            toast.success(response.message || 'Валюта успешно удалена');
        },
    });
};
