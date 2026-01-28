'use client';

import { UseFormReturn } from 'react-hook-form';

import { useCurrency } from '@/entities/currency';
import { useUsers } from '@/entities/users';
import { BalanceStatus, GetWalletsFilter, SortOrder, WalletKind } from '@/entities/wallet';
import { Button } from '@/shared/ui/shadcn/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/shadcn/form';
import { Input } from '@/shared/ui/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { Switch } from '@/shared/ui/shadcn/switch';

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

export function WalletsFilters({ form }: { form: UseFormReturn<GetWalletsFilter> }) {
    const { data: currencies } = useCurrency();
    const { data: users } = useUsers();

    return (
        <Form {...form}>
            <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="search"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Поиск</FormLabel>
                                <FormControl>
                                    <Input placeholder="Название или описание" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="balanceStatus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Статус баланса</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === 'all' ? undefined : value)}
                                    value={field.value ?? 'all'}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выбрать" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        {Object.values(BalanceStatus).map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {balanceStatusLabels[s]}
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
                        name="walletKind"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Вид кошелька</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === 'all' ? undefined : value)}
                                    value={field.value ?? 'all'}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выбрать" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        {Object.values(WalletKind).map((kind) => (
                                            <SelectItem key={kind} value={kind}>
                                                {walletKindLabels[kind]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="minAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Мин. сумма</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="0"
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
                            name="maxAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Макс. сумма</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="∞"
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="currencyId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Валюта</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === 'all' ? undefined : value)}
                                    value={field.value ?? 'all'}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выбрать" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        {currencies?.currencies?.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.code} — {c.name}
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
                        name="userId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Пользователь</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === 'all' ? undefined : value)}
                                    value={field.value ?? 'all'}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выбрать" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        {users?.users?.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <FormField
                        control={form.control}
                        name="sortOrder"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Порядок сортировки</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Выбрать" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={SortOrder.ASC}>По возрастанию</SelectItem>
                                        <SelectItem value={SortOrder.DESC}>По убыванию</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center justify-between gap-2">
                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-2 border rounded-md p-3 w-full">
                                    <FormControl>
                                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel className="text-sm font-medium">Активные</FormLabel>
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            className="w-full md:w-auto"
                            onClick={() => form.reset()}
                            variant="outline"
                        >
                            Сбросить
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
