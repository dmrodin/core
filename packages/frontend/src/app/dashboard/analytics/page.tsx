import { Metadata } from 'next';

import { AnalyticsCharts } from '@/features/analytics/ui/analytics-chart/analytics-chart';
import { AnalyticsFilters } from '@/features/analytics/ui/analytics-filters/analytics-filters';
import { AnalyticsSummary } from '@/features/analytics/ui/analytics-summary/analytics-summary';
import { AnalyticsTable } from '@/features/analytics/ui/analytics-table/analytics-table';
import { Card, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

export const metadata: Metadata = {
    title: 'Аналитика',
};

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-2xl">Аналитика</CardTitle>
                    <AnalyticsFilters />
                </CardHeader>
            </Card>
            <AnalyticsSummary />
            <AnalyticsCharts />
            <AnalyticsTable />
        </div>
    );
}
