'use client';

import React from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import { ApplicationService, useApplicationsList, useUpdateStatusApplication } from '@/entities/application';
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
import { useInfiniteWallets } from '@/entities/wallet';
import type { Wallet as WalletEntity } from '@/entities/wallet';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';

const EXPENSE_OPERATION_TYPE_CODE = 'expense';
const EXPENSE_CATEGORY_OPTIONS = [
    { value: 'salary', label: 'Заработная плата' },
    { value: 'other', label: 'Иные расходы' },
] as const;
const INSKESH_WALLET_TYPE_ID = 'dbc78423-dfb0-4ba4-86f4-533bd9efd027';
const INSKESH_WALLET_TYPE_CODES = new Set(['inskech', 'inscash']);
const INSKESH_WALLET_TYPE_NAMES = new Set(['инскеш']);

export function OperationForm({
    initialData,
    className,
    ...props
}: { initialData?: OperationResponseDto } & React.ComponentProps<'form'>) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((state) => state.user);
    const canLoadOperationsReferences = Boolean(user);
    const canLoadApplications = Boolean(user);
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
    const [walletSearchDebounced, setWalletSearchDebounced] = React.useState('');
    const [walletSearchSide, setWalletSearchSide] = React.useState<'top' | 'bottom'>('bottom');
    const [walletSelectOpen, setWalletSelectOpen] = React.useState(false);
    // Key of the currently open wallet select (entryIndex or 'correction')
    const [openWalletKey, setOpenWalletKey] = React.useState<string | null>(null);
    const walletSearchFocusedRef = React.useRef(false);
    const walletSearchInputRef = React.useRef<HTMLInputElement | null>(null);
    const selectedWalletsCache = React.useRef<Map<string, WalletEntity>>(new Map());

    React.useEffect(() => {
        const id = setTimeout(() => {
            setWalletSearchDebounced(walletSearch.trim());
        }, 300);
        return () => clearTimeout(id);
    }, [walletSearch]);

    const {
        data: walletsData,
        fetchNextPage: fetchNextWalletsPage,
        hasNextPage: hasNextWalletsPage,
        isFetchingNextPage: isFetchingNextWalletsPage,
    } = useInfiniteWallets(
        {
            search: walletSearchDebounced || undefined,
            searchByName: true,
            includeTabWalletTypes: true,
            active: true,
            visible: true,
            deleted: false,
        },
        50,
        canLoadOperationsReferences,
    );
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
                  expenseCategory: initialData.expenseCategory ?? null,
                  conversionGroupId: initialData.conversionGroupId ?? null,
                  banksGroupId: initialData.banksGroupId ?? null,
                  entries: initialData.entries.map((e) => ({
                      id: e.id,
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
                  expenseCategory: null,
                  conversionGroupId: null,
                  banksGroupId: null,
                  entries: [],
                  creatureDate: undefined,
              },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'entries',
        keyName: 'fieldId',
    });

    const entries = form.watch('entries');
    const creatureDateValue = form.watch('creatureDate');

    const normalizeDate = React.useCallback(
        (value: Date) => new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())),
        [],
    );

    const getDayKey = React.useCallback((value: Date) => {
        const year = value.getFullYear();
        const month = value.getMonth() + 1;
        const day = value.getDate();
        return year * 10000 + month * 100 + day;
    }, []);

    const todayDayKey = React.useMemo(() => getDayKey(new Date()), [getDayKey]);

    const makeUtcNoonIso = React.useCallback(
        (year: number, month: number, day: number) =>
            new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).toISOString(),
        [],
    );

    const formatDateInput = React.useCallback((year: number, month: number, day: number) => {
        const dd = String(day).padStart(2, '0');
        const mm = String(month).padStart(2, '0');
        return `${dd}.${mm}.${year}`;
    }, []);

    const parseDateParts = React.useCallback((value?: string) => {
        if (!value) return null;
        if (value.includes('T')) {
            const datePart = value.slice(0, 10);
            const [yyyy, mm, dd] = datePart.split('-').map(Number);
            if (!yyyy || !mm || !dd) return null;
            return { year: yyyy, month: mm, day: dd };
        }

        const parts = value.split('.');
        if (parts.length === 3) {
            const [dd, mm, yyyy] = parts.map(Number);
            if (!yyyy || !mm || !dd) return null;
            return { year: yyyy, month: mm, day: dd };
        }

        return null;
    }, []);

    const parseDateValue = React.useCallback(
        (value?: string) => {
            const parts = parseDateParts(value);
            if (!parts) return null;
            const parsed = new Date(parts.year, parts.month - 1, parts.day);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        },
        [parseDateParts],
    );

    const isFutureDate = React.useCallback(
        (value?: string) => {
            const parts = parseDateParts(value);
            if (!parts) return false;
            const key = parts.year * 10000 + parts.month * 100 + parts.day;
            return key > todayDayKey;
        },
        [parseDateParts, todayDayKey],
    );

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

    const isInskeshWallet = (wallet: WalletEntity | undefined) => {
        if (!wallet) {
            return false;
        }

        if (wallet.walletTypeId === INSKESH_WALLET_TYPE_ID) {
            return true;
        }

        const walletType = wallet.walletType;
        if (!walletType || typeof walletType === 'string') {
            return false;
        }

        const code = walletType.code?.trim().toLowerCase();
        const name = walletType.name?.trim().toLowerCase();

        return INSKESH_WALLET_TYPE_CODES.has(code) || INSKESH_WALLET_TYPE_NAMES.has(name);
    };

    const walletsList = React.useMemo(() => {
        const list = walletsData?.pages.flatMap((page) => page.wallets) ?? [];
        const byId = new Map<string, WalletEntity>();
        for (const wallet of list) {
            byId.set(wallet.id, wallet);
        }
        for (const entry of entries) {
            const wallet = entry.wallet;
            if (wallet?.id && !byId.has(wallet.id)) {
                // Use cached full wallet data (with amount/currency) if available
                const cached = selectedWalletsCache.current.get(wallet.id);
                byId.set(wallet.id, (cached ?? wallet) as WalletEntity);
            }
        }
        return Array.from(byId.values());
    }, [walletsData, entries]);

    const handleWalletsScroll = React.useCallback(
        (event: React.UIEvent<HTMLDivElement>) => {
            if (!hasNextWalletsPage || isFetchingNextWalletsPage) return;
            const target = event.currentTarget;
            const threshold = 80;
            if (target.scrollHeight - target.scrollTop - target.clientHeight <= threshold) {
                fetchNextWalletsPage();
            }
        },
        [fetchNextWalletsPage, hasNextWalletsPage, isFetchingNextWalletsPage],
    );

    const updateWalletSearchSide = React.useCallback(() => {
        if (walletSearchFocusedRef.current) return;
        const content = document.querySelector(
            '[data-slot="select-content"][data-wallet-select="wallet"][data-state="open"]',
        ) as HTMLElement | null;
        const side = content?.getAttribute('data-side');
        if (side === 'top' || side === 'bottom') {
            setWalletSearchSide(side);
        }
    }, []);

    const makeWalletOpenChangeHandler = React.useCallback(
        (key: string) => (isOpen: boolean) => {
            if (!isOpen) {
                // Block close while search input is focused (mobile keyboard opening)
                if (walletSearchFocusedRef.current) return;
                setWalletSelectOpen(false);
                setOpenWalletKey(null);
                return;
            }
            setWalletSearch('');
            setWalletSearchDebounced('');
            setWalletSelectOpen(true);
            setOpenWalletKey(key);
            setTimeout(updateWalletSearchSide, 0);
        },
        [updateWalletSearchSide],
    );

    React.useEffect(() => {
        if (!walletSelectOpen) return;
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        if (isTouchDevice) return;
        const id = window.setTimeout(() => {
            walletSearchInputRef.current?.focus();
        }, 0);
        return () => window.clearTimeout(id);
    }, [walletSelectOpen, walletSearchSide]);

    React.useEffect(() => {
        if (!walletSelectOpen) return;

        const getContent = () =>
            document.querySelector(
                '[data-slot="select-content"][data-wallet-select="wallet"][data-state="open"]',
            ) as HTMLElement | null;

        // Try to read the initial side; retry a few times until content is in the DOM
        let rafId = 0;
        let tries = 0;
        const tick = () => {
            const content = getContent();
            if (content) {
                updateWalletSearchSide();
                // Once found, set the side and stop — no ongoing listeners needed
                updateWalletSearchSide();
                cleanupRef.current = () => {};
                return;
            }
            tries += 1;
            if (tries < 10) {
                rafId = window.requestAnimationFrame(tick);
            }
        };
        const cleanupRef = { current: () => {} };
        rafId = window.requestAnimationFrame(tick);

        return () => {
            if (rafId) window.cancelAnimationFrame(rafId);
            cleanupRef.current();
        };
    }, [updateWalletSearchSide, walletSelectOpen]);

    const renderWalletSearch = React.useCallback(
        (position: 'top' | 'bottom') => (
            <div
                data-slot="wallet-search"
                className={cn(
                    'bg-popover px-2 py-2',
                    position === 'top' ? 'border-b border-border/40' : 'border-t border-border/40',
                )}
            >
                <Input
                    placeholder="Поиск кошелька..."
                    value={walletSearch}
                    onChange={(e) => setWalletSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    onFocus={() => {
                        walletSearchFocusedRef.current = true;
                    }}
                    onBlur={() => {
                        walletSearchFocusedRef.current = false;
                    }}
                    ref={walletSearchInputRef}
                    className="h-8"
                />
            </div>
        ),
        [walletSearch],
    );

    const selectedWallets = entries
        .map((entry) => walletsList.find((w) => w.id === entry.wallet?.id))
        .filter((wallet): wallet is NonNullable<typeof wallet> => Boolean(wallet));

    const areAllSelectedWalletsInskesh =
        selectedWallets.length >= 2 && selectedWallets.every((wallet) => isInskeshWallet(wallet));

    const selectedTypeId = form.watch('typeId');
    const selectedOperationType = operationTypes?.find((type) => type.id === selectedTypeId);
    const isExpenseType = selectedOperationType?.code === EXPENSE_OPERATION_TYPE_CODE;
    const isCorrection = selectedOperationType?.isCorrection ?? false;
    const isConversion = selectedOperationType?.isConversion ?? false;
    const isBankRequired = isConversion && areAllSelectedWalletsInskesh;
    const isBankDisabled = !isBankRequired;
    const isConversionNumberRequired = isConversion && areAllSelectedWalletsInskesh;
    const isCreditAllowed = selectedOperationType?.isCredit ?? false;
    const isDebitAllowed = selectedOperationType?.isDebit ?? false;
    const isAvans = selectedOperationType?.isAvans ?? false;
    const isSingleSideOperation = selectedOperationType ? isCreditAllowed !== isDebitAllowed : false;

    const directions = React.useMemo(() => {
        const result: Array<'credit' | 'debit'> = [];

        if (isDebitAllowed) result.push('debit');
        if (isCreditAllowed) result.push('credit');

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

    // При редактировании корректировки подставляем желаемый баланс (after) вместо дельты (amount)
    React.useEffect(() => {
        if (!isEditing || !isCorrection || !initialData) return;
        const entry = initialData.entries[0];
        if (entry?.after != null) {
            form.setValue('entries.0.amount', entry.after);
        }
    }, [isEditing, isCorrection, initialData, form]);

    React.useEffect(() => {
        if (isCorrection) return;
        if (!isDebitAllowed || !isCreditAllowed) return;
        const currentEntries = form.getValues('entries') ?? [];
        if (currentEntries.length > 0) return;
        form.setValue(
            'entries',
            [
                { wallet: { id: '', name: '' }, direction: 'debit', amount: 0 },
                { wallet: { id: '', name: '' }, direction: 'credit', amount: 0 },
            ],
            { shouldDirty: true, shouldValidate: true },
        );
    }, [form, isCorrection, isDebitAllowed, isCreditAllowed]);

    React.useEffect(() => {
        if (isCorrection) return;
        if (isDebitAllowed === isCreditAllowed) return;

        const allowedDirection: 'debit' | 'credit' = isDebitAllowed ? 'debit' : 'credit';
        const currentEntries = form.getValues('entries') ?? [];
        if (currentEntries.length === 0) {
            form.setValue('entries', [{ wallet: { id: '', name: '' }, direction: allowedDirection, amount: 0 }], {
                shouldDirty: true,
                shouldValidate: true,
            });
            return;
        }

        const allowedEntries = currentEntries.filter((entry) => entry.direction === allowedDirection);
        const baseEntries = allowedEntries.length > 0 ? allowedEntries : currentEntries;
        const nextEntries = baseEntries.map((entry) => ({
            ...entry,
            direction: allowedDirection,
        }));

        const needsUpdate =
            nextEntries.length !== currentEntries.length ||
            currentEntries.some((entry) => entry.direction !== allowedDirection);

        if (needsUpdate) {
            form.setValue('entries', nextEntries, { shouldDirty: true, shouldValidate: true });
        }
    }, [form, isCorrection, isDebitAllowed, isCreditAllowed]);

    React.useEffect(() => {
        if (isBankDisabled) {
            form.setValue('banksGroupId', null);
            form.clearErrors('banksGroupId');
        }
    }, [form, isBankDisabled]);

    React.useEffect(() => {
        if (!isExpenseType) {
            form.setValue('expenseCategory', null);
            form.clearErrors('expenseCategory');
        }
    }, [form, isExpenseType]);

    const onSubmit = (data: CreateOperationDto) => {
        if (!isEditing && isCreateBlocked) {
            return;
        }

        form.clearErrors('entries');
        form.clearErrors('banksGroupId');
        form.clearErrors('expenseCategory');
        form.clearErrors('conversionGroupId');

        if (isConversionNumberRequired && !data.conversionGroupId) {
            form.setError('conversionGroupId', {
                type: 'manual',
                message: 'Укажите номер конвертации',
            });
            return;
        }

        if (isExpenseType && !data.expenseCategory) {
            form.setError('expenseCategory', {
                type: 'manual',
                message: 'Выберите статью расхода',
            });
            return;
        }

        if (isBankRequired && !data.banksGroupId) {
            form.setError('banksGroupId', {
                type: 'manual',
                message: 'Выберите банк для конвертации между кошельками Инскеш.',
            });
            return;
        }

        if (!isSingleSideOperation && !isAvans && !isCorrection) {
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
            expenseCategory: isExpenseType ? (data.expenseCategory ?? null) : null,
            conversionGroupId: isBankDisabled ? null : (data.conversionGroupId ?? null),
            entries: transformedEntries,
            creatureDate: data.creatureDate,
            banksGroupId: isBankDisabled ? null : data.banksGroupId,
        };

        if (initialData) {
            const updatedEntries = data.entries.map((entry) => ({
                ...(entry.id && { id: entry.id }),
                walletId: entry.wallet.id,
                direction: entry.direction,
                amount: entry.amount,
            }));

            const updatePayload: { id: string } & UpdateOperationBackendDto = {
                id: initialData.id,
                typeId: data.typeId,
                ...(data.applicationId && data.applicationId > 0 && { applicationId: data.applicationId }),
                creatureDate: data.creatureDate,
                description: data.description ?? null,
                expenseCategory: isExpenseType ? (data.expenseCategory ?? null) : null,
                ...(data.conversionGroupId !== undefined && {
                    conversionGroupId: isBankDisabled ? null : (data.conversionGroupId ?? null),
                }),
                entries: updatedEntries,
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
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn('flex flex-col gap-4 sm:gap-6', className)}
                {...props}
            >
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
                                            Номер конвертации{' '}
                                            {isConversionNumberRequired && <span className="text-destructive">*</span>}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Введите номер"
                                                required={isConversionNumberRequired}
                                                disabled={!isConversionNumberRequired}
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
                                            Банк {isBankRequired && <span className="text-destructive">*</span>}
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
                                                    const parsed = new Date(yyyy, mm - 1, dd);
                                                    if (!isNaN(parsed.getTime())) {
                                                        if (getDayKey(parsed) > todayDayKey) {
                                                            form.setError('creatureDate', {
                                                                type: 'manual',
                                                                message: 'Дата операции не может быть в будущем',
                                                            });
                                                            return;
                                                        }
                                                        form.clearErrors('creatureDate');
                                                        field.onChange(makeUtcNoonIso(yyyy, mm, dd));
                                                        setRawInput(formatDateInput(yyyy, mm, dd));
                                                        return;
                                                    }
                                                }

                                                if (isFutureDate(formatted)) {
                                                    form.setError('creatureDate', {
                                                        type: 'manual',
                                                        message: 'Дата операции не может быть в будущем',
                                                    });
                                                } else {
                                                    form.clearErrors('creatureDate');
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
                                                disabled={(date) => getDayKey(date) > todayDayKey}
                                                selected={parseDateValue(field.value) ?? undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        if (getDayKey(date) > todayDayKey) {
                                                            form.setError('creatureDate', {
                                                                type: 'manual',
                                                                message: 'Дата операции не может быть в будущем',
                                                            });
                                                            return;
                                                        }
                                                        form.clearErrors('creatureDate');
                                                        // Создаем дату в UTC из выбранного дня, чтобы избежать смещения часовых поясов
                                                        const year = date.getFullYear();
                                                        const month = date.getMonth() + 1;
                                                        const day = date.getDate();
                                                        field.onChange(makeUtcNoonIso(year, month, day));
                                                        setRawInput(formatDateInput(year, month, day));
                                                    }
                                                    setOpen(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Entries */}
                {isCorrection ? (
                    // Для корректировки - одна строка: кошелек + сумма корректировки
                    <div className="flex flex-col gap-3 mt-2">
                        {fields.map((item, realIndex) => (
                            <div key={item.fieldId} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <FormField
                                    control={form.control}
                                    name={`entries.${realIndex}.wallet.id`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>
                                                Кошелек <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    const found = walletsList?.find((w) => w.id === value);
                                                    if (found) {
                                                        form.setValue(`entries.${realIndex}.wallet.name`, found.name);
                                                        selectedWalletsCache.current.set(value, found);
                                                    }
                                                }}
                                                open={openWalletKey === `correction_${realIndex}`}
                                                onOpenChange={(isOpen) =>
                                                    makeWalletOpenChangeHandler(`correction_${realIndex}`)(isOpen)
                                                }
                                                value={field.value || undefined}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full overflow-hidden">
                                                        {field.value ? (
                                                            <span className="flex-1 min-w-0 truncate">
                                                                {(() => {
                                                                    const w = walletsList?.find(
                                                                        (w) => w.id === field.value,
                                                                    );
                                                                    const name =
                                                                        w?.name ??
                                                                        form.getValues(
                                                                            `entries.${realIndex}.wallet.name`,
                                                                        ) ??
                                                                        '...';
                                                                    return w?.amount !== undefined
                                                                        ? `${name} — ${w.amount} ${w.currency?.code ?? ''}`
                                                                        : name;
                                                                })()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                Выберите кошелек
                                                            </span>
                                                        )}
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent
                                                    data-wallet-select="wallet"
                                                    onScroll={handleWalletsScroll}
                                                    className="min-h-[240px]"
                                                    header={
                                                        walletSearchSide === 'bottom'
                                                            ? renderWalletSearch('top')
                                                            : undefined
                                                    }
                                                    footer={
                                                        walletSearchSide === 'top'
                                                            ? renderWalletSearch('bottom')
                                                            : undefined
                                                    }
                                                >
                                                    {field.value && !walletsList?.find((w) => w.id === field.value) && (
                                                        <SelectItem value={field.value}>
                                                            {form.getValues(`entries.${realIndex}.wallet.name`) ||
                                                                selectedWalletsCache.current.get(field.value)?.name ||
                                                                field.value}
                                                        </SelectItem>
                                                    )}
                                                    {walletsList?.map((wallet) => (
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
                                        <FormItem className="w-full sm:w-[280px]">
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
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">
                                        {dir === 'credit'
                                            ? 'Прибавить к...'
                                            : isAvans
                                              ? 'Зачислить к...'
                                              : 'Вычесть из...'}
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
                                        <div key={item.fieldId} className="flex flex-row items-end gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`entries.${realIndex}.wallet.id`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1 min-w-0">
                                                        <FormLabel className="hidden sm:block">
                                                            Кошелек <span className="text-destructive">*</span>
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                const found = walletsList?.find((w) => w.id === value);
                                                                if (found) {
                                                                    form.setValue(
                                                                        `entries.${realIndex}.wallet.name`,
                                                                        found.name,
                                                                    );
                                                                    selectedWalletsCache.current.set(value, found);
                                                                }
                                                            }}
                                                            open={openWalletKey === `normal_${realIndex}`}
                                                            onOpenChange={(isOpen) =>
                                                                makeWalletOpenChangeHandler(`normal_${realIndex}`)(
                                                                    isOpen,
                                                                )
                                                            }
                                                            value={field.value || undefined}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full overflow-hidden">
                                                                    {field.value ? (
                                                                        <span className="flex-1 min-w-0 truncate">
                                                                            {(() => {
                                                                                const inList = walletsList?.find(
                                                                                    (w) => w.id === field.value,
                                                                                );
                                                                                const cached =
                                                                                    selectedWalletsCache.current.get(
                                                                                        field.value,
                                                                                    );
                                                                                const w = inList ?? cached;
                                                                                const name =
                                                                                    w?.name ??
                                                                                    form.getValues(
                                                                                        `entries.${realIndex}.wallet.name`,
                                                                                    ) ??
                                                                                    '...';
                                                                                return w
                                                                                    ? `${name} — ${w.amount ?? ''} ${w.currency?.code ?? ''}`.trimEnd()
                                                                                    : name;
                                                                            })()}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">
                                                                            Кошелек
                                                                        </span>
                                                                    )}
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent
                                                                data-wallet-select="wallet"
                                                                onScroll={handleWalletsScroll}
                                                                className="min-h-[240px]"
                                                                header={
                                                                    walletSearchSide === 'bottom'
                                                                        ? renderWalletSearch('top')
                                                                        : undefined
                                                                }
                                                                footer={
                                                                    walletSearchSide === 'top'
                                                                        ? renderWalletSearch('bottom')
                                                                        : undefined
                                                                }
                                                            >
                                                                {field.value &&
                                                                    !walletsList?.find((w) => w.id === field.value) && (
                                                                        <SelectItem value={field.value}>
                                                                            {form.getValues(
                                                                                `entries.${realIndex}.wallet.name`,
                                                                            ) ||
                                                                                selectedWalletsCache.current.get(
                                                                                    field.value,
                                                                                )?.name ||
                                                                                field.value}
                                                                        </SelectItem>
                                                                    )}
                                                                {walletsList?.map((wallet) => (
                                                                    <SelectItem key={wallet.id} value={wallet.id}>
                                                                        {wallet.name} — {wallet.amount}{' '}
                                                                        {wallet.currency?.code ?? ''}
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
                                                name={`entries.${realIndex}.amount`}
                                                render={({ field }) => (
                                                    <FormItem className="w-24 shrink-0">
                                                        <FormLabel className="hidden sm:block">
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
                                                                className="w-full [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                                                className="shrink-0 text-destructive hover:bg-destructive/10"
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
                {isExpenseType && (
                    <FormField
                        control={form.control}
                        name="expenseCategory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Статья расхода <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выберите статью" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {EXPENSE_CATEGORY_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
