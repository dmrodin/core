'use client';

import { useEffect, useMemo, useState } from 'react';

import { FilterIcon } from 'lucide-react';
import { z } from 'zod';

import { GetUsersParamsSchema } from '@/entities/users';
import {
    Badge,
    Button,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    Switch,
} from '@/shared';

import { useSetQueryParam } from '../../hooks/use-set-query-param';

type UsersFiltersState = z.infer<typeof GetUsersParamsSchema>;

const USER_ROLES: {
    value: NonNullable<UsersFiltersState['roleCode']>;
    label: string;
}[] = [
    { value: 'admin', label: 'Админ' },
    { value: 'moderator', label: 'Модератор' },
    { value: 'user', label: 'Пользователь' },
];

export const UsersFilters = () => {
    const { setAllQueryParams } = useSetQueryParam();
    const [sheetOpen, setSheetOpen] = useState(false);

    const defaults = useMemo<UsersFiltersState>(
        () => ({
            page: 1,
            limit: 100,
        }),
        [],
    );
    const [localFilters, setLocalFilters] = useState<UsersFiltersState>(defaults);

    const handleApplyFilters = () => {
        setAllQueryParams(localFilters);
        setSheetOpen(false);
    };

    const resetFilters = () => {
        const resetState = { page: 1, limit: 100 };
        setLocalFilters(resetState);
        setAllQueryParams(resetState);
        setSheetOpen(false);
    };

    useEffect(() => {
        setLocalFilters(defaults);
    }, [defaults]);

    const activeFiltersCount = [
        localFilters.roleCode,
        localFilters.isHolder,
        localFilters.isCourier,
        localFilters.blocked,
        localFilters.telegramNotifications,
    ].filter(Boolean).length;

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Фильтры
                    {activeFiltersCount > 0 && (
                        <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1 flex items-center justify-center">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Фильтры пользователей</SheetTitle>
                    <SheetDescription>Настройте параметры для фильтрации списка пользователей</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 px-4">
                    <div className="space-y-2">
                        <Label>Роли</Label>
                        <Select
                            value={localFilters.roleCode ?? ''}
                            onValueChange={(val) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    roleCode: val ? (val as UsersFiltersState['roleCode']) : undefined,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                {USER_ROLES.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label>Дополнительные фильтры</Label>

                        <div className="flex items-center gap-2 border rounded-md p-3">
                            <Switch
                                checked={!!localFilters.isHolder}
                                onCheckedChange={(checked: boolean) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        isHolder: checked ? true : undefined,
                                    }))
                                }
                            />
                            <Label className="text-sm font-medium">Держатели</Label>
                        </div>

                        <div className="flex items-center gap-2 border rounded-md p-3">
                            <Switch
                                checked={!!localFilters.isCourier}
                                onCheckedChange={(checked: boolean) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        isCourier: checked ? true : undefined,
                                    }))
                                }
                            />
                            <Label className="text-sm font-medium">Курьеры</Label>
                        </div>

                        <div className="flex items-center gap-2 border rounded-md p-3">
                            <Switch
                                checked={!!localFilters.blocked}
                                onCheckedChange={(checked: boolean) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        blocked: checked ? true : undefined,
                                    }))
                                }
                            />
                            <Label className="text-sm font-medium">Заблокированные</Label>
                        </div>

                        <div className="flex items-center gap-2 border rounded-md p-3">
                            <Switch
                                checked={!!localFilters.telegramNotifications}
                                onCheckedChange={(checked: boolean) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        telegramNotifications: checked ? true : undefined,
                                    }))
                                }
                            />
                            <Label className="text-sm font-medium">Telegram уведомления</Label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <Button variant="outline" onClick={resetFilters} className="flex-1">
                            Сбросить
                        </Button>
                        <Button onClick={handleApplyFilters} className="flex-1">
                            Применить
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
