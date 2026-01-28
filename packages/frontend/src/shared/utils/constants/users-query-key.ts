import { GetUsersParams } from '@/entities/users/model/user-schemas';

export const USERS_QUERY_KEY = ['users'];
export const USERS_WITH_FILTERS_KEY = (filters?: GetUsersParams): [string, GetUsersParams | undefined] => [
    'users',
    filters,
];
export const USERS_CREATE_KEY = ['users', 'create'];
export const COURIERS_QUERY_KEY = ['couriers'];
