'use client';

import { useCallback, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Coins, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';

import { useCurrencies } from '@/entities/currency/model/use-currencies';
import { useDeleteCurrency } from '@/features/currencies/hooks/use-delete-currency';
import { useRestoreCurrency } from '@/features/currencies/hooks/use-restore-currency';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    Loading,
    ROUTER_MAP,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/shared';

export default function CurrenciesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currencyToDelete, setCurrencyToDelete] = useState<string | null>(null);

    const tab = searchParams.get('tab') || 'all';
    const showDeleted = tab === 'deleted';

    const { data, isLoading } = useCurrencies(showDeleted ? true : undefined);
    const deleteMutation = useDeleteCurrency();
    const restoreMutation = useRestoreCurrency();

    const handleTabChange = useCallback(
        (value: string) => {
            router.push(`${ROUTER_MAP.CURRENCIES}?tab=${value}`);
        },
        [router],
    );

    const handleDeleteClick = (id: string) => {
        setCurrencyToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (currencyToDelete) {
            await deleteMutation.mutateAsync(currencyToDelete);
            setDeleteDialogOpen(false);
            setCurrencyToDelete(null);
        }
    };

    const handleRestore = async (id: string) => {
        await restoreMutation.mutateAsync(id);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-2xl">Валюты</CardTitle>
                    <Button asChild>
                        <Link href={ROUTER_MAP.CURRENCIES_CREATE}>
                            <Plus className="w-4 h-4 mr-2" />
                            Создать валюту
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs value={tab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all">Все</TabsTrigger>
                            <TabsTrigger value="deleted">Удалённые</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {isLoading ? (
                        <Loading />
                    ) : data?.currencies.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Coins />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>
                                        {showDeleted ? 'Нет удалённых валют' : 'Валюты ещё не созданы'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {showDeleted
                                            ? 'Все удалённые валюты будут отображаться здесь.'
                                            : 'Создайте первую валюту для использования в системе.'}
                                    </EmptyDescription>
                                </EmptyContent>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Код</TableHead>
                                        <TableHead>Название</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead className="text-right">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.currencies.map((currency) => (
                                        <TableRow
                                            key={currency.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() =>
                                                !showDeleted &&
                                                router.push(`${ROUTER_MAP.CURRENCIES_EDIT}/${currency.id}`)
                                            }
                                        >
                                            <TableCell className="font-medium">{currency.code}</TableCell>
                                            <TableCell>{currency.name}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        currency.active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {currency.active ? 'Активна' : 'Неактивна'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {showDeleted ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRestore(currency.id);
                                                            }}
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(
                                                                        `${ROUTER_MAP.CURRENCIES_EDIT}/${currency.id}`,
                                                                    );
                                                                }}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(currency.id);
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить валюту?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Валюта будет перемещена в удаленные. Вы сможете восстановить её позже из вкладки
                            &quot;Удалённые&quot;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
