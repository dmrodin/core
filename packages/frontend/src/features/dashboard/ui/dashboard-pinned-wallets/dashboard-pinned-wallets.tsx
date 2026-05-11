'use client';

import { Fragment } from 'react';

import { usePinnedWallets } from '@/entities/wallet/model/use-wallets';
import { CardDashboard } from '@/features/dashboard/ui/dashboard-card/dashboard-card';
import { DashboardCurrency } from '@/features/dashboard/ui/dashboard-currency/dashboard-currency';
import { DashboardP2PDc } from '@/features/dashboard/ui/dashboard-p2p-dc/dashboard-p2p-dc';

export function DashboardPinnedWallets() {
    const { data, isLoading, isError } = usePinnedWallets();

    const currencyGroups = data?.currencyGroups ?? [];

    return (
        <Fragment>
            <DashboardP2PDc />
            <DashboardCurrency isLoading={isLoading} hasError={isError} currencyGroups={currencyGroups} />
            <CardDashboard isLoading={isLoading} hasError={isError} currencyGroups={currencyGroups} />
        </Fragment>
    );
}
