'use client';

import React, { useMemo, useState } from 'react';

import { ArrowDown, ArrowUp, ArrowUpDown, BarChart3 } from 'lucide-react';

import { useWalletAnalytics } from '@/entities/analytics';
import { useAnalyticsFilters } from '@/features/analytics/hook/use-analytics-filters';
import { formatNumber } from '@/shared/lib/utils/format-number';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    Loading,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared';

type SortField =
    | 'walletName'
    | 'walletCurrency'
    | 'holder'
    | 'currentBalance'
    | 'coming'
    | 'expenditure'
    | 'netFlow'
    | 'operationsCount';
type SortDirection = 'asc' | 'desc' | null;

export const AnalyticsTable = () => {
    const { filters } = useAnalyticsFilters();
    const { data: analyticsData, isLoading } = useWalletAnalytics(filters);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortField(null);
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!analyticsData?.analytics || !sortField || !sortDirection) {
            return analyticsData?.analytics || [];
        }

        return [...analyticsData.analytics].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return sortDirection === 'asc'
                ? (aValue as number) - (bValue as number)
                : (bValue as number) - (aValue as number);
        });
    }, [analyticsData?.analytics, sortField, sortDirection]);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="ml-2 h-4 w-4 inline" />;
        }
        if (sortDirection === 'asc') {
            return <ArrowUp className="ml-2 h-4 w-4 inline" />;
        }
        return <ArrowDown className="ml-2 h-4 w-4 inline" />;
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead
                            className="text-center cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('walletName')}
                        >
                            Кошелек <SortIcon field="walletName" />
                        </TableHead>
                        <TableHead
                            className="text-center cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('walletCurrency')}
                        >
                            Валюта <SortIcon field="walletCurrency" />
                        </TableHead>
                        <TableHead
                            className="text-center cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('holder')}
                        >
                            Держатель <SortIcon field="holder" />
                        </TableHead>
                        <TableHead
                            className="text-center cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('currentBalance')}
                        >
                            Текущий баланс <SortIcon field="currentBalance" />
                        </TableHead>
                        <TableHead
                            className="text-center cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('coming')}
                        >
                            Поступления <SortIcon field="coming" />
                        </TableHead>
                        <TableHead
                            className="text-center cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('expenditure')}
                        >
                            Расходы <SortIcon field="expenditure" />
                        </TableHead>
                        <TableHead
                            className="text-center cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('netFlow')}
                        >
                            Чистый поток <SortIcon field="netFlow" />
                        </TableHead>
                        <TableHead
                            className="text-center cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('operationsCount')}
                        >
                            Операций <SortIcon field="operationsCount" />
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {sortedData && sortedData.length > 0 ? (
                        sortedData.map((item) => (
                            <TableRow key={item.walletId}>
                                <TableCell className="text-center text-sm">{item.walletName}</TableCell>
                                <TableCell className="text-center text-sm font-medium">{item.walletCurrency}</TableCell>
                                <TableCell className="text-center text-sm">{item.holder || '—'}</TableCell>
                                <TableCell className="text-center text-sm font-medium">
                                    {formatNumber(item.currentBalance)}
                                </TableCell>
                                <TableCell className="text-center text-sm text-success/80">
                                    +{formatNumber(item.coming)}
                                </TableCell>
                                <TableCell className="text-center text-sm text-destructive/80">
                                    -{formatNumber(item.expenditure)}
                                </TableCell>
                                <TableCell
                                    className={`text-center text-sm font-medium ${item.netFlow >= 0 ? 'text-success/80' : 'text-destructive/80'}`}
                                >
                                    {item.netFlow >= 0 ? '+' : ''}
                                    {formatNumber(item.netFlow)}
                                </TableCell>
                                <TableCell className="text-center text-sm">
                                    {formatNumber(item.operationsCount)}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} className="p-0">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <BarChart3 />
                                        </EmptyMedia>
                                        <EmptyContent>
                                            <EmptyTitle>Нет данных аналитики</EmptyTitle>
                                            <EmptyDescription>
                                                Данные аналитики отсутствуют. Попробуйте изменить фильтры или создайте
                                                кошельки и операции.
                                            </EmptyDescription>
                                        </EmptyContent>
                                    </EmptyHeader>
                                </Empty>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
