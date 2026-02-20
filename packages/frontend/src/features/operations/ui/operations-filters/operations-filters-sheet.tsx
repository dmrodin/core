'use client';

import { useState } from 'react';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, FilterIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { useApplicationsList } from '@/entities/application';
import { GetOperationsParams, useOperationTypes } from '@/entities/operations';
import { UserRole } from '@/entities/users/model/user-schemas';
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
    const user = useAuthStore((state) => state.user);
    const hasAdminRole = user?.roles?.some((role) => role.code === UserRole.ADMIN) ?? false;
    const isRestrictedRole =
        !hasAdminRole &&
        (user?.roles?.some((role) => role.code === UserRole.USER || role.code === UserRole.MODERATOR) ?? false);
    const canLoadReferenceData = Boolean(user) && !isRestrictedRole;

    const { data: operationTypes, isLoading: operationTypesLoading } = useOperationTypes(
        undefined,
        canLoadReferenceData,
    );
    const { data: applications, isLoading: applicationsLoading } = useApplicationsList(canLoadReferenceData);
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
        setSheetOpen(false);
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
                                        numberOfMonths={2}
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
