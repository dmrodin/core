'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';

import { ReportsPeriodSchema } from '@/entities/reports';
import { usePeriodReport } from '@/entities/reports';
import { usePopapStore } from '@/entities/reports';
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

export function ReportsPeriodForm() {
    const { data: walletTypesData, isLoading: walletTypesLoading } = useWalletTypes();
    const { mutate: periodReport, isPending } = usePeriodReport();
    const setActive = usePopapStore((state) => state.setActive);
    const form = useForm<z.input<typeof ReportsPeriodSchema>>({
        resolver: zodResolver(ReportsPeriodSchema),
        defaultValues: {
            walletTypes: [],
        },
    });
    const onSubmit = (values: z.input<typeof ReportsPeriodSchema>) => {
        periodReport(values);
        setActive(false);
    };
    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col justify-center">
                    <FormField
                        control={form.control}
                        name="walletTypes"
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
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[365px] p-0" align="start">
                                            <div className="max-h-64 overflow-auto p-2">
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
                                                                    ? [...currentValue, walletType.code]
                                                                    : currentValue.filter((v) => v !== walletType.code);
                                                                field.onChange(newValue);
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
