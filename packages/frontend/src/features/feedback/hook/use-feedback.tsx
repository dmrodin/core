'use client';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { HelpService } from '@/entities/help';
import { CreateHelp } from '@/entities/help';
import { ROUTER_MAP } from '@/shared';

export const useCreateHelp = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['help', 'create'],
        mutationFn: (data: CreateHelp) => HelpService.create(data),
        onSuccess: () => {
            toast.success('Обращение успешно отправленно!');
            queryClient.invalidateQueries({ queryKey: ['help'] });
            router.push(ROUTER_MAP.HELP);
        },
    });
};
