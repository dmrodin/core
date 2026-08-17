'use client';

import { useEffect, useMemo, useState } from 'react';

import { FilterIcon } from 'lucide-react';
import { z } from 'zod';
import { format, isSameDay } from 'date-fns';
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
    useIsMobile,
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

export function ApplicationsFilters() {
    const { searchParams, setAllQueryParams } = useSetApplicationQueryParam();
    const { isMobile } = useIsMobile();
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
    const currentStatus = (searchParams.get('status') ?? 'open') as ApplicationsFiltersState['status'];

    const handleApplyFilters = () => {
        setAllQueryParams({ ...localFilters, status: currentStatus });
        setSheetOpen(false);
    };

    const resetFilters = () => {
        const resetState = { page: 1, limit: 10 };
        setLocalFilters(resetState);
        setAllQueryParams({ ...resetState, status: currentStatus });
    };

    useEffect(() => {
        setLocalFilters(defaults);
    }, [defaults]);

    const activeFiltersCount = [
        localFilters.sortField,
        localFilters.sortOrder,
        localFilters.createdFrom,
        localFilters.createdTo,
    ].filter(Boolean).length;

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative h-9 px-3 sm:h-10">
                    <FilterIcon className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Фильтры</span>
                    <span className="sr-only sm:hidden">Фильтры</span>
                    {activeFiltersCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center px-1 sm:static sm:ml-2"
                        >
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
                                        numberOfMonths={isMobile ? 1 : 2}
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
                                                if (isSameDay(range.from, range.to)) {
                                                    const utcFrom = new Date(
                                                        Date.UTC(
                                                            range.from.getFullYear(),
                                                            range.from.getMonth(),
                                                            range.from.getDate(),
                                                        ),
                                                    );
                                                    const utcFromIso = utcFrom.toISOString();

                                                    if (
                                                        localFilters.createdFrom === utcFromIso &&
                                                        !localFilters.createdTo
                                                    ) {
                                                        setLocalFilters((prev) => ({
                                                            ...prev,
                                                            createdFrom: utcFromIso,
                                                            createdTo: utcFromIso,
                                                        }));
                                                        setCalendarOpen(false);
                                                        return;
                                                    }

                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        createdFrom: utcFromIso,
                                                        createdTo: undefined,
                                                    }));
                                                    return;
                                                }

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

                    <div className="sticky bottom-0 flex gap-3 border-t bg-background py-4">
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
