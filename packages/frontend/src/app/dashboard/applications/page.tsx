'use client';

import Link from 'next/link';

import { Plus } from 'lucide-react';

import { useSetApplicationQueryParam } from '@/entities/application';
import { ApplicationsFilters } from '@/features/application/ui/application-filters/filters-applications';
import { InfiniteApplicationsList } from '@/features/application/ui/infinite-applications/infinite-applications';
import { Button } from '@/shared/ui/shadcn/button';
import { Input } from '@/shared/ui/shadcn/input';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/shadcn/tabs';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export default function ApplicationsPage() {
    const { searchParams, setQueryParam } = useSetApplicationQueryParam();
    const search = searchParams.get('search') ?? '';
    const activeTab = searchParams.get('status') ?? 'open';

    return (
        <div className="space-y-3 sm:space-y-6">
            <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 md:flex md:flex-wrap">
                <Input
                    placeholder="Поиск..."
                    value={search}
                    onChange={(e) => setQueryParam('search', e.target.value || undefined)}
                    className="min-w-0 md:w-64"
                />
                <ApplicationsFilters />
                <Button asChild className="h-9 px-3 sm:h-10 sm:px-4">
                    <Link href={ROUTER_MAP.APPLICATIONS_CREATE}>
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Создать заявку</span>
                        <span className="sr-only sm:hidden">Создать заявку</span>
                    </Link>
                </Button>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(val) => setQueryParam('status', val)}
                className="sticky top-0 z-20 -mx-1 bg-background/95 px-1 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
            >
                <TabsList className="grid h-10 w-full grid-cols-3">
                    <TabsTrigger value="all" className="min-h-9">
                        Все
                    </TabsTrigger>
                    <TabsTrigger value="open" className="min-h-9">
                        В работе
                    </TabsTrigger>
                    <TabsTrigger value="done" className="min-h-9">
                        Завершенные
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <InfiniteApplicationsList />
        </div>
    );
}
