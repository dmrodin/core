'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Wallet as WalletIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import {
    BankWalletCard,
    CryptoWalletCard,
    GetWalletsFilter,
    GetWalletsFilterSchema,
    Wallet,
    SimpleWalletCard,
    SortOrder,
    WalletSortField,
    useInfiniteWallets,
} from '@/entities/wallet';
import { UserRole } from '@/entities/users/model/user-schemas';
import { useWalletTypes } from '@/entities/wallet-type';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    Input,
    ROUTER_MAP,
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/shared';

import { WalletsFiltersSheet } from '../../../features/wallets/ui/wallet-filters/wallets-filters-sheet';
import { WalletsAggregationSwiper } from '../../../features/wallets/ui/wallets-aggregation-swiper/wallets-aggregation-swiper';
import { BulkActionsBar } from '../../../features/wallets/ui/bulk-actions-bar';
import { useBulkWalletActions } from '../../../features/wallets/hooks/use-bulk-wallet-actions';

const baseFilters: GetWalletsFilter = {
    search: '',
    balanceStatus: undefined,
    walletKind: undefined,
    walletTypeId: undefined,
    minAmount: null,
    maxAmount: null,
    currencyId: undefined,
    userId: undefined,
    active: undefined,
    pinned: undefined,
    visible: true,
    deleted: false,
    includeTabWalletTypes: true,
    sortField: WalletSortField.CREATED_AT,
    sortOrder: SortOrder.DESC,
    page: 1,
    limit: 10,
};

export default function WalletsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((state) => state.user);
    const isUserRole = user?.roles?.some((role) => role.code === UserRole.USER) ?? false;
    const { data: walletTypesData } = useWalletTypes();
    const walletTypes = walletTypesData?.walletTypes ?? [];
    const tabTypes = walletTypes.filter((type) => type.showInTabs).sort((a, b) => a.tabOrder - b.tabOrder);

    const form = useForm<GetWalletsFilter>({
        resolver: zodResolver(GetWalletsFilterSchema),
        defaultValues: baseFilters,
    });

    const [isInitialized, setIsInitialized] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedWallets, setSelectedWallets] = useState<Set<string>>(new Set());

    const {
        bulkToggleVisible,
        bulkToggleActive,
        bulkTogglePinned,
        bulkTogglePinOnMain,
        bulkDelete,
        bulkBalanceStatusChange,
    } = useBulkWalletActions();

    useEffect(() => {
        const params: Partial<GetWalletsFilter> = {};

        searchParams.forEach((value, key) => {
            if (key === 'minAmount' || key === 'maxAmount') {
                params[key] = value ? Number(value) : null;
            } else if (key === 'page' || key === 'limit') {
                params[key] = Number(value);
            } else if (key === 'active' || key === 'pinned' || key === 'visible' || key === 'deleted') {
                params[key] = value === 'true';
            } else if (value) {
                const k = key as keyof GetWalletsFilter;
                (params as Record<keyof GetWalletsFilter, unknown>)[k] = value;
            }
        });

        if (Object.keys(params).length > 0) {
            form.reset({ ...baseFilters, ...params });
        }

        setIsInitialized(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        let timeoutId: NodeJS.Timeout;

        const subscription = form.watch((values) => {
            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                const params = new URLSearchParams();

                Object.entries(values).forEach(([key, value]) => {
                    const baseValue = baseFilters[key as keyof GetWalletsFilter];

                    if (value === undefined || value === null || value === '') {
                        return;
                    }

                    if (value === baseValue) {
                        return;
                    }

                    params.set(key, String(value));
                });

                const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
                router.replace(newUrl, { scroll: false });
            }, 300);
        });

        return () => {
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [form, router, isInitialized]);

    const formValues = useWatch({ control: form.control });

    const filteredValues = useMemo(() => {
        if (!formValues) return baseFilters;

        const filtered: Partial<GetWalletsFilter> = {};

        Object.entries(formValues).forEach(([key, value]) => {
            const baseValue = baseFilters[key as keyof GetWalletsFilter];

            if (value === undefined || value === null || value === '') {
                return;
            }

            if (value === baseValue) {
                return;
            }

            const k = key as keyof GetWalletsFilter;
            (filtered as Record<keyof GetWalletsFilter, unknown>)[k] = value;
        });

        const result = {
            ...filtered,
            pinned: formValues.pinned ?? baseFilters.pinned,
            visible: formValues.visible ?? baseFilters.visible,
            deleted: formValues.deleted ?? baseFilters.deleted,
            includeTabWalletTypes: formValues.includeTabWalletTypes ?? baseFilters.includeTabWalletTypes,
            sortField: formValues.sortField || baseFilters.sortField,
            sortOrder: formValues.sortOrder || baseFilters.sortOrder,
            page: formValues.page || baseFilters.page,
            limit: formValues.limit || baseFilters.limit,
        } as GetWalletsFilter;

        return result;
    }, [formValues]);

    const { data: infiniteData, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteWallets(filteredValues);

    const wallets = useMemo(() => infiniteData?.pages.flatMap((page) => page.wallets) || [], [infiniteData]);

    const totalCount = wallets.length;

    const lastWalletRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!lastWalletRef.current || !hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 },
        );

        const node = lastWalletRef.current;
        if (node) observer.observe(node);

        return () => {
            if (node) observer.unobserve(node);
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleSelectAll = () => {
        setSelectionMode(true);
        setSelectedWallets(new Set(wallets.map((w) => w.id)));
    };

    const handleCancelSelectionAll = () => {
        setSelectionMode(false);
        setSelectedWallets(new Set());
    };

    const handleToggleSelection = (walletId: string) => {
        setSelectedWallets((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(walletId)) {
                newSet.delete(walletId);
            } else {
                newSet.add(walletId);
            }
            return newSet;
        });
    };

    const handleEnterSelectionMode = () => {
        setSelectionMode(true);
    };

    const handleCancelSelection = () => {
        setSelectionMode(false);
        setSelectedWallets(new Set());
    };

    const handleBulkAction = (action: (ids: string[], value: boolean) => void, value: boolean) => {
        const ids = Array.from(selectedWallets);
        action(ids, value);
        handleCancelSelection();
    };

    const handleBulkDelete = () => {
        const ids = Array.from(selectedWallets);
        bulkDelete(ids);
        handleCancelSelection();
    };

    const handleBulkBalanceStatusChange = (status: string) => {
        const ids = Array.from(selectedWallets);
        bulkBalanceStatusChange(ids, status);
        handleCancelSelection();
    };

    const renderWalletCard = (wallet: Wallet, index: number) => {
        const isLastWallet = index === wallets.length - 1;
        const commonProps = {
            selectionMode,
            isSelected: selectedWallets.has(wallet.id),
            onSelect: handleToggleSelection,
            onEnterSelectionMode: handleEnterSelectionMode,
            isUserRole,
        };

        const cardElement = (() => {
            switch (wallet.walletKind) {
                case 'crypto':
                    return <CryptoWalletCard wallet={wallet} {...commonProps} />;
                case 'bank':
                    return <BankWalletCard wallet={wallet} {...commonProps} />;
                case 'simple':
                default:
                    return <SimpleWalletCard wallet={wallet} {...commonProps} />;
            }
        })();

        if (isLastWallet) {
            return (
                <div key={wallet.id} ref={lastWalletRef}>
                    {cardElement}
                </div>
            );
        }

        return <div key={wallet.id}>{cardElement}</div>;
    };

    const activeTabValue = isUserRole
        ? formValues?.pinned
            ? 'pinned'
            : formValues?.walletTypeId
              ? formValues.walletTypeId
              : 'all'
        : formValues?.deleted
          ? 'deleted'
          : !formValues?.visible
            ? 'hidden'
            : formValues?.pinned
              ? 'pinned'
              : formValues?.walletTypeId
                ? formValues.walletTypeId
                : 'all';

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24">
            <Card>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="text-2xl">Список кошельков</CardTitle>
                    <div className="flex gap-2 items-center flex-wrap">
                        <Input
                            placeholder="Поиск"
                            value={formValues?.search ?? ''}
                            onChange={(e) => form.setValue('search', e.target.value || undefined)}
                            className="w-full md:w-64"
                        />
                        <WalletsFiltersSheet form={form} baseFilters={baseFilters} />
                        <Button asChild className="md:w-auto">
                            <Link href={ROUTER_MAP.WALLETS_CREATE} className="inline-flex items-center gap-2">
                                <Plus className="size-4" />
                                <span>Создать кошелек</span>
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <WalletsAggregationSwiper filters={filteredValues} />

            <Tabs
                value={activeTabValue}
                onValueChange={(val) => {
                    if (val === 'all') {
                        form.setValue('walletTypeId', undefined);
                        form.setValue('pinned', undefined);
                        form.setValue('visible', true);
                        form.setValue('deleted', false);
                        form.setValue('includeTabWalletTypes', true);
                    } else if (val === 'deleted') {
                        form.setValue('deleted', true);
                        form.setValue('visible', true);
                        form.setValue('pinned', undefined);
                        form.setValue('includeTabWalletTypes', undefined);
                    } else if (val === 'hidden') {
                        form.setValue('visible', false);
                        form.setValue('deleted', false);
                        form.setValue('pinned', false);
                        form.setValue('includeTabWalletTypes', undefined);
                    } else if (val === 'pinned') {
                        form.setValue('pinned', true);
                        form.setValue('visible', true);
                        form.setValue('deleted', false);
                        form.setValue('includeTabWalletTypes', undefined);
                    } else {
                        form.setValue('walletTypeId', val);
                        form.setValue('pinned', false);
                        form.setValue('visible', true);
                        form.setValue('deleted', false);
                        form.setValue('includeTabWalletTypes', undefined);
                    }
                }}
            >
                <div className="w-full overflow-x-auto">
                    <TabsList
                        className="flex w-max min-w-full flex-nowrap md:grid"
                        style={{
                            gridTemplateColumns: `repeat(${(isUserRole ? 2 : 4) + tabTypes.length}, minmax(0, 1fr))`,
                        }}
                    >
                        <TabsTrigger value="pinned" className="w-auto shrink-0 md:w-full">
                            Быстрый доступ
                        </TabsTrigger>
                        <TabsTrigger value="all" className="w-auto shrink-0 md:w-full">
                            Все
                        </TabsTrigger>
                        {tabTypes.map((type) => (
                            <TabsTrigger key={type.id} value={type.id} className="w-auto shrink-0 md:w-full">
                                {type.name}
                            </TabsTrigger>
                        ))}
                        <TabsTrigger value="deleted" className={isUserRole ? 'hidden' : 'w-auto shrink-0 md:w-full'}>
                            Удалённые
                        </TabsTrigger>
                        <TabsTrigger value="hidden" className={isUserRole ? 'hidden' : 'w-auto shrink-0 md:w-full'}>
                            Скрытые
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>

            <div className="space-y-4">
                {wallets.length === 0 && !isFetchingNextPage && (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <WalletIcon />
                            </EmptyMedia>
                            <EmptyContent>
                                <EmptyTitle>Нет кошельков</EmptyTitle>
                                <EmptyDescription>
                                    Кошельки не найдены. Создайте новый кошелек или измените фильтры.
                                </EmptyDescription>
                            </EmptyContent>
                        </EmptyHeader>
                    </Empty>
                )}
                {wallets.map(renderWalletCard)}
            </div>

            <BulkActionsBar
                selectedCount={selectedWallets.size}
                onCancel={handleCancelSelection}
                onToggleVisible={(visible) => handleBulkAction(bulkToggleVisible, visible)}
                onToggleActive={(active) => handleBulkAction(bulkToggleActive, active)}
                onTogglePinned={(pinned) => handleBulkAction(bulkTogglePinned, pinned)}
                onTogglePinOnMain={(pinOnMain) => handleBulkAction(bulkTogglePinOnMain, pinOnMain)}
                onDelete={handleBulkDelete}
                onBalanceStatusChange={handleBulkBalanceStatusChange}
                totalCount={totalCount}
                onSelectAll={handleSelectAll}
                onCancelAll={handleCancelSelectionAll}
                isUserRole={isUserRole}
            />
        </div>
    );
}
