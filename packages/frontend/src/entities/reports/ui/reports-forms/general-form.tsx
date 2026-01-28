'use client';

import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import z from 'zod';

import { useOperationTypes } from '@/entities/operations';
import { ReportsGeneralSchema } from '@/entities/reports';
import { useWalletTypes } from '@/entities/wallet-type';
import { useGeneralReport } from '@/entities/reports';
import { usePopapStore } from '@/entities/reports';
import { Button, Calendar, Checkbox, cn, formatDate, Loading, Popover, PopoverContent, PopoverTrigger } from '@/shared';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared';
import { Input } from '@/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared';
import { Skeleton } from '@/shared';

export function ReportGeneralForm() {
    const { data: operationTypes, isLoading: operationTypesLoading } = useOperationTypes();
    const { data: walletTypesData, isLoading: walletTypesLoading } = useWalletTypes();
    const { mutate: generalReport, isPending } = useGeneralReport();
    const setActive = usePopapStore((state) => state.setActive);

    const [openStart, setOpenStart] = React.useState(false);
    const [openEnd, setOpenEnd] = React.useState(false);
    const [rawInputStart, setRawInputStart] = React.useState('');
    const [rawInputEnd, setRawInputEnd] = React.useState('');

    const form = useForm<z.input<typeof ReportsGeneralSchema>>({
        resolver: zodResolver(ReportsGeneralSchema),
        defaultValues: {
            dateStart: '',
            dateEnd: '',
            operationTypeId: '',
            typeUnloading: ['all'],
        },
    });
    const onSubmit = (values: z.input<typeof ReportsGeneralSchema>) => {
        generalReport(values);
        setActive(false);
    };
    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col justify-center">
                    <FormField
                        control={form.control}
                        name="dateStart"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Начало периода</FormLabel>
                                <div className="relative flex gap-2">
                                    <FormControl>
                                        <Input
                                            value={rawInputStart}
                                            placeholder="дд.мм.гггг"
                                            className="bg-background pr-10"
                                            onChange={(e) => {
                                                let raw = e.target.value.replace(/\D/g, '');
                                                if (raw.length > 8) raw = raw.slice(0, 8);

                                                let formatted = raw;
                                                if (raw.length > 4)
                                                    formatted = `${raw.slice(0, 2)}.${raw.slice(2, 4)}.${raw.slice(4)}`;
                                                else if (raw.length > 2)
                                                    formatted = `${raw.slice(0, 2)}.${raw.slice(2)}`;

                                                setRawInputStart(formatted);

                                                const parts = formatted.split('.');
                                                if (parts.length === 3) {
                                                    const [dd, mm, yyyy] = parts.map(Number);
                                                    const parsed = new Date(yyyy, mm - 1, dd);
                                                    if (!isNaN(parsed.getTime())) {
                                                        field.onChange(parsed.toISOString());
                                                        return;
                                                    }
                                                }

                                                field.onChange(formatted);
                                            }}
                                        />
                                    </FormControl>
                                    <Popover open={openStart} onOpenChange={setOpenStart}>
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
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const utcDate = new Date(
                                                            Date.UTC(
                                                                date.getFullYear(),
                                                                date.getMonth(),
                                                                date.getDate(),
                                                            ),
                                                        );
                                                        field.onChange(utcDate.toISOString());
                                                        setRawInputStart(formatDate(date));
                                                    }
                                                    setOpenStart(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dateEnd"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Конец периода</FormLabel>
                                <div className="relative flex gap-2">
                                    <FormControl>
                                        <Input
                                            value={rawInputEnd}
                                            placeholder="дд.мм.гггг"
                                            className="bg-background pr-10"
                                            onChange={(e) => {
                                                let raw = e.target.value.replace(/\D/g, '');
                                                if (raw.length > 8) raw = raw.slice(0, 8);

                                                let formatted = raw;
                                                if (raw.length > 4)
                                                    formatted = `${raw.slice(0, 2)}.${raw.slice(2, 4)}.${raw.slice(4)}`;
                                                else if (raw.length > 2)
                                                    formatted = `${raw.slice(0, 2)}.${raw.slice(2)}`;

                                                setRawInputEnd(formatted);

                                                const parts = formatted.split('.');
                                                if (parts.length === 3) {
                                                    const [dd, mm, yyyy] = parts.map(Number);
                                                    const parsed = new Date(yyyy, mm - 1, dd);
                                                    if (!isNaN(parsed.getTime())) {
                                                        field.onChange(parsed.toISOString());
                                                        return;
                                                    }
                                                }

                                                field.onChange(formatted);
                                            }}
                                        />
                                    </FormControl>
                                    <Popover open={openEnd} onOpenChange={setOpenEnd}>
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
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const utcDate = new Date(
                                                            Date.UTC(
                                                                date.getFullYear(),
                                                                date.getMonth(),
                                                                date.getDate(),
                                                            ),
                                                        );
                                                        field.onChange(utcDate.toISOString());
                                                        setRawInputEnd(formatDate(date));
                                                    }
                                                    setOpenEnd(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="operationTypeId"
                        render={({ field, fieldState }) => (
                            <FormItem className="w-full min-[450px]:col-span-2 lg:col-span-1">
                                <FormLabel>Тип операции</FormLabel>
                                {operationTypesLoading ? (
                                    <Skeleton className="h-8" />
                                ) : (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className={cn('w-full', fieldState.error && 'border-red-500')}>
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {operationTypes?.map((operationType) => (
                                                <SelectItem key={operationType.id} value={operationType.id}>
                                                    {operationType.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="typeUnloading"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Типы кошельков</FormLabel>
                                {walletTypesLoading ? (
                                    <Skeleton className="h-10" />
                                ) : (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'w-full justify-between',
                                                        !field.value?.length && 'text-muted-foreground',
                                                    )}
                                                >
                                                    {field.value?.length > 0
                                                        ? `Выбрано: ${field.value.length}`
                                                        : 'Выберите типы'}
                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[365px] p-0" align="start">
                                            <div className="max-h-64 overflow-auto p-2">
                                                <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                                                    <Checkbox
                                                        id="all"
                                                        checked={field.value?.includes('all')}
                                                        onCheckedChange={(checked) => {
                                                            const newValue = checked ? ['all'] : [];
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor="all"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                                    >
                                                        Все
                                                    </label>
                                                </div>
                                                {walletTypesData?.walletTypes?.map((walletType) => (
                                                    <div
                                                        key={walletType.id}
                                                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md"
                                                    >
                                                        <Checkbox
                                                            id={walletType.code}
                                                            checked={field.value?.includes(walletType.code)}
                                                            onCheckedChange={(checked) => {
                                                                const currentValue = field.value || [];
                                                                const newValue = checked
                                                                    ? [
                                                                          ...currentValue.filter((v) => v !== 'all'),
                                                                          walletType.code,
                                                                      ]
                                                                    : currentValue.filter((v) => v !== walletType.code);
                                                                field.onChange(
                                                                    newValue.length > 0 ? newValue : ['all'],
                                                                );
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={walletType.code}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                                        >
                                                            {walletType.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit"> {isPending ? <Loading /> : 'Получить отчет'}</Button>
                </form>
            </Form>
        </div>
    );
}
