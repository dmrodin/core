import { useQuery } from '@tanstack/react-query';

import { WalletService } from '../api/wallet-service';

export function useWalletMonthlyLimit(walletId: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ['wallet-monthly-limit', walletId],
        queryFn: () => WalletService.getWalletMonthlyLimit(walletId),
        enabled: enabled && !!walletId,
    });
}
