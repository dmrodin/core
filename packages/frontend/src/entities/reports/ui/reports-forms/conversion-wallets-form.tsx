'use client';

import React, { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import z from 'zod';

import { ReportsConversionWalletsSchema, useConversionWalletsReport, usePopapStore } from '@/entities/reports';
import { useWalletTypes } from '@/entities/wallet-type';
import { Button, Calendar, Checkbox, cn, formatDate, Loading, Popover, PopoverContent, PopoverTrigger } from '@/shared';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared';
import { Input } from '@/shared';
import { Skeleton } from '@/shared';

const SECTION_ALL = 'all';
const SECTION_HIDDEN = 'hidden';

export function ReportsConversionWalletsForm() {
    const { data: walletTypesData, isLoading: walletTypesLoading } = useWalletTypes();
    const { mutate: conversionWalletsReport, isPending } = useConversionWalletsReport();
    const setActive = usePopapStore((state) => state.setActive);

    const [openStart, setOpenStart] = React.useState(false);
    const [openEnd, setOpenEnd] = React.useState(false);
    const [rawInputStart, setRawInputStart] = React.useState('');
    const [rawInputEnd, setRawInputEnd] = React.useState('');

    const tabSectionTypes = useMemo(
        () =>
            (walletTypesData?.walletTypes ?? [])
                .filter((type) => type.showInTabs)
                .sort((a, b) => a.tabOrder - b.tabOrder),
        [walletTypesData?.walletTypes],
    );

    const form = useForm<z.input<typeof ReportsConversionWalletsSchema>>({
        resolver: zodResolver(ReportsConversionWalletsSchema),
        defaultValues: {
            dateStart: '',
            dateEnd: '',
            sections: [SECTION_ALL],
        },
    });

    const onSubmit = (values: z.input<typeof ReportsConversionWalletsSchema>) => {
        conversionWalletsReport(values);
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
                        name="sections"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Разделы кошельков</FormLabel>
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
                                                    {field.value?.includes(SECTION_ALL)
                                                        ? 'Все разделы'
                                                        : `Выбрано: ${field.value?.length ?? 0}`}
                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[365px] p-0" align="start">
                                            <div className="max-h-64 overflow-auto p-2">
                                                <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                                                    <Checkbox
                                                        id={`cw-${SECTION_ALL}`}
                                                        checked={field.value?.includes(SECTION_ALL)}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(checked ? [SECTION_ALL] : []);
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`cw-${SECTION_ALL}`}
                                                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                                                    >
                                                        Все
                                                    </label>
                                                </div>

                                                <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                                                    <Checkbox
                                                        id={`cw-${SECTION_HIDDEN}`}
                                                        checked={field.value?.includes(SECTION_HIDDEN)}
                                                        onCheckedChange={(checked) => {
                                                            const currentValue = field.value || [];
                                                            const withoutAll = currentValue.filter(
                                                                (value) => value !== SECTION_ALL,
                                                            );
                                                            const newValue = checked
                                                                ? [...withoutAll, SECTION_HIDDEN]
                                                                : withoutAll.filter(
                                                                      (value) => value !== SECTION_HIDDEN,
                                                                  );

                                                            field.onChange(
                                                                newValue.length > 0 ? newValue : [SECTION_ALL],
                                                            );
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`cw-${SECTION_HIDDEN}`}
                                                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                                                    >
                                                        Скрытые
                                                    </label>
                                                </div>

                                                {tabSectionTypes.map((walletType) => (
                                                    <div
                                                        key={walletType.id}
                                                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md"
                                                    >
                                                        <Checkbox
                                                            id={`cw-${walletType.code}`}
                                                            checked={field.value?.includes(walletType.code)}
                                                            onCheckedChange={(checked) => {
                                                                const currentValue = field.value || [];
                                                                const withoutAll = currentValue.filter(
                                                                    (value) => value !== SECTION_ALL,
                                                                );
                                                                const newValue = checked
                                                                    ? [...withoutAll, walletType.code]
                                                                    : withoutAll.filter(
                                                                          (value) => value !== walletType.code,
                                                                      );

                                                                field.onChange(
                                                                    newValue.length > 0 ? newValue : [SECTION_ALL],
                                                                );
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`cw-${walletType.code}`}
                                                            className="text-sm font-medium leading-none cursor-pointer flex-1"
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

                    <Button type="submit">{isPending ? <Loading /> : 'Получить отчет'}</Button>
                </form>
            </Form>
        </div>
    );
}
