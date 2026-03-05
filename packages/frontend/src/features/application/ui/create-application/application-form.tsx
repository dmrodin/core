import React from 'react';
import { Trash2 } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';

import {
    ApplicationResponse,
    CreateApplicationRequest,
    CreateApplicationRequestSchema,
    DateTimePicker,
    useUpdateApplication,
} from '@/entities/application';
import { useCurrency } from '@/entities/currency';
import { useOperationTypes } from '@/entities/operations';
import { useWallets } from '@/entities/wallet';
import { useCouriers } from '@/entities/users';
import { useCreateApplication } from '@/features/application';
import { cn, findPhoneRule, formatByRule, formatNumber, normalizeDigits, RequiredLabel, Skeleton } from '@/shared';
import { Button } from '@/shared';
import { Checkbox, Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared';
import { Input } from '@/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared';
import { Separator } from '@/shared';
import { Textarea } from '@/shared';

const formatTelegramUsername = (value: string): string => {
    return value
        .replace(/@/g, '')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .substring(0, 32);
};

export function ApplicationForm({ initialData }: { initialData?: ApplicationResponse } & React.ComponentProps<'form'>) {
    const isCreateMode = !initialData;
    const { data: operationTypes, isLoading: operationTypesLoading } = useOperationTypes();
    const { data: couriers, isLoading: couriersLoading } = useCouriers();
    const { data: currency, isLoading: currencyLoading } = useCurrency();
    const { data: wallets } = useWallets();
    const createMutation = useCreateApplication();
    const updateMutation = useUpdateApplication();
    const [walletSearch, setWalletSearch] = React.useState('');
    const [isAdvanceEnabled, setIsAdvanceEnabled] = React.useState(Boolean(initialData?.advance));

    const form = useForm<CreateApplicationRequest>({
        resolver: zodResolver(CreateApplicationRequestSchema),
        shouldUnregister: true,
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

    const {
        fields: advanceFields,
        append: appendAdvanceEntry,
        remove: removeAdvanceEntry,
        replace: replaceAdvanceEntry,
    } = useFieldArray({
        control: form.control,
        name: 'advance.entries',
        keyName: 'fieldId',
    });

    const onSubmit = (data: CreateApplicationRequest) => {
        const filteredAdvanceEntries =
            data.advance?.entries
                ?.filter((entry) => entry.walletId && entry.amount > 0)
                .map((entry) => ({
                    walletId: entry.walletId,
                    direction: entry.direction,
                    amount: entry.amount,
                })) ?? [];

        const formData = {
            ...data,
            telegramUsername: data.telegramUsername ? `@${data.telegramUsername}` : '',
            advance:
                filteredAdvanceEntries.length > 0
                    ? { entries: filteredAdvanceEntries }
                    : data.advance && typeof data.advance.amount === 'number' && data.advance.amount > 0
                      ? data.advance
                      : null,
        };

        if (initialData) {
            updateMutation.mutate({ id: initialData.id.toString(), ...formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col">
                    <div className="grid lg:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="assigneeUserId"
                            render={({ field }) => (
                                <FormItem>
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
                                                {couriers?.map((courier) => (
                                                    <SelectItem key={courier.id} value={courier.id}>
                                                        {courier.username}
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
                                <FormItem className="flex flex-col w-full">
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
                        <div className="grid min-[450px]:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                                    {(operationTypes ?? [])
                                                        .toSorted((a, b) => a.name.localeCompare(b.name))
                                                        .map((operationType) => (
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
                                                    {currency?.currencies.map((item) => (
                                                        <SelectItem key={item.id} value={item.id}>
                                                            {item.code}
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
                                                checked={isAdvanceEnabled}
                                                onCheckedChange={(checked) => {
                                                    const enabled = checked === true;
                                                    setIsAdvanceEnabled(enabled);

                                                    if (!enabled) {
                                                        replaceAdvanceEntry([]);
                                                        form.unregister('advance.entries');
                                                        form.clearErrors('advance');
                                                        field.onChange(null);
                                                        return;
                                                    }

                                                    field.onChange(
                                                        isCreateMode
                                                            ? { entries: [] }
                                                            : {
                                                                  amount: 0,
                                                                  currencyId: '',
                                                              },
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormLabel className="cursor-pointer">Аванс</FormLabel>
                                    </FormItem>
                                )}
                            />

                            {isAdvanceEnabled && (
                                <>
                                    {isCreateMode ? (
                                        <div className="mt-4 lg:grid lg:grid-cols-2 gap-4">
                                            {(['debit', 'credit'] as const).map((dir) => (
                                                <div key={dir} className="flex flex-col gap-3">
                                                    <div className="lg:flex justify-between items-center">
                                                        <p className="font-medium">
                                                            {dir === 'credit' ? 'Прибавить к...' : 'Вычесть из...'}
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            type="button"
                                                            onClick={() =>
                                                                appendAdvanceEntry({
                                                                    walletId: '',
                                                                    direction: dir,
                                                                    amount: 0,
                                                                })
                                                            }
                                                        >
                                                            + Добавить строку
                                                        </Button>
                                                    </div>

                                                    {advanceFields
                                                        .map((item, realIndex) => ({ item, realIndex }))
                                                        .filter(({ item }) => item.direction === dir)
                                                        .map(({ item, realIndex }) => (
                                                            <div key={item.fieldId} className="flex gap-3 items-end">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`advance.entries.${realIndex}.walletId`}
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex-1">
                                                                            <FormLabel>Кошелек</FormLabel>
                                                                            <Select
                                                                                onValueChange={field.onChange}
                                                                                value={field.value || ''}
                                                                            >
                                                                                <FormControl>
                                                                                    <SelectTrigger className="w-full">
                                                                                        <SelectValue placeholder="Выберите кошелек" />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent>
                                                                                    <div className="px-2 pb-2">
                                                                                        <Input
                                                                                            placeholder="Поиск кошелька..."
                                                                                            value={walletSearch}
                                                                                            onChange={(e) =>
                                                                                                setWalletSearch(
                                                                                                    e.target.value,
                                                                                                )
                                                                                            }
                                                                                            onKeyDown={(e) =>
                                                                                                e.stopPropagation()
                                                                                            }
                                                                                            onKeyUp={(e) =>
                                                                                                e.stopPropagation()
                                                                                            }
                                                                                            className="h-8"
                                                                                        />
                                                                                    </div>
                                                                                    {wallets?.wallets
                                                                                        ?.filter((wallet) => {
                                                                                            const matchesSearch =
                                                                                                wallet.name
                                                                                                    .toLowerCase()
                                                                                                    .includes(
                                                                                                        walletSearch.toLowerCase(),
                                                                                                    );
                                                                                            return (
                                                                                                matchesSearch &&
                                                                                                wallet.active &&
                                                                                                wallet.visible &&
                                                                                                !wallet.deleted
                                                                                            );
                                                                                        })
                                                                                        .map((wallet) => (
                                                                                            <SelectItem
                                                                                                key={wallet.id}
                                                                                                value={wallet.id}
                                                                                            >
                                                                                                {wallet.name} -{' '}
                                                                                                {wallet.amount}{' '}
                                                                                                {wallet.currency.code}
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                <FormField
                                                                    control={form.control}
                                                                    name={`advance.entries.${realIndex}.amount`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Сумма</FormLabel>
                                                                            <FormControl>
                                                                                <Input
                                                                                    type="number"
                                                                                    value={field.value ?? ''}
                                                                                    onChange={(e) => {
                                                                                        const value = e.target.value;
                                                                                        if (!value) {
                                                                                            field.onChange(0);
                                                                                            return;
                                                                                        }
                                                                                        const numValue = Number(value);
                                                                                        field.onChange(
                                                                                            Number.isNaN(numValue)
                                                                                                ? 0
                                                                                                : numValue,
                                                                                        );
                                                                                    }}
                                                                                    onFocus={() => {
                                                                                        if (field.value === 0) {
                                                                                            field.onChange('');
                                                                                        }
                                                                                    }}
                                                                                    onBlur={(e) => {
                                                                                        if (!e.currentTarget.value) {
                                                                                            field.onChange(0);
                                                                                        }
                                                                                    }}
                                                                                    className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => removeAdvanceEntry(realIndex)}
                                                                    className="text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
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
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Выберите валюту" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {currency?.currencies.map((item) => (
                                                                    <SelectItem key={item.id} value={item.id}>
                                                                        {item.name} ({item.code})
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
                                </>
                            )}
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid grid-cols-1 min-[450px]:grid-cols-2 gap-4">
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
