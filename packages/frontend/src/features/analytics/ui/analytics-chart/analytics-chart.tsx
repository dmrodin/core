'use client';

import React from 'react';

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

import { useWalletAnalytics } from '@/entities/analytics';
import { useMonthlyAnalytics } from '@/entities/analytics/model/use-monthly-analytics';
import { useAnalyticsFilters } from '@/features/analytics/hook/use-analytics-filters';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    Loading,
} from '@/shared';

export const AnalyticsCharts = () => {
    const { filters } = useAnalyticsFilters();
    const { data: analyticsData, isLoading } = useWalletAnalytics(filters);
    const { data: monthlyData, isLoading: isMonthlyLoading } = useMonthlyAnalytics();

    if (isLoading || isMonthlyLoading) {
        return <Loading />;
    }

    if (!analyticsData?.summary) {
        return null;
    }

    const { summary } = analyticsData;

    const chartConfig: ChartConfig = {
        coming: {
            label: 'Поступления',
            color: 'var(--chart-1)',
        },
        expenditure: {
            label: 'Расходы',
            color: 'var(--chart-2)',
        },
        balance: {
            label: 'Баланс',
            color: 'var(--chart-3)',
        },
        operations: {
            label: 'Операций',
            color: 'var(--chart-4)',
        },
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Динамика за 6 месяцев</CardTitle>
                    <CardDescription>Поступления и расходы по месяцам</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart accessibilityLayer data={monthlyData?.analytics || []}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.split(' ')[0]}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="coming" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenditure" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Финансовые потоки</CardTitle>
                    <CardDescription>Поступления vs Расходы</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Pie
                                data={[
                                    { name: 'Поступления', value: summary.totalComing },
                                    { name: 'Расходы', value: summary.totalExpenditure },
                                ]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                label
                            >
                                <Cell fill="var(--chart-1)" />
                                <Cell fill="var(--chart-2)" />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
};
