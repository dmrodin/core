import { useQuery } from '@tanstack/react-query';

import { networkTypeApi } from '../api/network-type-api';

export const useNetworkTypesList = (deleted?: boolean) => {
    return useQuery({
        queryKey: ['network-types', deleted],
        queryFn: () => networkTypeApi.getNetworkTypes(deleted),
    });
};
