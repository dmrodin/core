import { useQuery } from '@tanstack/react-query';

import { WalletService } from '../api/wallet-service';

export const WALLET_QUERY_KEY = 'wallet';

export const useWallet = (id: string) => {
    return useQuery({
        queryKey: [WALLET_QUERY_KEY, id],
        queryFn: () => WalletService.getWalletById(id),
        enabled: !!id,
    });
};
