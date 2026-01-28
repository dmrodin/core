import { GetOperationsParams } from '@/entities/operations';

export const OPERATIONS_CREATE_QUERY_KEY = ['operations', 'create'];

export const OPERATIONS_QUERY_KEY = ['operation'];

export const FILTERED_OPERATIONS_QUERY_KEY = ['operations', 'filtered'];

export const OPERATIONS_WITH_FILTERS_KEY = (
    filters?: GetOperationsParams,
): [string, GetOperationsParams | undefined] => ['operations', filters];

export const OPERATION_DELETE_MUTATION_KEY = ['operations', 'delete'];
