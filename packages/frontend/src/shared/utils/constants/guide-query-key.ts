import { GetGuidesParamsRequest } from '@/entities/guides';

export const GUIDE_CREATE_QUERY_KEY = ['guides', 'create'];
export const GUIDE_QUERY_KEY = (id: string) => ['guide', id];
export const GUIDES_QUERY_KEY = ['guide'];
export const FILTERED_GUIDES_QUERY_KEY = ['guides', 'filtered'];
export const GUIDES_WITH_FILTERS_KEY = (
    filters?: GetGuidesParamsRequest,
): [string, GetGuidesParamsRequest | undefined] => ['guides', filters];
export const GUIDE_DELETE_MUTATION_KEY = ['guides', 'delete'];
