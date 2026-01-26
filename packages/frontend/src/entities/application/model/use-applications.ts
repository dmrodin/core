import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import {
    InfiniteData,
    type QueryFunctionContext,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { formatDateTime } from '@/shared/lib/utils';

import { ApplicationService } from '@/entities/application/api/application-service';
import {
    ApplicationResponse,
    GetApplicationByIdResponse,
    GetApplicationsFilters,
    GetApplicationsResponse,
    UpdateApplicationRequest,
    getApplicationsFiltersSchema,
} from '@/entities/application/model/application-schemas';
import {
    APPLICATIONS_WITH_FILTERS_KEY,
    APPLICATION_DELETE_MUTATION_KEY,
    APPLICATION_QUERY_KEY,
} from '@/shared/utils/constants/application-key';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export const useUpdateApplication = () => {
    const router = useRouter();
    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & UpdateApplicationRequest) => ApplicationService.update(id, data),
        onSuccess: () => {
            router.push(ROUTER_MAP.APPLICATIONS);
            toast.success('Заявка обновлена');
        },
    });
};
export const useUpdateStatusApplication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & UpdateApplicationRequest) => ApplicationService.update(id, data),
        onSuccess: () => {
            // Инвалидируем кэш заявок для обновления списка
            queryClient.invalidateQueries({ queryKey: APPLICATION_QUERY_KEY });
            toast.success('Статус заявки обновлён');
        },
    });
};

export const useApplications = (id: number) => {
    return useQuery<GetApplicationByIdResponse>({
        queryKey: [...APPLICATION_QUERY_KEY, id],
        queryFn: () => ApplicationService.getById(id.toString()),
    });
};

export const useInfiniteApplications = (filters?: GetApplicationsFilters, defaultLimit = 100) => {
    return useInfiniteQuery<
        GetApplicationsResponse,
        Error,
        InfiniteData<GetApplicationsResponse>,
        [string, Partial<GetApplicationsFilters> | undefined]
    >({
        queryKey: APPLICATIONS_WITH_FILTERS_KEY(filters),

        queryFn: async (context: QueryFunctionContext<[string, Partial<GetApplicationsFilters> | undefined]>) => {
            const rawPageParam = context.pageParam;
            const page =
                typeof rawPageParam === 'number'
                    ? rawPageParam
                    : typeof rawPageParam === 'string' && rawPageParam !== ''
                      ? Number(rawPageParam)
                      : 1;

            const queryFilters = context.queryKey[1] ?? {};

            const parsedFilters = getApplicationsFiltersSchema.parse({
                ...queryFilters,
                page,
                limit: queryFilters.limit ?? defaultLimit,
            });
            return await ApplicationService.getApplications(parsedFilters);
        },

        initialPageParam: 1,

        getNextPageParam: (lastPage: GetApplicationsResponse) => {
            const { page, limit, total } = lastPage.pagination;
            const totalPages = Math.ceil(total / limit);

            return page < totalPages ? page + 1 : undefined;
        },

        getPreviousPageParam: (firstPage) => {
            const { page } = firstPage.pagination;
            return page > 1 ? page - 1 : undefined;
        },
    });
};

export const useDeleteApplication = (filters?: GetApplicationsFilters) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: APPLICATION_DELETE_MUTATION_KEY,
        mutationFn: (id: number) => ApplicationService.delete(id),

        onSuccess: () => {
            toast.success('Заявка удалена');

            queryClient.invalidateQueries({
                queryKey: APPLICATIONS_WITH_FILTERS_KEY(filters) as readonly unknown[],
            });
        },
    });
};

export const useApplicationsList = () => {
    return useQuery({
        queryKey: ['applications', 'list', 'open'],
        queryFn: () =>
            ApplicationService.getApplications({
                page: 1,
                limit: 100,
                status: 'open',
            }),
    });
};

export function useCopyApplication() {
    const copyApplication = useCallback(async (application: ApplicationResponse) => {
        const lines = [
            `id заявки: ${application.id}`,
            `Статус: ${application.status == 'done' ? 'Завершена' : 'В работе'}`,
            `Сумма: ${application.amount}`,
            `Валюта: ${application.currency.code}`,
            `Тип операции: ${application.operation_type.name}`,
            `Создана: ${formatDateTime(application.createdAt)}`,
            `Исполнитель: ${application.assignee_user.username}`,
            `Дата встречи: ${formatDateTime(application.meetingDate)}`,
        ];

        if (application.phone) {
            lines.push(`Телефон: ${application.phone}`);
        }
        if (application.telegramUsername) {
            lines.push(`Telegram: ${application.telegramUsername}`);
        }
        if (application.description) {
            lines.push(`Описание: ${application.description}`);
        }

        const text = lines.join('\n');

        try {
            await navigator.clipboard.writeText(text);
            toast.success('Скопировано в буфер обмена');
            return true;
        } catch (err) {
            console.error('Ошибка при копировании:', err);
            toast.error('Не удалось скопировать');
            return false;
        }
    }, []);

    return { copyApplication };
}
