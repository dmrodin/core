'use client';

import { useQuery } from '@tanstack/react-query';

import { PlatformService } from '../api/platform-service';
import { PLATFORMS_QUERY_KEY } from './use-platforms';

export const usePlatformById = (id: string) => {
    return useQuery({
        queryKey: [...PLATFORMS_QUERY_KEY, id],
        queryFn: () => PlatformService.getPlatformById(id),
        enabled: !!id,
    });
};
