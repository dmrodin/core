'use client';

import React, { useCallback } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Plus } from 'lucide-react';

import { UsersFilters, UsersTable, useInfiniteUsers, useUsersQueryParams } from '@/features/users';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    ROUTER_MAP,
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/shared';
import { useSetQueryParam } from '@/features/users/hooks/use-set-query-param';

export default function UsersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawParams = useUsersQueryParams();
    const { setQueryParam } = useSetQueryParam();

    const tab = searchParams.get('tab') || 'all';
    const showDeleted = tab === 'deleted';

    const params = {
        page: rawParams.page ?? 1,
        limit: rawParams.limit ?? 10,
        ...rawParams,
    };
    const { isError } = useInfiniteUsers(params);

    const handleTabChange = useCallback(
        (value: string) => {
            router.push(`${ROUTER_MAP.USERS}?tab=${value}`);
        },
        [router],
    );

    if (isError) return router.push(ROUTER_MAP.ERROR);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="hidden text-2xl md:block">Пользователи</CardTitle>
                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="Поиск по имени..."
                            value={rawParams.search ?? ''}
                            onChange={(e) => setQueryParam('search', e.target.value || undefined)}
                            className="w-64"
                        />
                        <UsersFilters />
                        <Button asChild>
                            <Link href={ROUTER_MAP.USERS_CREATE}>
                                <Plus className="w-4 h-4 mr-2" />
                                Создать пользователя
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs value={tab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all">Все</TabsTrigger>
                            <TabsTrigger value="deleted">Удалённые</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <UsersTable showDeleted={showDeleted} />
                </CardContent>
            </Card>
        </div>
    );
}
