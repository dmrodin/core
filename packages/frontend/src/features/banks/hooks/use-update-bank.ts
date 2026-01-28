'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { BankService, UpdateBankRequest } from '@/entities/bank';
import { BANKS_QUERY_KEY } from '@/entities/bank/model/use-banks';

export const useUpdateBank = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBankRequest }) => BankService.updateBank(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BANKS_QUERY_KEY });
            toast.success('Банк успешно обновлён');
        },
    });
};
