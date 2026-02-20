'use client';

import React from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import { ApplicationService, useApplicationsList, useUpdateStatusApplication } from '@/entities/application';
import { UserRole } from '@/entities/users/model/user-schemas';
import { useLockedPeriods } from '@/entities/locked-period';
import {
    CreateOperationBackendDto,
    CreateOperationDto,
    CreateOperationDtoSchema,
    OperationResponseDto,
    UpdateOperationBackendDto,
    useCreateOperation,
    useOperationTypes,
    useUpdateOperation,
    useWallets,
} from '@/entities/operations';
import {
    Button,
    Calendar,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Skeleton,
    Textarea,
    cn,
    formatDate,
    ROUTER_MAP,
} from '@/shared';
import { formatNumber, parseFormattedNumber } from '@/shared/lib/utils/format-number';
import { useBanks } from '@/entities/bank';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';

const SINGLE_SIDE_OPERATION_NAMES = new Set(['аванс', 'зачисление', 'расход', 'корректировка']);

export function OperationForm({
    initialData,
    className,
    ...props
}: { initialData?: OperationResponseDto } & React.ComponentProps<'form'>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((state) => state.user);
    const hasAdminRole = user?.roles?.some((role) => role.code === UserRole.ADMIN) ?? false;
    const isRestrictedRole =
        !hasAdminRole &&
        (user?.roles?.some((role) => role.code === UserRole.USER || role.code === UserRole.MODERATOR) ?? false);
    const canLoadOperationsReferences = Boolean(user) && !isRestrictedRole;
    const canLoadApplications = Boolean(user) && !isRestrictedRole;
    const createMutation = useCreateOperation();
    const updateMutation = useUpdateOperation();
    const updateStatusMutation = useUpdateStatusApplication();
    const isEditing = Boolean(initialData);
    const prefilledApplicationId = React.useMemo(() => {
        if (isEditing) return undefined;
        const raw = searchParams.get('applicationId');
        if (!raw) return undefined;
        const parsed = Number(raw);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    }, [isEditing, searchParams]);
    const shouldCompleteApplicationOnCreate = !isEditing && searchParams.get('completeOnCreate') === '1';

    const [open, setOpen] = React.useState(false);
    const [rawInput, setRawInput] = React.useState('');
    const [walletSearch, setWalletSearch] = React.useState('');

    const { data: wallets } = useWallets();
    const { data: banks } = useBanks();
    const { data: operationTypes, isLoading: isOperationTypesLoading } = useOperationTypes(
        undefined,
        canLoadOperationsReferences,
    );
    const { data: applications, isLoading: isApplicationsLoading } = useApplicationsList(canLoadApplications);
    const { data: lockedPeriodsData } = useLockedPeriods(canLoadOperationsReferences);

    // Получаем текущую заявку операции, если она есть (даже если завершена)
    const currentApplicationId = initialData?.applicationId;
    const { data: currentApplication } = useQuery({
        queryKey: ['application', currentApplicationId],
        queryFn: () => (currentApplicationId ? ApplicationService.getById(String(currentApplicationId)) : null),
        enabled: !!currentApplicationId && canLoadApplications,
    });

    // Объединяем открытые заявки и текущую заявку (если она завершена)
    const availableApplications = React.useMemo(() => {
        const openApps = applications?.applications || [];

        // Если есть текущая заявка и её нет в списке открытых, добавляем её
        if (currentApplication && !openApps.find((app) => app.id === currentApplication.id)) {
            return [currentApplication, ...openApps];
        }

        return openApps;
    }, [applications, currentApplication]);

    const form = useForm<CreateOperationDto>({
        resolver: zodResolver(CreateOperationDtoSchema),
        defaultValues: initialData
            ? {
                  typeId: initialData.typeId,
                  applicationId: initialData.applicationId || undefined,
                  description: initialData.description ?? '',
                  conversionGroupId: initialData.conversionGroupId ?? null,
                  banksGroupId: initialData.banksGroupId ?? null,
                  entries: initialData.entries.map((e) => ({
                      wallet: e.wallet,
                      direction: e.direction,
                      amount: e.amount,
                  })),
                  creatureDate: initialData.createdAt,
              }
            : {
                  typeId: '',
                  applicationId: prefilledApplicationId,
                  description: '',
                  conversionGroupId: null,
                  banksGroupId: null,
                  entries: [],
                  creatureDate: undefined,
              },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'entries',
    });

    const entries = form.watch('entries');
    const creatureDateValue = form.watch('creatureDate');

    const normalizeDate = React.useCallback(
        (value: Date) => new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())),
        [],
    );

    const parseDateValue = React.useCallback((value?: string) => {
        if (!value) return null;
        if (value.includes('T')) {
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        const parts = value.split('.');
        if (parts.length === 3) {
            const [dd, mm, yyyy] = parts.map(Number);
            const parsed = new Date(Date.UTC(yyyy, mm - 1, dd));
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        return null;
    }, []);

    const lockedPeriods = lockedPeriodsData?.lockedPeriods;
    const lockedPeriodForDate = React.useMemo(() => {
        const periods = lockedPeriods ?? [];
        if (isEditing || !periods.length) return null;
        const parsedDate = parseDateValue(creatureDateValue) ?? new Date();
        const dateOnly = normalizeDate(parsedDate);

        return (
            periods.find((period) => {
                if (!period.isActive) return false;
                const dateFrom = new Date(period.dateFrom);
                const dateTo = new Date(period.dateTo);
                if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) return false;
                const fromOnly = normalizeDate(dateFrom);
                const toOnly = normalizeDate(dateTo);
                return dateOnly >= fromOnly && dateOnly <= toOnly;
            }) ?? null
        );
    }, [creatureDateValue, isEditing, lockedPeriods, normalizeDate, parseDateValue]);

    const isCreateBlocked = Boolean(lockedPeriodForDate);

    const formatRange = (dateFrom: string, dateTo: string) => {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const fromLabel = Number.isNaN(from.getTime()) ? '-' : formatDate(from);
        const toLabel = Number.isNaN(to.getTime()) ? '-' : formatDate(to);
        return `${fromLabel} - ${toLabel}`;
    };

    const isBankDisabled =
        !entries.length ||
        !entries.every((entry) => {
            const wallet = wallets?.wallets.find((w) => w.id === entry.wallet?.id);
            return wallet?.walletTypeId === 'dbc78423-dfb0-4ba4-86f4-533bd9efd027';
        });

    const selectedTypeId = form.watch('typeId');
    const selectedOperationType = operationTypes?.find((type) => type.id === selectedTypeId);
    const isCorrection = selectedOperationType?.isCorrection ?? false;
    const isConversion = selectedOperationType?.isConversion ?? false;
    const isSingleSideOperation = selectedOperationType
        ? SINGLE_SIDE_OPERATION_NAMES.has(selectedOperationType.name.trim().toLocaleLowerCase('ru'))
        : false;

    const isCreditAllowed = selectedOperationType?.isCredit ?? false;
    const isDebitAllowed = selectedOperationType?.isDebit ?? false;

    const directions = React.useMemo(() => {
        const result: Array<'credit' | 'debit'> = [];

        if (isCreditAllowed) result.push('credit');
        if (isDebitAllowed) result.push('debit');

        return result;
    }, [isCreditAllowed, isDebitAllowed]);

    React.useEffect(() => {
        if (isCorrection) {
            if (fields.length === 0) {
                append({
                    wallet: { id: '', name: '' },
                    direction: 'debit',
                    amount: 0,
                });
            } else if (fields.length > 1) {
                while (fields.length > 1) {
                    remove(fields.length - 1);
                }
            }
        }
    }, [isCorrection, fields.length, remove, append]);

    const onSubmit = (data: CreateOperationDto) => {
        if (!isEditing && isCreateBlocked) {
            return;
        }

        form.clearErrors('entries');
        if (!isSingleSideOperation) {
            const hasDebitEntry = data.entries.some((entry) => entry.direction === 'debit');
            const hasCreditEntry = data.entries.some((entry) => entry.direction === 'credit');

            if (!hasDebitEntry || !hasCreditEntry) {
                form.setError('entries', {
                    type: 'manual',
                    message: 'Для этого типа операции заполните обе стороны: "Вычесть из..." и "Прибавить к...".',
                });
                return;
            }
        }

        if (!data.creatureDate) {
            data.creatureDate = new Date().toISOString();
        }

        const transformedEntries = data.entries.map((entry) => ({
            walletId: entry.wallet.id,
            direction: entry.direction,
            amount: entry.amount,
        }));

        const payload: CreateOperationBackendDto = {
            typeId: data.typeId,
            ...(data.applicationId && data.applicationId > 0 && { applicationId: data.applicationId }),
            description: data.description ?? null,
            ...(data.conversionGroupId && {
                conversionGroupId: data.conversionGroupId,
            }),
            entries: transformedEntries,
            creatureDate: data.creatureDate,
            banksGroupId: isBankDisabled ? null : data.banksGroupId,
        };

        if (initialData) {
            const mergedEntries = data.entries.map((entry) => {
                const oldEntry = initialData.entries.find(
                    (e) => e.wallet.id === entry.wallet.id && e.direction === entry.direction,
                );

                if (oldEntry) {
                    return {
                        id: oldEntry.id,
                        walletId: entry.wallet.id,
                        direction: entry.direction,
                        amount: entry.amount,
                    };
                } else {
                    return {
                        walletId: entry.wallet.id,
                        direction: entry.direction,
                        amount: entry.amount,
                    };
                }
            });

            const updatePayload: { id: string } & UpdateOperationBackendDto = {
                id: initialData.id,
                typeId: data.typeId,
                ...(data.applicationId && data.applicationId > 0 && { applicationId: data.applicationId }),
                creatureDate: data.creatureDate,
                description: data.description ?? null,
                ...(data.conversionGroupId !== undefined && {
                    conversionGroupId: data.conversionGroupId,
                }),
                entries: mergedEntries,
                banksGroupId: isBankDisabled ? null : data.banksGroupId,
            };

            updateMutation.mutate(updatePayload);
        } else {
            createMutation.mutate(payload, {
                onSuccess: async () => {
                    if (shouldCompleteApplicationOnCreate && data.applicationId && data.applicationId > 0) {
                        try {
                            await updateStatusMutation.mutateAsync({
                                id: String(data.applicationId),
                                status: 'done',
                            });
                        } catch {
                            // Ошибка обновления статуса уже обработана в мутации
                        }
                    }

                    router.push(ROUTER_MAP.OPERATIONS);
                },
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn('flex flex-col gap-6', className)} {...props}>
                {!isEditing && lockedPeriodForDate && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        Создание операций запрещено в период{' '}
                        {formatRange(lockedPeriodForDate.dateFrom, lockedPeriodForDate.dateTo)}.
                    </div>
                )}
                <div className={cn('grid grid-cols-1 gap-4', isConversion ? 'md:grid-cols-2' : 'md:grid-cols-3')}>
                    {/* Тип операции */}
                    {/* isDebit - {isDebit ? 'true' : 'false'}, isCredit -{' '}
          {isCredit ? 'true' : 'false'} */}
                    <FormField
                        control={form.control}
                        name="typeId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Тип операции <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        if (!isEditing) {
                                            form.setValue('entries', []);
                                        }
                                    }}
                                    value={field.value || ''}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выберите" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {isOperationTypesLoading && (
                                            <SelectItem value="loading" disabled>
                                                Загрузка...
                                            </SelectItem>
                                        )}
                                        {operationTypes
                                            ?.slice()
                                            .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
                                            .map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    {/* Заявка */}
                    <FormField
                        control={form.control}
                        name="applicationId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Заявка:</FormLabel>
                                {isApplicationsLoading ? (
                                    <Skeleton className="h-8" />
                                ) : (
                                    <Select
                                        onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                                        value={field.value ? String(field.value) : ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Не выбрано" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableApplications?.map((app) => (
                                                <SelectItem key={app.id} value={String(app.id)}>
                                                    #{app.id} - {app.amount} {app.currency.code}
                                                    {app.status === 'done' && ' (завершена)'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </FormItem>
                        )}
                    />
                    {/* Номер конвертации - только для типа "Конвертация" */}
                    {isConversion && (
                        <>
                            <FormField
                                control={form.control}
                                name="conversionGroupId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Номер конвертации <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Введите номер"
                                                required
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value ? Number(value) : null);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`banksGroupId`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>
                                            Банк <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value?.toString() || ''}
                                            disabled={isBankDisabled}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Выберите банк" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {banks?.banks.map((bank) => (
                                                    <SelectItem key={bank.id} value={bank.id}>
                                                        {bank.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                    {/* Дата */}
                    <FormField
                        control={form.control}
                        name="creatureDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Дата операции</FormLabel>
                                <div className="relative flex gap-2">
                                    <FormControl>
                                        <Input
                                            value={rawInput}
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

                                                setRawInput(formatted);

                                                const parts = formatted.split('.');
                                                if (parts.length === 3) {
                                                    const [dd, mm, yyyy] = parts.map(Number);
                                                    const parsed = new Date(Date.UTC(yyyy, mm - 1, dd));
                                                    if (!isNaN(parsed.getTime())) {
                                                        field.onChange(parsed.toISOString());
                                                        return;
                                                    }
                                                }

                                                field.onChange(formatted);
                                            }}
                                        />
                                    </FormControl>
                                    <Popover open={open} onOpenChange={setOpen}>
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
                                                        // Создаем дату в UTC из выбранного дня, чтобы избежать смещения часовых поясов
                                                        const utcDate = new Date(
                                                            Date.UTC(
                                                                date.getFullYear(),
                                                                date.getMonth(),
                                                                date.getDate(),
                                                            ),
                                                        );
                                                        field.onChange(utcDate.toISOString());
                                                        setRawInput(formatDate(date));
                                                    }
                                                    setOpen(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Entries */}
                {isCorrection ? (
                    // Для корректировки - одна строка: кошелек + сумма корректировки
                    <div className="flex flex-col gap-3 mt-2">
                        {fields.map((item, realIndex) => (
                            <div key={item.id} className="flex gap-3 items-end">
                                <FormField
                                    control={form.control}
                                    name={`entries.${realIndex}.wallet.id`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>
                                                Кошелек <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
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
                                                            onChange={(e) => setWalletSearch(e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    {wallets?.wallets
                                                        ?.filter((wallet) => {
                                                            const matchesSearch = wallet.name
                                                                .toLowerCase()
                                                                .includes(walletSearch.toLowerCase());
                                                            const isSelectable =
                                                                wallet.active && wallet.visible && !wallet.deleted;
                                                            const isSelected = wallet.id === field.value;
                                                            return (
                                                                matchesSearch &&
                                                                (isEditing ? isSelectable || isSelected : isSelectable)
                                                            );
                                                        })
                                                        .map((wallet) => (
                                                            <SelectItem key={wallet.id} value={wallet.id}>
                                                                {wallet.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Скрытое поле направления - всегда credit для корректировки */}
                                <FormField
                                    control={form.control}
                                    name={`entries.${realIndex}.direction`}
                                    render={({ field }) => <input type="hidden" {...field} value="credit" />}
                                />

                                <FormField
                                    control={form.control}
                                    name={`entries.${realIndex}.amount`}
                                    render={({ field }) => (
                                        <FormItem className="w-[280px]">
                                            <FormLabel>
                                                Сумма <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    value={
                                                        typeof field.value === 'number' && field.value !== 0
                                                            ? formatNumber(field.value)
                                                            : field.value === 0
                                                              ? '0'
                                                              : ''
                                                    }
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || value === null) {
                                                            field.onChange('');
                                                            return;
                                                        }
                                                        const parsed = parseFormattedNumber(value);
                                                        field.onChange(isNaN(parsed) ? '' : parsed);
                                                    }}
                                                    onFocus={() => {
                                                        if (field.value === 0) {
                                                            field.onChange('');
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        if (!e.currentTarget.value.trim()) {
                                                            field.onChange(0);
                                                        }
                                                    }}
                                                    placeholder="0"
                                                    inputMode="numeric"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Для обычных операций - две колонки
                    <div className="lg:grid lg:grid-cols-2 gap-4">
                        {directions.map((dir) => (
                            <div key={dir} className="flex flex-col gap-3 mt-2">
                                <div className="lg:flex justify-between items-center">
                                    <p className="font-medium">
                                        {dir === 'debit' ? 'Вычесть из...' : 'Прибавить к...'}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() =>
                                            append({
                                                wallet: { id: '', name: '' },
                                                direction: dir as 'credit' | 'debit',
                                                amount: 0,
                                            })
                                        }
                                    >
                                        + Добавить строку
                                    </Button>
                                </div>

                                {fields
                                    .map((item, realIndex) => ({ item, realIndex }))
                                    .filter(({ item }) => item.direction === dir)
                                    .map(({ item, realIndex }) => (
                                        <div key={item.id} className="flex gap-3 items-end">
                                            <FormField
                                                control={form.control}
                                                name={`entries.${realIndex}.wallet.id`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormLabel>
                                                            Кошелек <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value || ''}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="lg:w-[250px] w-full">
                                                                    <SelectValue placeholder="Выберите кошелек" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <div className="px-2 pb-2">
                                                                    <Input
                                                                        placeholder="Поиск кошелька..."
                                                                        value={walletSearch}
                                                                        onChange={(e) =>
                                                                            setWalletSearch(e.target.value)
                                                                        }
                                                                        className="h-8"
                                                                    />
                                                                </div>
                                                                {wallets?.wallets
                                                                    ?.filter((wallet) => {
                                                                        const matchesSearch = wallet.name
                                                                            .toLowerCase()
                                                                            .includes(walletSearch.toLowerCase());
                                                                        const isSelectable =
                                                                            wallet.active &&
                                                                            wallet.visible &&
                                                                            !wallet.deleted;
                                                                        const isSelected = wallet.id === field.value;
                                                                        return (
                                                                            matchesSearch &&
                                                                            (isEditing
                                                                                ? isSelectable || isSelected
                                                                                : isSelectable)
                                                                        );
                                                                    })
                                                                    .map((wallet) => (
                                                                        <SelectItem key={wallet.id} value={wallet.id}>
                                                                            {wallet.name} — {wallet.amount}{' '}
                                                                            {wallet.currency.code}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`entries.${realIndex}.amount`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Сумма <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '' || value === null) {
                                                                        field.onChange('');
                                                                        return;
                                                                    }
                                                                    const numValue = parseFloat(value);
                                                                    field.onChange(isNaN(numValue) ? '' : numValue);
                                                                }}
                                                                onFocus={() => {
                                                                    if (field.value === 0) {
                                                                        field.onChange('');
                                                                    }
                                                                }}
                                                                onBlur={(e) => {
                                                                    if (e.currentTarget.value === '') {
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
                                                onClick={() => remove(realIndex)}
                                                className="text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                )}

                {/* Описание */}
                {typeof form.formState.errors.entries?.message === 'string' && (
                    <p className="text-sm text-destructive">{form.formState.errors.entries.message}</p>
                )}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Описание</FormLabel>
                            <FormControl>
                                <Textarea className="w-full h-[50px]" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || (!isEditing && isCreateBlocked)}
                >
                    {isEditing
                        ? updateMutation.isPending
                            ? 'Сохранение...'
                            : 'Сохранить изменения'
                        : createMutation.isPending
                          ? 'Создание...'
                          : 'Создать'}
                </Button>
            </form>
        </Form>
    );
}
