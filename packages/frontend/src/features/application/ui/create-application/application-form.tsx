import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import {
    ApplicationResponse,
    CreateApplicationRequest,
    CreateApplicationRequestSchema,
    DateTimePicker,
    useUpdateApplication,
} from '@/entities/application';
import { useCurrency } from '@/entities/currency';
import { useOperationTypes } from '@/entities/operations';
import { useCouriers } from '@/entities/users';
import { useCreateApplication } from '@/features/application';
import { cn, findPhoneRule, formatByRule, formatNumber, normalizeDigits, RequiredLabel, Skeleton } from '@/shared';
import { Button } from '@/shared';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared';
import { Input } from '@/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from '@/shared';
import { Separator } from '@/shared';
import { Textarea } from '@/shared';

const formatTelegramUsername = (value: string): string => {
    return value
        .replace(/@/g, '')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .substring(0, 32);
};

export function ApplicationForm({ initialData }: { initialData?: ApplicationResponse } & React.ComponentProps<'form'>) {
    const { data: operationTypes, isLoading: operationTypesLoading } = useOperationTypes();
    const { data: couriers, isLoading: couriersLoading } = useCouriers();
    const { data: currency, isLoading: currencyLoading } = useCurrency();
    const createMutation = useCreateApplication();
    const updateMutation = useUpdateApplication();

    const form = useForm<CreateApplicationRequest>({
        resolver: zodResolver(CreateApplicationRequestSchema),
        defaultValues: initialData
            ? {
                  currencyId: initialData.currencyId ?? '',
                  operationTypeId: initialData.operationTypeId ?? '',
                  assigneeUserId: initialData.assigneeUserId ?? '',
                  description: initialData.description ?? '',
                  amount: initialData.amount ?? 0,
                  telegramUsername: initialData.telegramUsername ? initialData.telegramUsername.replace('@', '') : '',
                  phone: initialData.phone ?? '',
                  meetingDate: initialData.meetingDate ?? '',
                  advance: initialData.advance
                      ? {
                            amount: initialData.advance.amount,
                            currencyId: initialData.advance.currency,
                        }
                      : null,
              }
            : {
                  currencyId: '',
                  operationTypeId: '',
                  assigneeUserId: '',
                  description: '',
                  amount: 0,
                  telegramUsername: '',
                  phone: '',
                  meetingDate: undefined,
                  advance: null,
              },
    });

    const advance = useWatch({
        control: form.control,
        name: 'advance',
    });

    const onSubmit = (data: CreateApplicationRequest) => {
        const formData = {
            ...data,
            telegramUsername: data.telegramUsername ? `@${data.telegramUsername}` : '',
            advance: data.advance && data.advance.amount > 0 ? data.advance : null,
        };

        if (initialData) {
            // Режим редактирования
            updateMutation.mutate({ id: initialData.id.toString(), ...formData });
        } else {
            // Режим создания
            createMutation.mutate(formData);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col ">
                    <div className="grid lg:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="assigneeUserId"
                            render={({ field }) => (
                                <FormItem className="">
                                    <RequiredLabel required>Исполнитель</RequiredLabel>

                                    {couriersLoading ? (
                                        <Skeleton className="h-8" />
                                    ) : (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl className="w-full">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите исполнителя" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {couriers?.map((couriers) => (
                                                    <SelectItem key={couriers.id} value={couriers.id}>
                                                        {couriers.username}
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
                            name="meetingDate"
                            render={({ field, fieldState }) => (
                                <FormItem className="flex flex-col  w-full">
                                    <RequiredLabel required>Дата и время встречи</RequiredLabel>
                                    <DateTimePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        className={cn(
                                            'max-sm:flex-col max-sm:items-stretch',
                                            fieldState.error && '*:border-red-500 *:border-2',
                                        )}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Separator className="my-6" />
                    <div className="flex flex-col gap-2">
                        <div className="grid  min-[450px]:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="operationTypeId"
                                render={({ field, fieldState }) => (
                                    <FormItem className="w-full min-[450px]:col-span-2 lg:col-span-1">
                                        <RequiredLabel required>Тип операции</RequiredLabel>
                                        {operationTypesLoading ? (
                                            <Skeleton className="h-8" />
                                        ) : (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <SelectTrigger
                                                    className={cn('w-full', fieldState.error && 'border-red-500')}
                                                >
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
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <RequiredLabel required>Сумма</RequiredLabel>
                                        <FormControl className="w-full">
                                            <Input
                                                type="text"
                                                placeholder="1 000 000"
                                                value={field.value ? formatNumber(field.value) : ''}
                                                onChange={(e) => {
                                                    const digits = e.target.value.replace(/\D/g, '');
                                                    const numValue = digits === '' ? 0 : parseInt(digits, 10);
                                                    field.onChange(numValue);
                                                }}
                                                inputMode="numeric"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currencyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <RequiredLabel required>Валюта</RequiredLabel>
                                        {currencyLoading ? (
                                            <Skeleton className="h-8" />
                                        ) : (
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl className="w-full">
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите валюту" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {currency?.currencies.map((currency) => (
                                                        <SelectItem key={currency.id} value={currency.id}>
                                                            {currency.name} ({currency.code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="mt-2">
                            <FormField
                                control={form.control}
                                name="advance"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={!!field.value}
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked ? { amount: 0, currencyId: '' } : null);
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="cursor-pointer">Аванс</FormLabel>
                                    </FormItem>
                                )}
                            />
                            {advance && (
                                <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-4 mt-4">
                                    <FormField
                                        control={form.control}
                                        name="advance.amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <RequiredLabel required>Сумма аванса</RequiredLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        placeholder="100 000"
                                                        value={field.value ? formatNumber(field.value) : ''}
                                                        onChange={(e) => {
                                                            const digits = e.target.value.replace(/\D/g, '');
                                                            field.onChange(digits ? Number(digits) : 0);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="advance.currencyId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <RequiredLabel required>Валюта аванса</RequiredLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Выберите валюту" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {currency?.currencies.map((currency) => (
                                                            <SelectItem key={currency.id} value={currency.id}>
                                                                {currency.name} ({currency.code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1  min-[450px]:grid-cols-2 gap-4 ">
                        <FormField
                            control={form.control}
                            name="telegramUsername"
                            render={({ field }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Имя пользователя (Telegram)</FormLabel>
                                    <div className="flex rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                        <span className="flex items-center px-3 text-muted-foreground bg-muted border-r">
                                            @
                                        </span>
                                        <Input
                                            placeholder="username"
                                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                                            value={field.value}
                                            onChange={(e) => {
                                                const formattedValue = formatTelegramUsername(e.target.value);
                                                field.onChange(formattedValue);
                                            }}
                                            onPaste={(e) => {
                                                e.preventDefault();
                                                const pastedText = e.clipboardData.getData('text');
                                                const formattedValue = formatTelegramUsername(pastedText);
                                                field.onChange(formattedValue);
                                            }}
                                        />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => {
                                const rule = findPhoneRule(field.value ?? '');
                                return (
                                    <FormItem className="col-span-1 self-end">
                                        <FormLabel>Номер телефона</FormLabel>
                                        <FormControl>
                                            <Input
                                                value={formatByRule(field.value)}
                                                onChange={(e) => {
                                                    const normalized = normalizeDigits(e.target.value);
                                                    field.onChange(normalized);
                                                }}
                                                placeholder={rule?.example ?? '+XXX XX XXX XX XX'}
                                                inputMode="numeric"
                                                maxLength={20}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    </div>

                    <Separator className="my-6" />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="col-span-1">
                                <FormLabel>Описание</FormLabel>
                                <Textarea placeholder="Описание" {...field} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full cursor-pointer"
                >
                    {updateMutation.isPending
                        ? 'Сохраняем...'
                        : initialData
                          ? 'Сохранить'
                          : createMutation.isPending
                            ? 'Создание заявки...'
                            : 'Создать заявку'}
                </Button>
            </form>
        </Form>
    );
}
