'use client';

import { Fragment, useState } from 'react';

import Link from 'next/link';

import { Plus } from 'lucide-react';

import { GetGuidesParamsRequest } from '@/entities/guides';
import { GuidesFilters } from '@/features/guides/ui/guide-filters/guide-filters';
import { Button, ROUTER_MAP } from '@/shared';
import { Card, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

import { GuidesList } from '../guides-list/guides-list';

export const GuidesPageContent = () => {
    const [filters, setFilters] = useState<GetGuidesParamsRequest>({
        sortField: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 10,
    });

    const handleFiltersChange = (newFilters: GetGuidesParamsRequest) => {
        setFilters(newFilters);
    };
    return (
        <Fragment>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-2xl">Список справочников</CardTitle>
                    <div className="flex gap-2 items-center">
                        <GuidesFilters onFiltersChange={handleFiltersChange} />
                        <Button asChild>
                            <Link href={ROUTER_MAP.GUIDES_CREATE}>
                                <Plus className="w-4 h-4 mr-2" />
                                Создать справочник
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>
            <GuidesList filters={filters} />
        </Fragment>
    );
};
