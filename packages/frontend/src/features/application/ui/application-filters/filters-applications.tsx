'use client';

import { useEffect, useMemo, useState } from 'react';

import { FilterIcon } from 'lucide-react';
import { z } from 'zod';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { getApplicationsFiltersSchema, useSetApplicationQueryParam } from '@/entities/application';
import {
    cn,
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
    Calendar,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared';

import { CalendarIcon } from 'lucide-react';

type ApplicationsFiltersState = z.infer<typeof getApplicationsFiltersSchema>;

const SORT_ORDERS: {
    value: ApplicationsFiltersState['sortOrder'];
    label: string;
}[] = [
    { value: 'desc', label: 'Сначала новые' },
    { value: 'asc', label: 'Сначала старые' },
];

const STATUS_OPTIONS: {
    value: NonNullable<ApplicationsFiltersState['status']>;
    label: string;
}[] = [
    { value: 'open', label: 'В работе' },
    { value: 'done', label: 'Завершена' },
];

export function ApplicationsFilters() {
    const { setAllQueryParams } = useSetApplicationQueryParam();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);

    const defaults = useMemo<ApplicationsFiltersState>(
        () => ({
            page: 1,
            limit: 10,
        }),
        [],
    );
    const [localFilters, setLocalFilters] = useState<ApplicationsFiltersState>(defaults);

    const handleApplyFilters = () => {
        setAllQueryParams(localFilters);
        setSheetOpen(false);
    };

    const resetFilters = () => {
        const resetState = { page: 1, limit: 10 };
        setLocalFilters(resetState);
        setAllQueryParams(resetState);
        setSheetOpen(false);
    };

    useEffect(() => {
        setLocalFilters(defaults);
    }, [defaults]);

    const activeFiltersCount = [
        localFilters.status,
        localFilters.sortField,
        localFilters.sortOrder,
        localFilters.createdFrom,
        localFilters.createdTo,
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
                    <SheetTitle>Фильтры заявок</SheetTitle>
                    <SheetDescription>Настройте параметры для фильтрации списка заявок</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 px-4">
                    <div className="space-y-2">
                        <Label>Статус</Label>
                        <Select
                            value={localFilters.status ?? ''}
                            onValueChange={(val) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    status: val ? (val as ApplicationsFiltersState['status']) : undefined,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Период</Label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !localFilters.createdFrom && 'text-muted-foreground',
                                    )}
                                >
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    {localFilters.createdFrom ? (
                                        localFilters.createdTo ? (
                                            <>
                                                {format(new Date(localFilters.createdFrom), 'dd.MM.yyyy', {
                                                    locale: ru,
                                                })}{' '}
                                                –{' '}
                                                {format(new Date(localFilters.createdTo), 'dd.MM.yyyy', {
                                                    locale: ru,
                                                })}
                                            </>
                                        ) : (
                                            format(new Date(localFilters.createdFrom), 'dd.MM.yyyy', {
                                                locale: ru,
                                            })
                                        )
                                    ) : (
                                        <span>Выбрать даты</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="start"
                                sideOffset={4}
                                className="p-0 w-auto rounded-xl shadow-lg z-50 overflow-hidden"
                            >
                                <div className="bg-popover">
                                    <Calendar
                                        mode="range"
                                        numberOfMonths={2}
                                        selected={{
                                            from: localFilters.createdFrom
                                                ? new Date(localFilters.createdFrom)
                                                : undefined,
                                            to: localFilters.createdTo ? new Date(localFilters.createdTo) : undefined,
                                        }}
                                        onSelect={(range) => {
                                            console.log(localFilters);
                                            console.log('asdasdad');
                                            if (!range) return;

                                            if (range.from && !range.to) {
                                                /* const fromDate = new Date(range.from);
                        fromDate.setUTCHours(0, 0, 0, 0); */

                                                // Создаем дату в UTC
                                                const utcFrom = new Date(
                                                    Date.UTC(
                                                        range.from.getFullYear(),
                                                        range.from.getMonth(),
                                                        range.from.getDate(),
                                                    ),
                                                );
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    createdFrom: utcFrom.toISOString(),
                                                    createdTo: undefined,
                                                }));
                                                return;
                                            }

                                            if (range.from && range.to) {
                                                /* const fromDate = new Date(range.from);
                        fromDate.setUTCHours(0, 0, 0, 0);
                        const toDate = new Date(range.to);
                        toDate.setUTCHours(23, 59, 59, 999); */
                                                // Создаем даты в UTC
                                                const utcFrom = new Date(
                                                    Date.UTC(
                                                        range.from.getFullYear(),
                                                        range.from.getMonth(),
                                                        range.from.getDate(),
                                                    ),
                                                );
                                                const utcTo = new Date(
                                                    Date.UTC(
                                                        range.to.getFullYear(),
                                                        range.to.getMonth(),
                                                        range.to.getDate(),
                                                    ),
                                                );
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    createdFrom: utcFrom.toISOString(),
                                                    createdTo: utcTo.toISOString(),
                                                }));
                                                setCalendarOpen(false);
                                                console.log(localFilters);
                                            }
                                        }}
                                        locale={ru}
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Порядок сортировки</Label>
                        <Select
                            value={localFilters.sortOrder ?? ''}
                            onValueChange={(val) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    sortOrder: val ? (val as ApplicationsFiltersState['sortOrder']) : undefined,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Сначала новые" />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_ORDERS.map((order) => (
                                    <SelectItem key={order.value!} value={order.value!}>
                                        {order.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
}
