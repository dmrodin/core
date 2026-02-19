'use client';

import { Fragment } from 'react';

import { UserRole } from '@/entities/users/model/user-schemas';
import { usePinnedWallets } from '@/entities/wallet/model/use-wallets';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { CardDashboard } from '@/features/dashboard/ui/dashboard-card/dashboard-card';
import { DashboardCurrency } from '@/features/dashboard/ui/dashboard-currency/dashboard-currency';

export function DashboardPinnedWallets() {
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.roles?.some((role) => role.code === UserRole.ADMIN);
    const { data, isLoading, isError } = usePinnedWallets(isAdmin);

    if (!isAdmin) {
        return null;
    }

    const currencyGroups = data?.currencyGroups ?? [];

    return (
        <Fragment>
            <DashboardCurrency isLoading={isLoading} hasError={isError} currencyGroups={currencyGroups} />
            <CardDashboard isLoading={isLoading} hasError={isError} currencyGroups={currencyGroups} />
        </Fragment>
    );
}
