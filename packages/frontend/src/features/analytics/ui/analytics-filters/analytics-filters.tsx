'use client';

import React, { useState } from 'react';

import { CalendarIcon, FilterIcon } from 'lucide-react';

import { formatDate } from '@/shared/lib/utils';
import { Input } from '@/shared/ui/shadcn/input';
import { Badge } from '@/shared/ui/shadcn/badge';

import { useCurrencies } from '@/entities/currency/model/use-currencies';
import { UserRole } from '@/entities/users/model/user-schemas';
import { useUsers } from '@/entities/users/model/use-users';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import { useAnalyticsFilters } from '@/features/analytics/hook/use-analytics-filters';
import { Button } from '@/shared/ui/shadcn/button';
import { Calendar } from '@/shared/ui/shadcn/calendar';
import { Label } from '@/shared/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/shadcn/sheet';

export const AnalyticsFilters = () => {
    const user = useAuthStore((state) => state.user);
    const hasAdminRole = user?.roles?.some((role) => role.code === UserRole.ADMIN) ?? false;
    const isRestrictedRole =
        !hasAdminRole &&
        (user?.roles?.some((role) => role.code === UserRole.USER || role.code === UserRole.MODERATOR) ?? false);
    const canLoadReferenceData = Boolean(user) && !isRestrictedRole;

    const { filters, setFilters, resetFilters } = useAnalyticsFilters();
    const { data: currenciesData } = useCurrencies(undefined, canLoadReferenceData);
    const { data: usersData } = useUsers(canLoadReferenceData);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [dateFromOpen, setDateFromOpen] = useState(false);
    const [dateToOpen, setDateToOpen] = useState(false);

    const [localCurrency, setLocalCurrency] = useState(filters.currency || '');
    const [localHolder, setLocalHolder] = useState(filters.holder || '');
    const [localDateFrom, setLocalDateFrom] = useState<Date | undefined>(
        filters.dateStart ? new Date(filters.dateStart) : undefined,
    );
    const [localDateTo, setLocalDateTo] = useState<Date | undefined>(
        filters.dateEnd ? new Date(filters.dateEnd) : undefined,
    );
    const [rawInputFrom, setRawInputFrom] = useState(filters.dateStart ? formatDate(new Date(filters.dateStart)) : '');
    const [rawInputTo, setRawInputTo] = useState(filters.dateEnd ? formatDate(new Date(filters.dateEnd)) : '');

    const handleApplyFilters = () => {
        setFilters({
            currency: localCurrency && localCurrency !== 'all' ? localCurrency : undefined,
            holder: localHolder && localHolder !== 'all' ? localHolder : undefined,
            dateStart: localDateFrom?.toISOString(),
            dateEnd: localDateTo?.toISOString(),
        });
        setSheetOpen(false);
    };

    const handleResetFilters = () => {
        setLocalCurrency('');
        setLocalHolder('');
        setLocalDateFrom(undefined);
        setLocalDateTo(undefined);
        setRawInputFrom('');
        setRawInputTo('');
        resetFilters();
        setSheetOpen(false);
    };

    const activeFiltersCount = [filters.currency, filters.holder, filters.dateStart, filters.dateEnd].filter(
        Boolean,
    ).length;

    return (
        <div className="flex gap-4 items-center">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="relative">
                        <FilterIcon className="mr-2 h-4 w-4" />
                        Фильтры
                        {activeFiltersCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="ml-2 h-5 min-w-5 px-1 flex items-center justify-center"
                            >
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Фильтры аналитики</SheetTitle>
                        <SheetDescription>Настройте параметры для отображения данных</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6 px-4">
                        <div className="space-y-2">
                            <Label htmlFor="currency">Валюта</Label>
                            <Select value={localCurrency} onValueChange={setLocalCurrency}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите валюту" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все валюты</SelectItem>
                                    {currenciesData?.currencies.map((currency) => (
                                        <SelectItem key={currency.id} value={currency.code}>
                                            {currency.code} - {currency.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="holder">Держатель</Label>
                            <Select value={localHolder} onValueChange={setLocalHolder}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите держателя" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все держатели</SelectItem>
                                    {usersData?.users.map((user) => (
                                        <SelectItem key={user.id} value={user.username}>
                                            {user.username}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Дата от</Label>
                            <div className="relative flex gap-2">
                                <Input
                                    value={rawInputFrom}
                                    placeholder="дд.мм.гггг"
                                    className="bg-background pr-10"
                                    onChange={(e) => {
                                        let raw = e.target.value.replace(/\D/g, '');
                                        if (raw.length > 8) raw = raw.slice(0, 8);

                                        let formatted = raw;
                                        if (raw.length > 4)
                                            formatted = `${raw.slice(0, 2)}.${raw.slice(2, 4)}.${raw.slice(4)}`;
                                        else if (raw.length > 2) formatted = `${raw.slice(0, 2)}.${raw.slice(2)}`;

                                        setRawInputFrom(formatted);

                                        const parts = formatted.split('.');
                                        if (parts.length === 3) {
                                            const [dd, mm, yyyy] = parts.map(Number);
                                            // Создаем дату напрямую в UTC
                                            const parsed = new Date(Date.UTC(yyyy, mm - 1, dd));
                                            if (!isNaN(parsed.getTime())) {
                                                setLocalDateFrom(parsed);
                                                return;
                                            }
                                        }
                                    }}
                                />
                                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                        >
                                            <CalendarIcon className="size-3.5" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={localDateFrom}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setLocalDateFrom(date);
                                                    setRawInputFrom(formatDate(date));
                                                }
                                                setDateFromOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Дата до</Label>
                            <div className="relative flex gap-2">
                                <Input
                                    value={rawInputTo}
                                    placeholder="дд.мм.гггг"
                                    className="bg-background pr-10"
                                    onChange={(e) => {
                                        let raw = e.target.value.replace(/\D/g, '');
                                        if (raw.length > 8) raw = raw.slice(0, 8);

                                        let formatted = raw;
                                        if (raw.length > 4)
                                            formatted = `${raw.slice(0, 2)}.${raw.slice(2, 4)}.${raw.slice(4)}`;
                                        else if (raw.length > 2) formatted = `${raw.slice(0, 2)}.${raw.slice(2)}`;

                                        setRawInputTo(formatted);

                                        const parts = formatted.split('.');
                                        if (parts.length === 3) {
                                            const [dd, mm, yyyy] = parts.map(Number);
                                            // Создаем дату напрямую в UTC
                                            const parsed = new Date(Date.UTC(yyyy, mm - 1, dd));
                                            if (!isNaN(parsed.getTime())) {
                                                setLocalDateTo(parsed);
                                                return;
                                            }
                                        }
                                    }}
                                />
                                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                                        >
                                            <CalendarIcon className="size-3.5" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={localDateTo}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setLocalDateTo(date);
                                                    setRawInputTo(formatDate(date));
                                                }
                                                setDateToOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <Button onClick={handleResetFilters} variant="outline" className="flex-1">
                                Сбросить
                            </Button>
                            <Button onClick={handleApplyFilters} className="flex-1">
                                Применить
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};
