import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import {
    InfiniteData,
    QueryFunctionContext,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { formatDate } from '@/shared/lib/utils';

import { GuideService } from '@/entities/guides/api/guide-service';
import {
    type CreateGuideRequest,
    type GetGuidesParamsRequest,
    GetGuidesParamsSchema,
    type GetGuidesResponse,
    type GuideResponse,
    type UpdateGuideRequest,
} from '@/entities/guides/model/guide-schemas';
import {
    FILTERED_GUIDES_QUERY_KEY,
    GUIDES_QUERY_KEY,
    GUIDES_WITH_FILTERS_KEY,
    GUIDE_CREATE_QUERY_KEY,
    GUIDE_DELETE_MUTATION_KEY,
    GUIDE_QUERY_KEY,
} from '@/shared/utils/constants/guide-query-key';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export const useCreateGuide = () => {
    const router = useRouter();
    return useMutation({
        mutationKey: GUIDE_CREATE_QUERY_KEY,
        mutationFn: (data: CreateGuideRequest) => GuideService.create(data),
        onSuccess: () => {
            router.push(ROUTER_MAP.GUIDES);
            toast.success('Справочник успешно создан');
        },
    });
};

export const useUpdateGuide = () => {
    const router = useRouter();
    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & UpdateGuideRequest) => GuideService.update(id, data),
        onSuccess: () => {
            router.push(ROUTER_MAP.GUIDES);
            toast.success('Справочник обновлён');
        },
    });
};

export const useGuide = (id: string) => {
    return useQuery({
        queryKey: GUIDE_QUERY_KEY(id),
        queryFn: () => GuideService.getById(id),
        enabled: !!id,
    });
};

export const useGuides = () => {
    return useQuery({
        queryKey: GUIDES_QUERY_KEY,
        queryFn: () => GuideService.getGuides(),
    });
};

export const useFilterGuides = (filter: GetGuidesParamsRequest) => {
    return useQuery({
        queryKey: FILTERED_GUIDES_QUERY_KEY,
        queryFn: () => GuideService.filter(filter),
    });
};

type GuideFilterWithPagination = GetGuidesParamsRequest & {
    page?: number;
    limit?: number;
};

export const useInfiniteGuides = (filters?: GetGuidesParamsRequest, defaultLimit = 100) => {
    return useInfiniteQuery<
        GetGuidesResponse,
        Error,
        InfiniteData<GetGuidesResponse>,
        [string, GetGuidesParamsRequest | undefined]
    >({
        queryKey: GUIDES_WITH_FILTERS_KEY(filters),

        queryFn: async (context: QueryFunctionContext<[string, GetGuidesParamsRequest | undefined]>) => {
            const rawPageParam = context.pageParam;
            const page =
                typeof rawPageParam === 'number'
                    ? rawPageParam
                    : typeof rawPageParam === 'string' && rawPageParam !== ''
                      ? Number(rawPageParam)
                      : 1;

            const queryFilters = context.queryKey[1] ?? {};

            GetGuidesParamsSchema.partial().parse(queryFilters);

            const response = await GuideService.filter({
                ...queryFilters,
                page,
                limit: defaultLimit,
            } as GuideFilterWithPagination);

            return response;
        },

        initialPageParam: 1,

        getNextPageParam: (lastPage, allPages) => {
            const total = lastPage?.pagination?.total ?? 0;
            const limit = defaultLimit;
            const totalPages = Math.max(1, Math.ceil(total / limit));
            return allPages.length < totalPages ? allPages.length + 1 : undefined;
        },
    });
};

export const useDeleteGuide = (filters?: GetGuidesParamsRequest) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: GUIDE_DELETE_MUTATION_KEY,
        mutationFn: (id: string) => GuideService.delete(id),

        onSuccess: () => {
            toast.success('Справочник удалён');

            queryClient.invalidateQueries({
                queryKey: GUIDES_WITH_FILTERS_KEY(filters) as readonly unknown[],
            });
        },
    });
};

export function useCopyGuide() {
    const copyGuide = useCallback(async (guide: GuideResponse) => {
        const lines = [`ФИО: ${guide.fullName}`];

        if (guide.phone) {
            lines.push(`Телефон: ${guide.phone}`);
        }
        if (guide.birthDate) {
            lines.push(`Дата рождения: ${formatDate(new Date(guide.birthDate))}`);
        }
        if (guide.cardNumber) {
            lines.push(`Номер карты: ${guide.cardNumber}`);
        }
        if (guide.address) {
            lines.push(`Адрес: ${guide.address}`);
        }
        if (guide.description) {
            lines.push(`Описание: ${guide.description}`);
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

    return { copyGuide };
}
