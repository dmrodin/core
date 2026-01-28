'use client';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CreateWalletRequest } from '@/entities/wallet';
import { WalletService } from '@/entities/wallet/api/wallet-service';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';
import { PINNED_WALLETS_QUERY_KEY, WALLETS_QUERY_KEY } from '@/shared/utils/constants/wallets-query-key';

export const useCreateWallet = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: [...WALLETS_QUERY_KEY, 'create'],
        mutationFn: (payload: CreateWalletRequest) => WalletService.createWallet(payload),
        onSuccess: (wallet) => {
            const walletName = wallet.name?.trim() || 'Кошелек';
            toast.success(`"${walletName}" успешно создан`);
            queryClient.invalidateQueries({ queryKey: WALLETS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: PINNED_WALLETS_QUERY_KEY });
            router.push(ROUTER_MAP.WALLETS);
        },
    });
};
