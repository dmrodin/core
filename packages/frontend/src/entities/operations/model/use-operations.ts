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

import { GetWalletsResponseDto, WalletService } from '@/entities/wallet';
import { ROUTER_MAP } from '@/shared';
import {
    FILTERED_OPERATIONS_QUERY_KEY,
    OPERATIONS_CREATE_QUERY_KEY,
    OPERATIONS_QUERY_KEY,
    OPERATIONS_WITH_FILTERS_KEY,
    OPERATION_DELETE_MUTATION_KEY,
} from '@/shared/utils/constants/operation-query-key';

import { OperationsService } from '../api/operations-service';
import {
    CreateOperationBackendDto,
    GetOperationsParams,
    GetOperationsParamsSchema,
    GetOperationsResponseDto,
    OperationResponseDto,
    UpdateOperationBackendDto,
} from './opeartions-schemas';

export const useCreateOperation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: OPERATIONS_CREATE_QUERY_KEY,
        mutationFn: (data: CreateOperationBackendDto) => OperationsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: OPERATIONS_QUERY_KEY });
            toast.success('Справочник успешно создан');
        },
    });
};

export const useWallets = () => {
    return useQuery<GetWalletsResponseDto>({
        queryKey: ['wallets', 'all'],
        queryFn: () => {
            console.log('🔍 Fetching wallets...');
            return WalletService.getWallets({
                page: 1,
                limit: 100,
            });
        },
    });
};

export const useOperations = () => {
    return useQuery({
        queryKey: OPERATIONS_QUERY_KEY,
        queryFn: () => OperationsService.getOperations(),
    });
};

export const useOperation = (id: string) => {
    return useQuery({
        queryKey: [...OPERATIONS_QUERY_KEY, id],
        queryFn: () => OperationsService.getById(id),
        enabled: !!id,
    });
};

type OperationFilterWithPagination = GetOperationsParams & {
    page?: number;
    limit?: number;
};

export const useInfiniteOperations = (filters?: GetOperationsParams, defaultLimit = 100, enabled = true) => {
    return useInfiniteQuery<
        GetOperationsResponseDto,
        Error,
        InfiniteData<GetOperationsResponseDto>,
        [string, GetOperationsParams | undefined]
    >({
        queryKey: OPERATIONS_WITH_FILTERS_KEY(filters),
        enabled,

        queryFn: async (context: QueryFunctionContext<[string, GetOperationsParams | undefined]>) => {
            const rawPageParam = context.pageParam;
            const page =
                typeof rawPageParam === 'number'
                    ? rawPageParam
                    : typeof rawPageParam === 'string' && rawPageParam !== ''
                      ? Number(rawPageParam)
                      : 1;

            const queryFilters = context.queryKey[1] ?? {};

            GetOperationsParamsSchema.partial().parse(queryFilters);

            const response = await OperationsService.filter({
                ...queryFilters,
                page,
                limit: defaultLimit,
            } as OperationFilterWithPagination);

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

export const useFilterOperations = (filter: GetOperationsParams) => {
    return useQuery({
        queryKey: FILTERED_OPERATIONS_QUERY_KEY,
        queryFn: () => OperationsService.filter(filter),
    });
};

export const useUpdateOperation = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & UpdateOperationBackendDto) => OperationsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: OPERATIONS_QUERY_KEY });
            router.push(ROUTER_MAP.OPERATIONS);
            toast.success('Операция обновлена');
        },
    });
};

export const useDeleteOperation = (filters?: GetOperationsParams) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: OPERATION_DELETE_MUTATION_KEY,
        mutationFn: (id: string) => OperationsService.delete(id),

        onSuccess: () => {
            toast.success('Справочник удалён');

            queryClient.invalidateQueries({
                queryKey: OPERATIONS_WITH_FILTERS_KEY(filters) as readonly unknown[],
            });
        },
    });
};

export function useCopyOperation() {
    const copyOperation = useCallback(async (operation: OperationResponseDto) => {
        const text = `
    Описание: ${operation.description || 'Не указано'}
`;

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

    return { copyOperation };
}
