import { InfiniteData, type QueryFunctionContext, useInfiniteQuery } from '@tanstack/react-query';

import { UserService } from '@/entities/users/api/users-service';
import { GetUsersParams, GetUsersParamsSchema, UsersResponseType } from '@/entities/users/model/user-schemas';
import { USERS_WITH_FILTERS_KEY } from '@/shared/utils/constants/users-query-key';

export const useInfiniteUsers = (filters?: GetUsersParams, defaultLimit = 100) => {
    return useInfiniteQuery<
        UsersResponseType,
        Error,
        InfiniteData<UsersResponseType>,
        [string, GetUsersParams | undefined]
    >({
        queryKey: USERS_WITH_FILTERS_KEY(filters),

        queryFn: async (context: QueryFunctionContext<[string, GetUsersParams | undefined]>) => {
            const rawPageParam = context.pageParam;
            const page =
                typeof rawPageParam === 'number'
                    ? rawPageParam
                    : typeof rawPageParam === 'string' && rawPageParam !== ''
                      ? Number(rawPageParam)
                      : 1;

            const queryFilters = (context.queryKey[1] ?? {}) as Partial<GetUsersParams>;

            const safeFilters: Partial<GetUsersParams> = {
                page,
                limit: queryFilters.limit ?? defaultLimit,
            };
            if (queryFilters.search) safeFilters.search = queryFilters.search;
            if (queryFilters.blocked !== undefined) safeFilters.blocked = queryFilters.blocked;
            if (queryFilters.telegramNotifications !== undefined)
                safeFilters.telegramNotifications = queryFilters.telegramNotifications;
            if (queryFilters.deleted !== undefined) safeFilters.deleted = queryFilters.deleted;
            if (queryFilters.sortField) safeFilters.sortField = queryFilters.sortField;
            if (queryFilters.sortOrder) safeFilters.sortOrder = queryFilters.sortOrder;
            if (queryFilters.roleCode) safeFilters.roleCode = queryFilters.roleCode;
            if (queryFilters.telegramId) safeFilters.telegramId = queryFilters.telegramId;
            console.log('[infinite-users] queryFn page:', page, 'limit:', safeFilters.limit, 'filters:', safeFilters);
            const parsedFilters = GetUsersParamsSchema.parse(safeFilters);
            const result = await UserService.getUsers(parsedFilters);
            console.log('[infinite-users] API result pagination:', result.pagination);
            return result;
        },

        initialPageParam: 1,

        getNextPageParam: (lastPage: UsersResponseType, allPages: UsersResponseType[]) => {
            const total = lastPage?.pagination?.total ?? 0;
            const limit = filters?.limit ?? defaultLimit;
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const nextPage = allPages.length < totalPages ? allPages.length + 1 : undefined;
            console.log(
                '[infinite-users] getNextPageParam: total=',
                total,
                'limit=',
                limit,
                'totalPages=',
                totalPages,
                'allPages.length=',
                allPages.length,
                'nextPage=',
                nextPage,
            );
            return nextPage;
        },
    });
};
