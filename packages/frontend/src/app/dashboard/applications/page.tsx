'use client';

import Link from 'next/link';

import { Plus } from 'lucide-react';

import { useSetApplicationQueryParam } from '@/entities/application';
import { ApplicationsFilters } from '@/features/application/ui/application-filters/filters-applications';
import { InfiniteApplicationsList } from '@/features/application/ui/infinite-applications/infinite-applications';
import { Button } from '@/shared/ui/shadcn/button';
import { Card, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { Input } from '@/shared/ui/shadcn/input';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';

export default function ApplicationsPage() {
    const { searchParams, setQueryParam } = useSetApplicationQueryParam();
    const search = searchParams.get('search') ?? '';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-2xl">Заявки</CardTitle>
                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="Поиск..."
                            value={search}
                            onChange={(e) => setQueryParam('search', e.target.value || undefined)}
                            className="w-64"
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
            <InfiniteApplicationsList />
        </div>
    );
}
