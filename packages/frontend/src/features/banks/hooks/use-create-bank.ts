'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CreateBankRequest, BankService } from '@/entities/bank';
import { BANKS_QUERY_KEY } from '@/entities/bank/model/use-banks';

export const useCreateBank = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBankRequest) => BankService.createBank(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BANKS_QUERY_KEY });
            toast.success('Банк успешно создан');
        },
    });
};
