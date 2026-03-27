'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Copy, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useWallet } from '@/entities/wallet';
import {
    GetOperationsParams,
    GetOperationsParamsSchema,
    useCopyOperation,
    useDeleteOperation,
    useInfiniteOperations,
} from '@/entities/operations';
import { OperationsFiltersSheet } from '@/features/operations/ui/operations-filters/operations-filters-sheet';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Form,
    Input,
    Loading,
    formatDateTime,
    ROUTER_MAP,
} from '@/shared';
import { formatNumber } from '@/shared/lib/utils/format-number';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function WalletOperationsPage() {
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    const params = useParams();
    const router = useRouter();
    const walletId = params.id as string;
    const lastOperationRef = useRef<HTMLDivElement | null>(null);

    const form = useForm<GetOperationsParams>({
        resolver: zodResolver(GetOperationsParamsSchema),
        defaultValues: {
            walletId,
            typeId: null,
            userId: null,
            applicationId: null,
            search: '',
            dateFrom: '',
            dateTo: '',
        },
    });

    const handleReset = () => {
        form.reset({
            walletId,
            search: '',
            typeId: null,
            userId: null,
            applicationId: null,
            dateFrom: '',
            dateTo: '',
        });
    };

    const formValues = form.watch();

    const { data: wallet, isLoading: isWalletLoading } = useWallet(walletId);
    const { copyOperation } = useCopyOperation();
    const { mutate: deleteOperation } = useDeleteOperation();
    const {
        data: operationsData,
        isLoading: isOperationsLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteOperations({
        ...formValues,
        walletId,
        limit: 100,
    });

    useEffect(() => {
        if (!lastOperationRef.current || !hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(lastOperationRef.current);

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isWalletLoading || isOperationsLoading) {
        return <Loading />;
    }

    if (!wallet) {
        return (
            <div className="container mx-auto py-6">
                <p className="text-muted-foreground">Кошелек не найден</p>
            </div>
        );
    }

    // Получаем все операции из всех страниц
    const allOperations = operationsData?.pages.flatMap((page) => page.operations) ?? [];

    // Группируем операции по дням
    const groupedByDay = allOperations.reduce(
        (acc, operation) => {
            const date = format(parseISO(operation.createdAt), 'yyyy-MM-dd');

            if (!acc[date]) {
                acc[date] = {
                    date,
                    operations: [],
                };
            }

            acc[date].operations.push(operation);

            return acc;
        },
        {} as Record<string, { date: string; operations: typeof allOperations }>,
    );

    // Сортируем операции внутри каждого дня по убыванию (новые сверху)
    Object.values(groupedByDay).forEach((day) => {
        day.operations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    // Вычисляем баланс на конец каждого дня
    const daysWithBalance = Object.values(groupedByDay).map((day) => {
        // Сортируем операции внутри дня по времени и берём последнюю
        const sortedOps = [...day.operations].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        // Ищем последнюю операцию, у которой есть entry для нашего кошелька с заполненным after.
        // Если у одной операции несколько entries для этого кошелька — берём последнюю (наибольший индекс).
        let endBalance = 0;
        for (let i = sortedOps.length - 1; i >= 0; i--) {
            const walletEntries = sortedOps[i].entries.filter((e) => e.walletId === walletId && e.after != null);
            if (walletEntries.length > 0) {
                endBalance = walletEntries[walletEntries.length - 1].after!;
                break;
            }
        }

        return {
            ...day,
            endBalance,
        };
    });

    // Сортируем дни по убыванию (новые сверху)
    const sortedDays = daysWithBalance.sort((a, b) => b.date.localeCompare(a.date));

    const handleBack = () => {
        if (typeof window === 'undefined') {
            router.push(ROUTER_MAP.WALLETS);
            return;
        }

        const referrer = document.referrer;
        const hasSameOriginReferrer =
            referrer &&
            (() => {
                try {
                    return new URL(referrer).origin === window.location.origin;
                } catch {
                    return false;
                }
            })();

        if (window.history.length > 1 && hasSameOriginReferrer) {
            router.back();
            return;
        }

        router.push(ROUTER_MAP.WALLETS);
    };

    return (
        <Form {...form}>
            <form className="container mx-auto py-6 space-y-6">
                {/* Хедер с балансом */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" type="button" onClick={handleBack}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div>
                                    <h1 className="text-lg sm:text-2xl font-bold">
                                        {wallet.name}
                                        <span className="hidden sm:inline">
                                            {' '}
                                            — {formatNumber(wallet.amount)} {wallet.currency.code}
                                        </span>
                                    </h1>
                                    <p className="text-sm font-semibold sm:hidden">
                                        {formatNumber(wallet.amount)} {wallet.currency.code}
                                    </p>
                                    <p className="text-sm text-muted-foreground">История операций</p>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Input
                                    placeholder="Поиск..."
                                    value={form.watch('search') ?? ''}
                                    onChange={(e) => form.setValue('search', e.target.value || '')}
                                    className="w-full md:w-64"
                                />
                                <OperationsFiltersSheet form={form} onReset={handleReset} />
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Группированные по дням операции */}
                <div className="space-y-4">
                    {sortedDays.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">Нет операций</p>
                            </CardContent>
                        </Card>
                    ) : (
                        sortedDays.map(({ date, operations, endBalance }) => (
                            <div key={date} className="space-y-2">
                                {/* Заголовок дня с балансом */}
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-lg font-semibold">
                                        {format(parseISO(date), 'd MMMM yyyy', { locale: ru })}
                                    </h2>
                                    <p className="text-xl font-bold">{formatNumber(endBalance)}</p>
                                </div>

                                {/* Операции дня */}
                                {operations.map((operation, opIndex) => {
                                    const showDetails = expandedIds.includes(operation.id);
                                    const isLastInDay = opIndex === operations.length - 1;
                                    const isDayLast = date === sortedDays[sortedDays.length - 1].date;
                                    const isLast = isLastInDay && isDayLast;
                                    const isUpdated =
                                        new Date(operation.updatedAt).getTime() >
                                        new Date(operation.createdAt).getTime();

                                    return (
                                        <DropdownMenu key={operation.id}>
                                            <Card
                                                ref={isLast ? lastOperationRef : null}
                                                className="cursor-pointer hover:bg-accent/50 transition-colors"
                                                onClick={() =>
                                                    setExpandedIds((prev) =>
                                                        prev.includes(operation.id)
                                                            ? prev.filter((id) => id !== operation.id)
                                                            : [...prev, operation.id],
                                                    )
                                                }
                                            >
                                                <CardContent className="py-2 sm:py-4 relative">
                                                    <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                        <div className="space-y-1 sm:space-y-2 flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-semibold">{operation.type.name}</p>
                                                                {operation.applicationId && (
                                                                    <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md">
                                                                        Заявка #{operation.applicationId}
                                                                    </span>
                                                                )}
                                                                {operation.conversionGroupId && (
                                                                    <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md">
                                                                        Конвертация #{operation.conversionGroupId}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {operation.created_by?.username}
                                                            </p>

                                                            <div className="space-y-1">
                                                                {[...operation.entries]
                                                                    .sort(
                                                                        (a, b) =>
                                                                            (a.direction === 'debit' ? 0 : 1) -
                                                                            (b.direction === 'debit' ? 0 : 1),
                                                                    )
                                                                    .map((entry) => (
                                                                        <div
                                                                            key={entry.id}
                                                                            className="py-1 px-2 rounded-md bg-muted/50"
                                                                        >
                                                                            {showDetails ? (
                                                                                <p className="text-sm">
                                                                                    <Button
                                                                                        variant="link"
                                                                                        className="p-0 h-auto font-medium relative z-10 no-underline hover:no-underline cursor-pointer"
                                                                                        data-wallet-link
                                                                                        onPointerDown={(e) => {
                                                                                            e.stopPropagation();
                                                                                            router.push(
                                                                                                ROUTER_MAP.WALLET_OPERATIONS(
                                                                                                    entry.walletId,
                                                                                                ),
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        {entry.wallet.name}:
                                                                                    </Button>{' '}
                                                                                    {entry.direction === 'credit' ? (
                                                                                        <>
                                                                                            <span className="text-muted-foreground">
                                                                                                {entry.before ?? 0}{' '}
                                                                                                +{' '}
                                                                                            </span>
                                                                                            <span className="text-success/80 font-semibold">
                                                                                                {entry.amount}
                                                                                            </span>
                                                                                            <span className="text-muted-foreground">
                                                                                                {' '}
                                                                                                = {entry.after ?? 0}
                                                                                            </span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <span className="text-muted-foreground">
                                                                                                {entry.before ?? 0}{' '}
                                                                                                -{' '}
                                                                                            </span>
                                                                                            <span className="text-destructive/80 font-semibold">
                                                                                                {entry.amount}
                                                                                            </span>
                                                                                            <span className="text-muted-foreground">
                                                                                                {' '}
                                                                                                = {entry.after ?? 0}
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                </p>
                                                                            ) : (
                                                                                <p className="text-sm">
                                                                                    <Button
                                                                                        variant="link"
                                                                                        className="p-0 h-auto font-medium relative z-10 no-underline hover:no-underline cursor-pointer"
                                                                                        data-wallet-link
                                                                                        onPointerDown={(e) => {
                                                                                            e.stopPropagation();
                                                                                            router.push(
                                                                                                ROUTER_MAP.WALLET_OPERATIONS(
                                                                                                    entry.walletId,
                                                                                                ),
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        {entry.wallet.name}:
                                                                                    </Button>{' '}
                                                                                    <span
                                                                                        className={
                                                                                            entry.direction === 'credit'
                                                                                                ? 'text-success/80 font-semibold'
                                                                                                : 'text-destructive/80 font-semibold'
                                                                                        }
                                                                                    >
                                                                                        {entry.amount}
                                                                                    </span>
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                            </div>

                                                            {operation.description && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {operation.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="mb-2 ml-auto h-8 w-8"
                                                                    aria-label="Открыть меню операции"
                                                                    onPointerDown={(e) => e.stopPropagation()}
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <p className="text-sm text-muted-foreground leading-tight">
                                                                {formatDateTime(operation.createdAt)}
                                                            </p>
                                                            {isUpdated && (
                                                                <div className="mt-2 text-[11px] text-muted-foreground leading-tight text-left sm:text-right">
                                                                    <p className="whitespace-nowrap">
                                                                        Изменено: {formatDateTime(operation.updatedAt)}
                                                                    </p>
                                                                    {operation.updated_by?.username && (
                                                                        <p className="whitespace-nowrap">
                                                                            Исполнитель: {operation.updated_by.username}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <DropdownMenuContent
                                                align="center"
                                                className="w-40 bg-background shadow-md rounded-md text-foreground"
                                            >
                                                <DropdownMenuItem
                                                    className="hover:bg-primary/60 dark:hover:bg-primary/60"
                                                    onClick={() =>
                                                        router.push(ROUTER_MAP.OPERATIONS_EDIT + '/' + operation.id)
                                                    }
                                                >
                                                    <Pencil className="mr-2 h-4 w-4 text-primary" />
                                                    Редактировать
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="hover:bg-primary/60 dark:hover:bg-primary/60"
                                                    onClick={() =>
                                                        setExpandedIds((prev) =>
                                                            prev.includes(operation.id)
                                                                ? prev.filter((id) => id !== operation.id)
                                                                : [...prev, operation.id],
                                                        )
                                                    }
                                                >
                                                    <MoreHorizontal className="mr-2 h-4 w-4 text-primary" />
                                                    {showDetails ? 'Скрыть' : 'Подробнее'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="hover:bg-primary/60 dark:hover:bg-primary/60"
                                                    onClick={() => copyOperation(operation)}
                                                >
                                                    <Copy className="mr-2 h-4 w-4 text-primary" />
                                                    Копировать
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                                                    onClick={() => deleteOperation(operation.id)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4 text-destructive/60" />
                                                    Удалить
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    );
                                })}
                            </div>
                        ))
                    )}

                    {isFetchingNextPage && <Loading className="py-4" />}
                </div>
            </form>
        </Form>
    );
}
