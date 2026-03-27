'use client';

import React, { useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import z from 'zod';

import { ReportsConversionWalletsSchema, useConversionWalletsReport, usePopapStore } from '@/entities/reports';
import { useWalletTypes } from '@/entities/wallet-type';
import { APP_TIMEZONE } from '@/shared/config/timezone';
import { Button, Calendar, Checkbox, cn, Loading, Popover, PopoverContent, PopoverTrigger } from '@/shared';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/shared';
import { Input } from '@/shared';
import { Skeleton } from '@/shared';

const SECTION_ALL = 'all';
const SECTION_HIDDEN = 'hidden';

function getAppTimezoneOffsetMs(date: Date): number {
    const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
    const tzStr = date.toLocaleString('en-US', { timeZone: APP_TIMEZONE });
    return new Date(tzStr).getTime() - new Date(utcStr).getTime();
}

function buildDateISO(day: number, month: number, year: number): string {
    const naiveUTC = new Date(Date.UTC(year, month, day, 0, 0, 0));
    const offsetMs = getAppTimezoneOffsetMs(naiveUTC);
    return new Date(naiveUTC.getTime() - offsetMs).toISOString();
}

function formatDateValue(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const mon = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${mon}.${year}`;
}

export function ReportsConversionWalletsForm() {
    const { data: walletTypesData, isLoading: walletTypesLoading } = useWalletTypes();
    const { mutate: conversionWalletsReport, isPending } = useConversionWalletsReport();
    const setActive = usePopapStore((state) => state.setActive);

    const [openStart, setOpenStart] = React.useState(false);
    const [openEnd, setOpenEnd] = React.useState(false);
    const [dateStart, setDateStart] = React.useState<Date | undefined>(undefined);
    const [dateEnd, setDateEnd] = React.useState<Date | undefined>(undefined);
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

    const handleInputChange = (
        raw: string,
        setRawInput: (v: string) => void,
        setDate: (d: Date | undefined) => void,
        fieldOnChange: (v: string) => void,
    ) => {
        let digits = raw.replace(/\D/g, '');
        if (digits.length > 8) digits = digits.slice(0, 8);

        let formatted = digits;
        if (digits.length > 4) formatted = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
        else if (digits.length > 2) formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;

        setRawInput(formatted);

        if (digits.length === 8) {
            const [dd, mm, yyyy] = [
                Number(formatted.slice(0, 2)),
                Number(formatted.slice(3, 5)),
                Number(formatted.slice(6)),
            ];
            const parsed = new Date(yyyy, mm - 1, dd);
            if (!isNaN(parsed.getTime())) {
                setDate(parsed);
                fieldOnChange(buildDateISO(dd, mm - 1, yyyy));
                return;
            }
        }

        setDate(undefined);
        fieldOnChange(formatted);
    };

    const handleCalendarSelect = (
        selected: Date | undefined,
        setRawInput: (v: string) => void,
        setDate: (d: Date | undefined) => void,
        fieldOnChange: (v: string) => void,
        setOpen: (v: boolean) => void,
    ) => {
        if (selected) {
            setDate(selected);
            setRawInput(formatDateValue(selected));
            fieldOnChange(buildDateISO(selected.getDate(), selected.getMonth(), selected.getFullYear()));
        }
        setOpen(false);
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
                                    <Input
                                        value={rawInputStart}
                                        placeholder="дд.мм.гггг"
                                        className="bg-background pr-10"
                                        onChange={(e) =>
                                            handleInputChange(
                                                e.target.value,
                                                setRawInputStart,
                                                setDateStart,
                                                field.onChange,
                                            )
                                        }
                                    />
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
                                                selected={dateStart}
                                                onSelect={(d) =>
                                                    handleCalendarSelect(
                                                        d,
                                                        setRawInputStart,
                                                        setDateStart,
                                                        field.onChange,
                                                        setOpenStart,
                                                    )
                                                }
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
                                    <Input
                                        value={rawInputEnd}
                                        placeholder="дд.мм.гггг"
                                        className="bg-background pr-10"
                                        onChange={(e) =>
                                            handleInputChange(
                                                e.target.value,
                                                setRawInputEnd,
                                                setDateEnd,
                                                field.onChange,
                                            )
                                        }
                                    />
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
                                                selected={dateEnd}
                                                onSelect={(d) =>
                                                    handleCalendarSelect(
                                                        d,
                                                        setRawInputEnd,
                                                        setDateEnd,
                                                        field.onChange,
                                                        setOpenEnd,
                                                    )
                                                }
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
