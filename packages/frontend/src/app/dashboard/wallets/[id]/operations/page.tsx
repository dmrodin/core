'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useWallet } from '@/entities/wallet';
import { GetOperationsParams, GetOperationsParamsSchema, useInfiniteOperations } from '@/entities/operations';
import { OperationsFiltersSheet } from '@/features/operations/ui/operations-filters/operations-filters-sheet';
import { Button, Card, CardContent, CardHeader, Form, Input, Loading, formatDateTime, ROUTER_MAP } from '@/shared';
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

    // Сортируем операции внутри каждого дня по времени
    Object.values(groupedByDay).forEach((day) => {
        day.operations.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    // Вычисляем баланс на конец каждого дня
    const daysWithBalance = Object.values(groupedByDay).map((day) => {
        // Берем последнюю операцию дня
        const lastOperation = day.operations[day.operations.length - 1];
        // Находим entry для нашего кошелька в последней операции
        const walletEntry = lastOperation?.entries.find((e) => e.walletId === walletId);
        // Баланс на конец дня = after последней операции
        const endBalance = walletEntry?.after ?? 0;

        return {
            ...day,
            endBalance,
        };
    });

    // Сортируем дни по убыванию (новые сверху)
    const sortedDays = daysWithBalance.sort((a, b) => b.date.localeCompare(a.date));

    return (
        <Form {...form}>
            <form className="container mx-auto py-6 space-y-6">
                {/* Хедер с балансом */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        {wallet.name} — {formatNumber(wallet.amount)} {wallet.currency.code}
                                    </h1>
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
                                    const showDetails =
                                        expandedIds.includes(operation.id) || operation.type.isCorrection;
                                    const isLastInDay = opIndex === operations.length - 1;
                                    const isDayLast = date === sortedDays[sortedDays.length - 1].date;
                                    const isLast = isLastInDay && isDayLast;

                                    return (
                                        <Card
                                            key={operation.id}
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
                                            <CardContent className="py-4 relative">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="space-y-2 flex-1">
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

                                                        <div className="space-y-1.5">
                                                            {operation.entries.map((entry) => (
                                                                <div
                                                                    key={entry.id}
                                                                    className="p-2 rounded-md bg-muted/50"
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
                                                                                        {entry.before ?? 0} +{' '}
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
                                                                                        {entry.before ?? 0} -{' '}
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

                                                    <div className="text-left sm:text-right">
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDateTime(operation.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
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
