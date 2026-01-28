import { useQuery } from '@tanstack/react-query';

import { WalletService } from '../api/wallet-service';
import { GetWalletsFilter } from './wallet-schemas';

export const WALLETS_AGGREGATION_QUERY_KEY = 'walletsAggregation';

export function useWalletsAggregation(filters: GetWalletsFilter) {
    return useQuery({
        queryKey: [WALLETS_AGGREGATION_QUERY_KEY, filters],
        queryFn: () => WalletService.getWalletsAggregation(filters),
    });
}
