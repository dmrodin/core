'use client';

import { useMemo } from 'react';

import { GetWalletsFilter } from '@/entities/wallet';
import { useWalletsAggregation } from '@/entities/wallet/model/use-wallets-aggregation';
import { Card, CardContent, Loading } from '@/shared';
import { formatNumber } from '@/shared/lib/utils/format-number';

interface WalletsAggregationSwiperProps {
    filters: GetWalletsFilter;
}

export function WalletsAggregationSwiper({ filters }: WalletsAggregationSwiperProps) {
    const { data, isLoading, isFetching, isError } = useWalletsAggregation(filters);

    const summaries = useMemo(
        () =>
            (data?.currencyGroups ?? [])
                .filter((group) => group.totalAmount !== 0)
                .map((group) => ({
                    key: group.currency.id,
                    totalAmount: group.totalAmount,
                    walletsCount: group.walletsCount,
                    currencyCode: group.currency.code,
                    currencyName: group.currency.name,
                })),
        [data],
    );

    if (isError) {
        return (
            <div className="w-full">
                <Card className="w-full min-h-[124px] flex items-center">
                    <CardContent className="p-4 text-sm text-destructive">
                        Не удалось загрузить агрегацию кошельков
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading || isFetching) {
        return (
            <div className="min-h-[124px]">
                <Loading />
            </div>
        );
    }

    if (summaries.length === 0) {
        return (
            <div className="w-full">
                <Card className="w-full min-h-[124px] flex items-center">
                    <CardContent className="p-4 text-sm text-muted-foreground">
                        Нет кошельков по выбранным фильтрам
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="w-full max-w-7xl mx-auto overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                <div className="flex gap-4 pb-2">
                    {summaries.map((summary) => (
                        <Card key={summary.key} className="min-w-[280px] flex-shrink-0 p-0">
                            <CardContent className="flex flex-col p-4 gap-1">
                                <p className="text-2xl font-semibold">{formatNumber(summary.totalAmount)}</p>
                                <p className="text-sm font-medium text-muted-foreground uppercase">
                                    {summary.currencyCode}
                                </p>
                                <p className="text-xs text-muted-foreground">Кошельков: {summary.walletsCount}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
