import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { CreateWalletRequest } from '@/entities/wallet';
import { WalletService } from '@/entities/wallet/api/wallet-service';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export function useUpdateWallet(walletId: string) {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateWalletRequest) => WalletService.updateWallet(walletId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', walletId] });
            queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
            toast.success('Кошелек успешно обновлен');
            router.push(ROUTER_MAP.WALLETS);
        },
    });
}
