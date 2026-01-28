import { GetWalletsFilter } from '@/entities/wallet/model/wallet-schemas';

export const PINNED_WALLETS_QUERY_KEY = ['pinned-wallets'];
export const WALLETS_QUERY_KEY = ['wallets'];

export const WALLETS_WITH_FILTERS_KEY = (
    filters?: Partial<GetWalletsFilter>,
): [string, Partial<GetWalletsFilter> | undefined] => ['wallets', filters];
