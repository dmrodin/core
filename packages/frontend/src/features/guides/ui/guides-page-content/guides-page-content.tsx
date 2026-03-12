'use client';

import { Fragment, useState } from 'react';

import Link from 'next/link';

import { Plus } from 'lucide-react';

import { GetGuidesParamsRequest } from '@/entities/guides';
import { UserRole } from '@/entities/users/model/user-schemas';
import { GuidesFilters } from '@/features/guides/ui/guide-filters/guide-filters';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { Button, ROUTER_MAP } from '@/shared';
import { Card, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

import { GuidesList } from '../guides-list/guides-list';

export const GuidesPageContent = () => {
    const user = useAuthStore((state) => state.user);
    const isUserRole = user?.roles?.some((role) => role.code === UserRole.USER) ?? false;

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
                <CardHeader className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <CardTitle className="text-2xl">Список гайдов</CardTitle>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <GuidesFilters className="w-full sm:w-64" onFiltersChange={handleFiltersChange} />
                        {!isUserRole && (
                            <Button asChild>
                                <Link href={ROUTER_MAP.GUIDES_CREATE}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Создать гайд
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardHeader>
            </Card>
            <GuidesList filters={filters} />
        </Fragment>
    );
};
