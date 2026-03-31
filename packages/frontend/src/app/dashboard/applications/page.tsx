'use client';

import Link from 'next/link';

import { Plus } from 'lucide-react';

import { useSetApplicationQueryParam } from '@/entities/application';
import { ApplicationsFilters } from '@/features/application/ui/application-filters/filters-applications';
import { InfiniteApplicationsList } from '@/features/application/ui/infinite-applications/infinite-applications';
import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { Input } from '@/shared/ui/shadcn/input';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/shadcn/tabs';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export default function ApplicationsPage() {
    const { searchParams, setQueryParam } = useSetApplicationQueryParam();
    const search = searchParams.get('search') ?? '';
    const activeTab = searchParams.get('status') ?? 'open';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between space-y-0">
                    <CardTitle className="text-2xl">Заявки</CardTitle>
                    <div className="flex w-full flex-wrap gap-2 items-center md:w-auto">
                        <Input
                            placeholder="Поиск..."
                            value={search}
                            onChange={(e) => setQueryParam('search', e.target.value || undefined)}
                            className="w-full md:w-64"
                        />
                        <ApplicationsFilters />
                        <Button asChild>
                            <Link href={ROUTER_MAP.APPLICATIONS_CREATE}>
                                <Plus className="w-4 h-4 mr-2" />
                                Создать заявку
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Tabs
                value={activeTab}
                onValueChange={(val) => setQueryParam('status', val)}
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">Все</TabsTrigger>
                    <TabsTrigger value="open">В работе</TabsTrigger>
                    <TabsTrigger value="done">Завершенные</TabsTrigger>
                </TabsList>
            </Tabs>

            <InfiniteApplicationsList />
        </div>
    );
}
