'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { BankService } from '@/entities/bank';
import { BANKS_QUERY_KEY } from '@/entities/bank/model/use-banks';

export const useDeleteBank = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => BankService.deleteBank(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BANKS_QUERY_KEY });
            toast.success('Банк успешно удалён');
        },
    });
};
