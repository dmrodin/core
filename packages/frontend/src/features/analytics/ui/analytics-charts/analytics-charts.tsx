'use client';

import React from 'react';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { useWalletAnalytics } from '@/entities/analytics';
import { useAnalyticsFilters } from '@/features/analytics/hook/use-analytics-filters';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export const AnalyticsCharts = () => {
    const { filters } = useAnalyticsFilters();
    const { data: analyticsData, isLoading } = useWalletAnalytics(filters);

    if (isLoading || !analyticsData?.analytics) {
        return null;
    }

    const { analytics } = analyticsData;

    // Подготовка данных для графика по кошелькам
    const walletChartData = analytics.slice(0, 10).map((item) => ({
        name: item.walletName.length > 15 ? item.walletName.slice(0, 15) + '...' : item.walletName,
        поступления: item.coming,
        расходы: item.expenditure,
        баланс: item.currentBalance,
    }));

    // Подготовка данных для графика потоков
    const flowChartData = analytics.slice(0, 10).map((item) => ({
        name: item.walletName.length > 15 ? item.walletName.slice(0, 15) + '...' : item.walletName,
        'Чистый поток': item.netFlow,
    }));

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Поступления и расходы по кошелькам</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={walletChartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '6px',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="поступления" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="расходы" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Чистый поток по кошелькам</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={flowChartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '6px',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="Чистый поток"
                                stroke="hsl(221.2 83.2% 53.3%)"
                                strokeWidth={2}
                                dot={{ fill: 'hsl(221.2 83.2% 53.3%)', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};
