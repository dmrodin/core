import { useQuery } from '@tanstack/react-query';

import { walletTypeApi } from '../api/wallet-type-api';

export const useWalletTypes = (deleted?: boolean) => {
    return useQuery({
        queryKey: ['wallet-types', deleted],
        queryFn: () => walletTypeApi.getWalletTypes(deleted),
    });
};
