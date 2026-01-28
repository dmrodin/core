'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CreatePlatformRequest, PlatformService } from '@/entities/platform';
import { PLATFORMS_QUERY_KEY } from '@/entities/platform/model/use-platforms';

export const useCreatePlatform = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePlatformRequest) => PlatformService.createPlatform(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PLATFORMS_QUERY_KEY });
            toast.success('Платформа успешно создана');
        },
    });
};
