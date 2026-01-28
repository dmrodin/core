import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApplicationService, CreateApplicationRequest } from '@/entities/application';
import { APPLICATION_QUERY_KEY } from '@/shared';
import { ROUTER_MAP } from '@/shared';

export const useCreateApplication = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['applications', 'create'],
        mutationFn: (data: CreateApplicationRequest) => ApplicationService.create(data),
        onSuccess: () => {
            toast.success('Заявка успешно создана!');
            queryClient.invalidateQueries({ queryKey: [APPLICATION_QUERY_KEY] });
            router.push(ROUTER_MAP.APPLICATIONS);
        },
    });
};
