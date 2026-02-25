'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

import { DateTimePicker } from '@/entities/application';
import { ReportsBalancesSchema, useBalancesReport, usePopapStore } from '@/entities/reports';
import { useWalletTypes } from '@/entities/wallet-type';
import { Button, Checkbox, Loading } from '@/shared';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Popover,
    PopoverContent,
    PopoverTrigger,
    cn,
} from '@/shared';
import { Skeleton } from '@/shared';

const SECTION_ALL = 'all';
const SECTION_HIDDEN = 'hidden';

export function ReportsBalancesForm() {
    const { data: walletTypesData, isLoading: walletTypesLoading } = useWalletTypes();
    const { mutate: balancesReport, isPending } = useBalancesReport();
    const setActive = usePopapStore((state) => state.setActive);

    const tabSectionTypes = useMemo(
        () =>
            (walletTypesData?.walletTypes ?? [])
                .filter((type) => type.showInTabs)
                .sort((a, b) => a.tabOrder - b.tabOrder),
        [walletTypesData?.walletTypes],
    );

    const form = useForm<z.input<typeof ReportsBalancesSchema>>({
        resolver: zodResolver(ReportsBalancesSchema),
        defaultValues: {
            snapshotAt: new Date().toISOString(),
            sections: [SECTION_ALL],
        },
    });

    const onSubmit = (values: z.input<typeof ReportsBalancesSchema>) => {
        balancesReport(values);
        setActive(false);
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col justify-center">
                    <FormField
                        control={form.control}
                        name="snapshotAt"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Дата и время</FormLabel>
                                <FormControl>
                                    <DateTimePicker value={field.value} onChange={field.onChange} />
                                </FormControl>
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
                                                        id={SECTION_ALL}
                                                        checked={field.value?.includes(SECTION_ALL)}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(checked ? [SECTION_ALL] : []);
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={SECTION_ALL}
                                                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                                                    >
                                                        Все
                                                    </label>
                                                </div>

                                                <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                                                    <Checkbox
                                                        id={SECTION_HIDDEN}
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
                                                        htmlFor={SECTION_HIDDEN}
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
                                                            id={walletType.code}
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
                                                            htmlFor={walletType.code}
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
