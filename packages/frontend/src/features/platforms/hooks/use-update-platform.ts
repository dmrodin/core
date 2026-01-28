'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PlatformService, UpdatePlatformRequest } from '@/entities/platform';
import { PLATFORMS_QUERY_KEY } from '@/entities/platform/model/use-platforms';

export const useUpdatePlatform = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlatformRequest }) =>
            PlatformService.updatePlatform(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PLATFORMS_QUERY_KEY });
            toast.success('Платформа успешно обновлена');
        },
    });
};
