import { useQuery } from '@tanstack/react-query';

import { networkApi } from '../api/network-api';

export const useNetworksList = (deleted?: boolean) => {
    return useQuery({
        queryKey: ['networks', deleted],
        queryFn: () => networkApi.getNetworks(deleted),
    });
};
