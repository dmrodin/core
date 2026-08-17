'use client';

import { useState } from 'react';

import { format, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, FilterIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { useApplicationsList } from '@/entities/application';
import { GetOperationsParams, useOperationTypes } from '@/entities/operations';
import { useUsers } from '@/entities/users';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import {
    Badge,
    Button,
    Calendar,
    cn,
    Label,
    Popover,
    PopoverContent,
    PopoverTrigger,
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
    Skeleton,
    useIsMobile,
} from '@/shared';

export function OperationsFiltersSheet({
    form,
    onReset,
}: {
    form: UseFormReturn<GetOperationsParams>;
    onReset: () => void;
}) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const { isMobile } = useIsMobile();
    const user = useAuthStore((state) => state.user);
    const canLoadReferenceData = Boolean(user);

    const { data: operationTypes, isLoading: operationTypesLoading } = useOperationTypes(
        undefined,
        canLoadReferenceData,
    );
    const { data: applications, isLoading: applicationsLoading } = useApplicationsList(canLoadReferenceData, 'all');
    const { data: users } = useUsers(canLoadReferenceData);

    const [localFilters, setLocalFilters] = useState<Partial<GetOperationsParams>>({});

    const handleApplyFilters = () => {
        Object.entries(localFilters).forEach(([key, value]) => {
            form.setValue(key as keyof GetOperationsParams, value as GetOperationsParams[keyof GetOperationsParams]);
        });
        setSheetOpen(false);
    };

    const resetFilters = () => {
        setLocalFilters({});
        onReset();
    };

    const activeFiltersCount = [
        localFilters.typeId,
        localFilters.applicationId,
        localFilters.userId,
        localFilters.dateFrom,
        localFilters.dateTo,
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
                    <SheetTitle>Фильтры операций</SheetTitle>
                    <SheetDescription>Настройте параметры для фильтрации списка операций</SheetDescription>
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
                                        !localFilters.dateFrom && 'text-muted-foreground',
                                    )}
                                >
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    {localFilters.dateFrom ? (
                                        localFilters.dateTo ? (
                                            <>
                                                {format(new Date(localFilters.dateFrom), 'dd.MM.yyyy', {
                                                    locale: ru,
                                                })}{' '}
                                                –{' '}
                                                {format(new Date(localFilters.dateTo), 'dd.MM.yyyy', {
                                                    locale: ru,
                                                })}
                                            </>
                                        ) : (
                                            format(new Date(localFilters.dateFrom), 'dd.MM.yyyy', {
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
                                className="p-0 w-auto border rounded-xl shadow-lg z-50 overflow-hidden"
                            >
                                <div className="bg-popover">
                                    <Calendar
                                        mode="range"
                                        numberOfMonths={isMobile ? 1 : 2}
                                        selected={{
                                            from: localFilters.dateFrom ? new Date(localFilters.dateFrom) : undefined,
                                            to: localFilters.dateTo ? new Date(localFilters.dateTo) : undefined,
                                        }}
                                        onSelect={(range) => {
                                            if (!range) return;

                                            if (range.from && !range.to) {
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
                                                    dateFrom: utcFrom.toISOString(),
                                                    dateTo: undefined,
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

                                                    if (localFilters.dateFrom === utcFromIso && !localFilters.dateTo) {
                                                        setLocalFilters((prev) => ({
                                                            ...prev,
                                                            dateFrom: utcFromIso,
                                                            dateTo: utcFromIso,
                                                        }));
                                                        setCalendarOpen(false);
                                                        return;
                                                    }

                                                    setLocalFilters((prev) => ({
                                                        ...prev,
                                                        dateFrom: utcFromIso,
                                                        dateTo: undefined,
                                                    }));
                                                    return;
                                                }
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
                                                    dateFrom: utcFrom.toISOString(),
                                                    dateTo: utcTo.toISOString(),
                                                }));
                                                setCalendarOpen(false);
                                            }
                                        }}
                                        locale={ru}
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Тип операции</Label>
                        {operationTypesLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select
                                value={localFilters.typeId ?? ''}
                                onValueChange={(val) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        typeId: val || null,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выбрать" />
                                </SelectTrigger>
                                <SelectContent>
                                    {operationTypes?.map((operationType) => (
                                        <SelectItem key={operationType.id} value={String(operationType.id)}>
                                            {operationType.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Заявка</Label>
                        {applicationsLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select
                                value={localFilters.applicationId ?? ''}
                                onValueChange={(val) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        applicationId: val || null,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выбрать" />
                                </SelectTrigger>
                                <SelectContent>
                                    {applications?.applications?.map((app) => (
                                        <SelectItem key={app.id} value={String(app.id)}>
                                            #{app.id} - {app.amount} {app.currency.code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Пользователь</Label>
                        <Select
                            value={localFilters.userId ?? ''}
                            onValueChange={(val) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    userId: val || null,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выбрать" />
                            </SelectTrigger>
                            <SelectContent>
                                {users?.users?.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.username}
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
