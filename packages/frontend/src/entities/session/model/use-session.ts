import { useRouter } from 'next/navigation';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { SessionService } from '@/entities/session/api/session-service';
import { type DeactivateSessionsDto, type GetSessionsResponseDto } from '@/entities/session/model/session-schemas';
import {
    SESSIONS_QUERY_KEY,
    SESSION_DEACTIVATE_MUTATION_KEY,
    SESSION_DELETE_MUTATION_KEY,
} from '@/shared/utils/constants/session-query-key';

export const useSessions = (params?: { page?: number; limit?: number }) =>
    useQuery<GetSessionsResponseDto>({
        queryKey: SESSIONS_QUERY_KEY,
        queryFn: () => SessionService.getSessions(params),
    });

export const useDeactivateMySession = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationKey: SESSION_DELETE_MUTATION_KEY,
        mutationFn: (id: string) => SessionService.delete(id),
        onSuccess: () => {
            toast.success('Сессия деактивирована');
            queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
            router.refresh?.();
        },
    });
};

export const useDeactivateSessions = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationKey: SESSION_DEACTIVATE_MUTATION_KEY,
        mutationFn: (dto: DeactivateSessionsDto) => SessionService.deactivateSessions(dto),
        onSuccess: (data) => {
            toast.success(`Деактивировано сессий: ${data.deactivatedCount}`);
            queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
            router.refresh?.();
        },
    });
};
