'use client';

import { useMemo } from 'react';

import { Wallet } from 'lucide-react';

import type { WalletCurrencyGroup } from '@/entities/wallet';
import {
    Card,
    CardContent,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    Loading,
} from '@/shared';
import { formatNumber } from '@/shared/lib/utils/format-number';

interface DashboardCurrencyProps {
    isLoading: boolean;
    hasError: boolean;
    currencyGroups: WalletCurrencyGroup[];
}

export function DashboardCurrency({ isLoading, hasError, currencyGroups }: DashboardCurrencyProps) {
    const summaries = useMemo(
        () =>
            currencyGroups.map((group) => {
                const totalAmount = group.wallets.reduce((acc, wallet) => acc + wallet.amount, 0);
                const walletsCount = group.wallets.length;
                const firstWallet = group.wallets[0];
                const currencyCode = firstWallet?.currency.code ?? group.currency.toUpperCase();
                const currencyName = firstWallet?.currency.name ?? currencyCode;

                return {
                    key: group.currency,
                    totalAmount,
                    walletsCount,
                    currencyCode,
                    currencyName,
                };
            }),
        [currencyGroups],
    );

    if (hasError) {
        return (
            <div className="w-full">
                <Card className="w-full min-h-[124px] flex items-center mb-2">
                    <CardContent className="p-4 text-sm text-destructive">
                        Не удалось загрузить данные о кошельках
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return <Loading />;
    }

    if (currencyGroups.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Wallet />
                    </EmptyMedia>
                    <EmptyContent>
                        <EmptyTitle>Нет закрепленных кошельков</EmptyTitle>
                        <EmptyDescription>Закрепите кошельки на главной странице для быстрого доступа</EmptyDescription>
                    </EmptyContent>
                </EmptyHeader>
            </Empty>
        );
    }
    return (
        <div className="w-full">
            <div className="w-full max-w-7xl mx-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                <div className="flex gap-3 pb-2 sm:gap-4">
                    {summaries.map((summary) => (
                        <Card key={summary.key} className="w-fit flex-shrink-0 !gap-0 !p-0 sm:min-w-[280px]">
                            <CardContent className="flex flex-col gap-0.5 !p-2.5 sm:!p-4">
                                <p className="text-xl leading-tight font-semibold sm:text-2xl">
                                    {formatNumber(summary.totalAmount)}
                                </p>
                                <p className="text-xs leading-tight font-medium text-muted-foreground uppercase sm:text-sm">
                                    {summary.currencyCode}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
