'use client';
import { useState } from 'react';

import { FilterIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

import { useCurrency } from '@/entities/currency';
import { UserRole } from '@/entities/users/model/user-schemas';
import { useUsers } from '@/entities/users';
import { BalanceStatus, GetWalletsFilter, SortOrder, WalletKind, WalletSortField } from '@/entities/wallet';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import {
    Badge,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/shared';

const walletKindLabels: Record<WalletKind, string> = {
    [WalletKind.crypto]: 'Криптовалютный',
    [WalletKind.bank]: 'Банковский',
    [WalletKind.simple]: 'Касса',
};

const balanceStatusLabels: Record<BalanceStatus, string> = {
    [BalanceStatus.unknown]: 'Неизвестный',
    [BalanceStatus.positive]: 'Положительный',
    [BalanceStatus.negative]: 'Отрицательный',
    [BalanceStatus.neutral]: 'Нейтральный',
};

const SORT_FIELDS: { value: WalletSortField; label: string }[] = [
    { value: WalletSortField.CREATED_AT, label: 'Дате создания' },
    { value: WalletSortField.UPDATED_AT, label: 'Дате обновления' },
];

const SORT_ORDERS: { value: SortOrder; label: string }[] = [
    { value: SortOrder.DESC, label: 'Сначала новые' },
    { value: SortOrder.ASC, label: 'Сначала старые' },
];

export function WalletsFiltersSheet({
    form,
    baseFilters,
}: {
    form: UseFormReturn<GetWalletsFilter>;
    baseFilters: GetWalletsFilter;
}) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const hasAdminRole = user?.roles?.some((role) => role.code === UserRole.ADMIN) ?? false;
    const isRestrictedRole =
        !hasAdminRole &&
        (user?.roles?.some((role) => role.code === UserRole.USER || role.code === UserRole.MODERATOR) ?? false);
    const canLoadReferenceFilters = Boolean(user) && !isRestrictedRole;

    const { data: currencies } = useCurrency(canLoadReferenceFilters);
    const { data: users } = useUsers(canLoadReferenceFilters);

    const [localFilters, setLocalFilters] = useState<Partial<GetWalletsFilter>>({});

    /* const handleApplyFilters = () => {
    form.reset({ ...baseFilters, ...localFilters });
    setSheetOpen(false);
  }; */

    const handleApplyFilters = () => {
        (Object.entries(localFilters) as [keyof GetWalletsFilter, GetWalletsFilter[keyof GetWalletsFilter]][]).forEach(
            ([key, value]) => {
                form.setValue(key, value);
            },
        );

        setSheetOpen(false);
    };

    const resetFilters = () => {
        const currentValues = form.getValues();
        setLocalFilters({});
        form.reset({
            ...baseFilters,
            visible: currentValues.visible,
            deleted: currentValues.deleted,
            pinned: currentValues.pinned,
            walletTypeId: currentValues.walletTypeId,
        });
    };

    const activeFiltersCount = [
        localFilters.balanceStatus,
        localFilters.walletKind,
        localFilters.currencyId,
        localFilters.userId,
        localFilters.secondUserId,
        localFilters.minAmount,
        localFilters.maxAmount,
        localFilters.sortField,
        localFilters.sortOrder,
    ].filter(Boolean).length;

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Фильтры
                    {activeFiltersCount > 0 && (
                        <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1 flex items-center justify-center">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Фильтры кошельков</SheetTitle>
                    <SheetDescription>Настройте параметры для фильтрации списка кошельков</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 px-4">
                    <div className="space-y-2">
                        <Label>Статус баланса</Label>
                        <Select
                            value={localFilters.balanceStatus ?? ''}
                            onValueChange={(val) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    balanceStatus: val ? (val as BalanceStatus) : undefined,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(BalanceStatus).map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {balanceStatusLabels[s]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Вид кошелька</Label>
                        <Select
                            value={localFilters.walletKind ?? ''}
                            onValueChange={(val) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    walletKind: val ? (val as WalletKind) : undefined,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(WalletKind).map((kind) => (
                                    <SelectItem key={kind} value={kind}>
                                        {walletKindLabels[kind]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Валюта</Label>
                        <Select
                            value={localFilters.currencyId ?? ''}
                            onValueChange={(val) => {
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    currencyId: val || undefined,
                                }));
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies?.currencies?.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.code} — {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Владелец 1</Label>
                        <Select
                            value={localFilters.userId ?? ''}
                            onValueChange={(val) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    userId: val || undefined,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                {users?.users
                                    ?.filter((u) => u.isHolder)
                                    .map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.username}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Владелец 2</Label>
                        <Select
                            value={localFilters.secondUserId ?? ''}
                            onValueChange={(val) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    secondUserId: val || undefined,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                {users?.users
                                    ?.filter((u) => u.isHolder)
                                    .map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.username}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Сортировать по</Label>
                        <Select
                            value={localFilters.sortField ?? ''}
                            onValueChange={(val) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    sortField: val ? (val as WalletSortField) : undefined,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Дате создания" />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_FIELDS.map((field) => (
                                    <SelectItem key={field.value} value={field.value}>
                                        {field.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Порядок сортировки</Label>
                        <Select
                            value={localFilters.sortOrder ?? ''}
                            onValueChange={(val) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    sortOrder: val ? (val as SortOrder) : undefined,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Сначала новые" />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_ORDERS.map((order) => (
                                    <SelectItem key={order.value} value={order.value}>
                                        {order.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Мин. сумма</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                value={localFilters.minAmount ?? ''}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        minAmount: e.target.value ? Number(e.target.value) : null,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Макс. сумма</Label>
                            <Input
                                type="number"
                                min={0}
                                placeholder="∞"
                                value={localFilters.maxAmount ?? ''}
                                onChange={(e) =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        maxAmount: e.target.value ? Number(e.target.value) : null,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <Button variant="outline" onClick={resetFilters} className="flex-1">
                            Сбросить
                        </Button>
                        <Button onClick={handleApplyFilters} className="flex-1">
                            Применить
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
