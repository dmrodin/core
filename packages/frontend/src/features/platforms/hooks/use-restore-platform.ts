'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PlatformService } from '@/entities/platform';
import { PLATFORMS_QUERY_KEY } from '@/entities/platform/model/use-platforms';

export const useRestorePlatform = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => PlatformService.restorePlatform(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PLATFORMS_QUERY_KEY });
            toast.success('Платформа успешно восстановлена');
        },
    });
};
