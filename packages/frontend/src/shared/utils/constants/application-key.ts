import { GetApplicationsFilters } from '@/entities/application';

export const APPLICATION_QUERY_KEY = ['applications'];
export const APPLICATIONS_WITH_FILTERS_KEY = (
    filters?: GetApplicationsFilters,
): [string, GetApplicationsFilters | undefined] => ['applications', filters];
export const APPLICATION_DELETE_MUTATION_KEY = ['applications', 'delete'];
