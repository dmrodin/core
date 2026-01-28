'use client';

import { useQuery } from '@tanstack/react-query';

import { PlatformService } from '../api/platform-service';

export const PLATFORMS_QUERY_KEY = ['platforms'];

export const usePlatforms = () => {
    return useQuery({
        queryKey: PLATFORMS_QUERY_KEY,
        queryFn: () => PlatformService.getPlatforms(),
    });
};
