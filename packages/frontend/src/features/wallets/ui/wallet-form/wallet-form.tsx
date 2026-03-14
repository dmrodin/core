'use client';

import { useCallback, useEffect, useMemo } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCurrency } from '@/entities/currency/model/use-currency';
import { useNetworkTypes } from '@/entities/network/model/use-network-types';
import { useNetworks } from '@/entities/network/model/use-networks';
import { usePlatforms } from '@/entities/platform';
import { useBanks } from '@/entities/bank';
import { useUsers } from '@/entities/users';
import {
    CreateWalletFormValues,
    CreateWalletRequest,
    CreateWalletSchema,
    UpdateWalletRequest,
    UpdateWalletSchema,
    Wallet,
    WalletKind,
} from '@/entities/wallet';
import { useWalletTypes } from '@/entities/wallet-type';
import { useCreateWallet, useUpdateWallet } from '@/features/wallets';

import {
    findPhoneRule,
    formatByRule,
    formatCardNumber,
    formatNumber,
    normalizeDigits,
    parseFormattedNumber,
} from '@/shared/lib/utils';

import { Button } from '@/shared/ui/shadcn/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../../../../shared/ui/shadcn/form';
import { Input } from '../../../../shared/ui/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/ui/shadcn/select';
import { Switch } from '../../../../shared/ui/shadcn/switch';
import { Textarea } from '../../../../shared/ui/shadcn/textarea';

const WALLET_KIND_LABELS: Record<WalletKind, string> = {
    [WalletKind.simple]: 'Касса',
    [WalletKind.crypto]: 'Криптовалютный',
    [WalletKind.bank]: 'Банковский',
};

interface WalletFormProps {
    initialData?: Wallet;
    walletId?: string;
}

const EditWalletFormSchema = UpdateWalletSchema.extend({
    amount: z.coerce.number().int('Сумма должна быть целым числом'),
});

export function WalletForm({ initialData, walletId }: WalletFormProps) {
    const isEditMode = !!walletId && !!initialData;
    const createWalletMutation = useCreateWallet();
    const updateWalletMutation = useUpdateWallet(walletId ?? '');
    const { data: currenciesData, isLoading: isCurrenciesLoading } = useCurrency();
    const { data: networksData, isLoading: isNetworksLoading } = useNetworks();
    const { data: walletTypesData, isLoading: isWalletTypesLoading } = useWalletTypes();
    const { data: platformsData, isLoading: isPlatformsLoading } = usePlatforms();
    const { data: banksData, isLoading: isBanksLoading } = useBanks();
    const { data: usersData } = useUsers();

    const form = useForm<CreateWalletFormValues>({
        resolver: zodResolver(isEditMode ? EditWalletFormSchema : CreateWalletSchema),
        defaultValues: initialData
            ? {
                  name: initialData.name,
                  description: initialData.description ?? '',
                  amount: initialData.amount || 0,
                  walletKind: initialData.walletKind || WalletKind.simple,
                  walletTypeId: initialData.walletTypeId || undefined,
                  currencyId: initialData.currencyId,
                  secondUserId: initialData.secondUserId || undefined,
                  active: initialData.active ?? true,
                  pinOnMain: initialData.pinOnMain ?? false,
                  pinned: initialData.pinned ?? false,
                  visible: initialData.visible ?? true,
                  monthlyLimit: initialData.monthlyLimit ?? undefined,
                  details: {
                      phone: initialData.details?.phone ?? '',
                      card: initialData.details?.card ?? '',
                      ownerFullName: initialData.details?.ownerFullName ?? '',
                      address: initialData.details?.address ?? '',
                      accountId: initialData.details?.accountId ?? '',
                      exchangeUid: initialData.details?.exchangeUid ?? '',
                      networkId: initialData.details?.network?.id || '',
                      networkTypeId: initialData.details?.networkType?.id || '',
                      platformId: initialData.details?.platform?.id || '',
                      bankId: initialData.details?.bank?.id || '',
                  },
              }
            : {
                  name: '',
                  description: '',
                  amount: 0,
                  walletKind: WalletKind.simple,
                  walletTypeId: undefined,
                  currencyId: '',
                  secondUserId: undefined,
                  active: true,
                  pinOnMain: false,
                  pinned: false,
                  visible: true,
                  monthlyLimit: undefined,
                  details: {
                      phone: '',
                      card: '',
                      ownerFullName: '',
                      address: '',
                      accountId: '',
                      exchangeUid: '',
                      networkId: '',
                      networkTypeId: '',
                      platformId: '',
                      bankId: '',
                  },
              },
    });

    const walletKind = form.watch('walletKind');
    const selectedNetworkId = form.watch('details.networkId') ?? '';

    const { data: networkTypesData } = useNetworkTypes();

    const currencies = useMemo(() => currenciesData?.currencies ?? [], [currenciesData]);
    const networks = useMemo(() => networksData?.networks ?? [], [networksData]);
    const networkTypes = useMemo(() => {
        const allTypes = networkTypesData?.networkTypes ?? [];
        if (!selectedNetworkId) return allTypes;
        return allTypes.filter((type) => type.networkId === selectedNetworkId);
    }, [networkTypesData, selectedNetworkId]);
    const walletTypes = useMemo(() => walletTypesData?.walletTypes ?? [], [walletTypesData]);
    const platforms = useMemo(() => platformsData?.platforms ?? [], [platformsData]);
    const banks = useMemo(() => banksData?.banks ?? [], [banksData]);

    type WalletDetailsKeys = keyof NonNullable<CreateWalletRequest['details']>;

    const clearDetailFields = useCallback(
        (fields: WalletDetailsKeys[]) => {
            fields.forEach((field) => {
                form.setValue(`details.${field}` as const, undefined, {
                    shouldValidate: false,
                    shouldDirty: false,
                });
            });
        },
        [form],
    );

    useEffect(() => {
        if (walletKind === WalletKind.simple) {
            clearDetailFields([
                'ownerFullName',
                'card',
                'phone',
                'bankId',
                'address',
                'exchangeUid',
                'networkId',
                'networkTypeId',
                'platformId',
            ]);
            return;
        }

        if (walletKind === WalletKind.bank) {
            clearDetailFields(['address', 'exchangeUid', 'networkId', 'networkTypeId', 'platformId']);
            return;
        }

        if (walletKind === WalletKind.crypto) {
            clearDetailFields(['ownerFullName', 'card', 'phone', 'bankId']);
        }
    }, [walletKind, clearDetailFields]);

    const isCrypto = walletKind === WalletKind.crypto;
    const isBank = walletKind === WalletKind.bank;
    useEffect(() => {
        if (!isCrypto) return;

        const firstNetworkTypeId = networkTypes[0]?.id;
        const currentNetworkTypeId = form.getValues('details.networkTypeId') ?? '';

        if (!firstNetworkTypeId) {
            if (currentNetworkTypeId) {
                form.setValue('details.networkTypeId', '', {
                    shouldValidate: true,
                    shouldDirty: false,
                });
            }
            return;
        }

        if (currentNetworkTypeId !== firstNetworkTypeId) {
            form.setValue('details.networkTypeId', firstNetworkTypeId, {
                shouldValidate: true,
                shouldDirty: false,
            });
        }
    }, [isCrypto, networkTypes, form]);

    const onSubmit = (values: CreateWalletFormValues) => {
        const normalizedValues = {
            ...values,
            description: values.description === '' ? ' ' : values.description,
        };
        if (isEditMode && updateWalletMutation) {
            const payload: UpdateWalletRequest = UpdateWalletSchema.parse(
                Object.fromEntries(Object.entries(normalizedValues).filter(([key]) => key !== 'amount')),
            );
            updateWalletMutation.mutate(payload);
        } else {
            const payload: CreateWalletRequest = CreateWalletSchema.parse(normalizedValues);
            createWalletMutation.mutate(payload);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Название <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Введите название" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Сумма <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={isEditMode}
                                        value={
                                            typeof field.value === 'number'
                                                ? formatNumber(field.value)
                                                : String(field.value || '')
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const parsed = parseFormattedNumber(value);
                                            field.onChange(isNaN(parsed) ? 0 : parsed);
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

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Описание</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Добавьте краткое описание"
                                    {...field}
                                    value={field.value ?? ''}
                                    rows={4}
                                />
                            </FormControl>
                            <FormDescription>Не обязательно, до 2000 символов.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="monthlyLimit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Месячный лимит</FormLabel>
                                <FormControl>
                                    <Input
                                        value={typeof field.value === 'number' ? formatNumber(field.value) : ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '') {
                                                field.onChange(undefined);
                                                return;
                                            }
                                            const parsed = parseFormattedNumber(value);
                                            field.onChange(isNaN(parsed) ? undefined : parsed);
                                        }}
                                        placeholder="Не установлен"
                                        inputMode="numeric"
                                    />
                                </FormControl>
                                <FormDescription>Лимит на сумму всех операций за месяц</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="secondUserId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Второй владелец (опционально)</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(val === 'none' ? undefined : val)}
                                    value={field.value || 'none'}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выберите второго владельца" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">Не выбран</SelectItem>
                                        {usersData?.users
                                            ?.filter((user) => user.isHolder)
                                            .map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.username}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>Выберите второго держателя кошелька, если требуется</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="walletKind"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Вид кошелька <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выберите вид" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(WalletKind).map((kind) => (
                                            <SelectItem key={kind} value={kind}>
                                                {WALLET_KIND_LABELS[kind]}
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
                        name="walletTypeId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Тип кошелька</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                                    value={field.value || 'none'}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">Не выбрано</SelectItem>
                                        {isWalletTypesLoading && (
                                            <SelectItem value="loading" disabled>
                                                Загрузка...
                                            </SelectItem>
                                        )}
                                        {walletTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
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
                        name="currencyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Валюта <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выберите валюту" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {isCurrenciesLoading && (
                                            <SelectItem value="loading" disabled>
                                                Загрузка...
                                            </SelectItem>
                                        )}
                                        {currencies.map((currency) => (
                                            <SelectItem key={currency.id} value={currency.id}>
                                                {currency.code} — {currency.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {isBank && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="details.ownerFullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Владелец карты</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ФИО владельца" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="details.card"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Номер карты</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={formatCardNumber(field.value)}
                                            onChange={(e) => {
                                                const digitsOnly = e.target.value.replace(/[^\d]/g, '').slice(0, 16);
                                                field.onChange(digitsOnly);
                                            }}
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            inputMode="numeric"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="details.phone"
                            render={({ field }) => {
                                const rule = findPhoneRule(field.value ?? '');
                                return (
                                    <FormItem>
                                        <FormLabel>Телефон</FormLabel>
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

                        <FormField
                            control={form.control}
                            name="details.bankId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Банк</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                                        value={field.value || 'none'}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Выберите банк" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Не выбрано</SelectItem>
                                            {isBanksLoading && (
                                                <SelectItem value="loading" disabled>
                                                    Загрузка...
                                                </SelectItem>
                                            )}
                                            {banks.map((bank) => (
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
                    </div>
                )}

                {isCrypto && (
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="details.address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Адрес кошелька <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Введите адрес кошелька"
                                                {...field}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="details.exchangeUid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>UID биржи</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Идентификатор на бирже"
                                                {...field}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-1">
                            <FormField
                                control={form.control}
                                name="details.networkId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Сеть <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                form.setValue('details.networkTypeId', '');
                                            }}
                                            value={field.value ?? ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Выберите сеть" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isNetworksLoading && (
                                                    <SelectItem value="loading" disabled>
                                                        Загрузка...
                                                    </SelectItem>
                                                )}
                                                {networks.map((network) => (
                                                    <SelectItem key={network.id} value={network.id}>
                                                        {network.code} — {network.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="details.platformId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Платформа</FormLabel>
                                        <Select
                                            onValueChange={(value) =>
                                                field.onChange(value === 'none' ? undefined : value)
                                            }
                                            value={field.value || 'none'}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Выберите платформу" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">Не выбрано</SelectItem>
                                                {isPlatformsLoading && (
                                                    <SelectItem value="loading" disabled>
                                                        Загрузка...
                                                    </SelectItem>
                                                )}
                                                {platforms.map((platform) => (
                                                    <SelectItem key={platform.id} value={platform.id}>
                                                        {platform.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="pinOnMain"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Закрепить на главной</FormLabel>
                                    <FormDescription>Отображать в быстром доступе.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pinned"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Закреплённый кошелек</FormLabel>
                                    <FormDescription>Отмечать как избранный.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:justify-end">
                    <Button
                        type="submit"
                        className="md:w-fit"
                        disabled={createWalletMutation.isPending || updateWalletMutation?.isPending}
                    >
                        {isEditMode
                            ? updateWalletMutation?.isPending
                                ? 'Сохранение...'
                                : 'Сохранить изменения'
                            : createWalletMutation.isPending
                              ? 'Создание...'
                              : 'Создать кошелек'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
