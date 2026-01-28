import { useQuery } from '@tanstack/react-query';

import { walletTypeApi } from '../api/wallet-type-api';

export const useWalletType = (id: string) => {
    return useQuery({
        queryKey: ['wallet-type', id],
        queryFn: async () => {
            const response = await walletTypeApi.getWalletTypes();
            const walletType = response.walletTypes.find((wt) => wt.id === id);
            if (!walletType) {
                throw new Error('Тип кошелька не найден');
            }
            return walletType;
        },
        enabled: !!id,
    });
};
