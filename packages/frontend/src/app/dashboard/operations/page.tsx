'use client';

import { Fragment, useMemo, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Copy, FileText, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
    GetOperationsParams,
    GetOperationsParamsSchema,
    useCopyOperation,
    useDeleteOperation,
    useInfiniteOperations,
    useOperationTypes,
} from '@/entities/operations';
import { useLockedPeriods } from '@/entities/locked-period';
import { useAuthStore } from '@/features/users/ui/user-stores/user-store';
import {
    Button,
    Card,
    CardContent,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    Form,
    formatDate,
    formatDateTime,
    formatNumber,
    Input,
    Loading,
    ROUTER_MAP,
    Skeleton,
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/shared';
import { OperationsFiltersSheet } from '@/features/operations/ui/operations-filters/operations-filters-sheet';

export default function OperationsPage() {
    const user = useAuthStore((state) => state.user);
    const canLoadOperationsData = Boolean(user);

    const form = useForm<GetOperationsParams>({
        resolver: zodResolver(GetOperationsParamsSchema),
        defaultValues: {
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
            search: '',
            typeId: null,
            userId: null,
            applicationId: null,
            dateFrom: '',
            dateTo: '',
            page: 1,
            limit: 10,
        });
    };

    const router = useRouter();

    const filters = form.watch();

    const { data, error, hasNextPage, isFetching, isLoading } = useInfiniteOperations(
        filters,
        100,
        canLoadOperationsData,
    );
    const { data: operationTypes } = useOperationTypes(undefined, canLoadOperationsData);
    const { data: lockedPeriodsData } = useLockedPeriods(canLoadOperationsData);
    const { copyOperation } = useCopyOperation();
    const { mutate: deleteOperation } = useDeleteOperation();
    const lastOperationRef = useRef<HTMLDivElement | null>(null);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const tabTypes = operationTypes?.filter((type) => type.isSeparateTab) || [];

    const currentTypeId = form.watch('typeId');
    const activeTab = currentTypeId === null ? 'all' : String(currentTypeId);

    const activeLockedPeriod = useMemo(() => {
        const lockedPeriods = lockedPeriodsData?.lockedPeriods ?? [];
        if (!lockedPeriods.length) return null;

        const today = new Date();
        const normalizeDate = (value: Date) =>
            new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
        const todayOnly = normalizeDate(today);

        return (
            lockedPeriods.find((period) => {
                if (!period.isActive) return false;
                const dateFrom = new Date(period.dateFrom);
                const dateTo = new Date(period.dateTo);
                if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) return false;
                const fromOnly = normalizeDate(dateFrom);
                const toOnly = normalizeDate(dateTo);
                return todayOnly >= fromOnly && todayOnly <= toOnly;
            }) ?? null
        );
    }, [lockedPeriodsData]);

    const formatRange = (dateFrom: string, dateTo: string) => {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const fromLabel = Number.isNaN(from.getTime()) ? '-' : formatDate(from);
        const toLabel = Number.isNaN(to.getTime()) ? '-' : formatDate(to);
        return `${fromLabel} - ${toLabel}`;
    };

    return (
        <Form {...form}>
            <form className="max-w-5xl mx-auto space-y-3 sm:space-y-6">
                <div className="space-y-3">
                    <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 md:flex md:flex-wrap">
                        <Input
                            placeholder="Поиск..."
                            value={form.watch('search') ?? ''}
                            onChange={(e) => form.setValue('search', e.target.value || '')}
                            className="min-w-0 md:w-64"
                        />
                        <OperationsFiltersSheet form={form} onReset={handleReset} />
                        <Button
                            type="button"
                            onClick={() => router.push(ROUTER_MAP.OPERATIONS_CREATE)}
                            className="h-9 px-3 sm:h-10 sm:px-4"
                            aria-label="Создать операцию"
                        >
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Создать операцию</span>
                        </Button>
                    </div>
                    {activeLockedPeriod && (
                        <div className="w-full rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            Сейчас закрыт период {formatRange(activeLockedPeriod.dateFrom, activeLockedPeriod.dateTo)}.
                            Создание операций за даты в пределах периода запрещено.
                        </div>
                    )}
                </div>

                <Tabs
                    className="sticky top-0 z-20 -mx-1 bg-background/95 px-1 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
                    value={activeTab}
                    onValueChange={(val) => {
                        form.setValue('typeId', val === 'all' ? null : val);
                    }}
                >
                    <div className="w-full overflow-x-auto">
                        <TabsList
                            className="flex h-10 w-max min-w-full flex-nowrap md:grid"
                            style={{
                                gridTemplateColumns: `repeat(${1 + tabTypes.length}, minmax(0, 1fr))`,
                            }}
                        >
                            <TabsTrigger value="all" className="min-h-9 w-auto shrink-0 px-4 md:w-full">
                                <span className="sm:hidden">Все</span>
                                <span className="hidden sm:inline">Все операции</span>
                            </TabsTrigger>
                            {tabTypes.map((type) => (
                                <TabsTrigger
                                    key={type.id}
                                    value={type.id}
                                    className="min-h-9 w-auto shrink-0 px-4 md:w-full"
                                >
                                    {type.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </Tabs>

                <div className="space-y-2">
                    <div className="">
                        {isLoading ? (
                            <div className="space-y-2">
                                {[0, 1, 2].map((item) => (
                                    <Card key={item} className="gap-3 px-4 py-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-3">
                                                <Skeleton className="h-5 w-32" />
                                                <Skeleton className="h-8 w-48 max-w-full" />
                                                <Skeleton className="h-4 w-40 max-w-full" />
                                            </div>
                                            <Skeleton className="h-10 w-10 rounded-md" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="justify-items-center">
                                <Card className="w-full items-center justify-center gap-2 px-4 py-8 text-center">
                                    <p className="font-semibold text-destructive">Не удалось загрузить операции</p>
                                    <p className="text-sm text-muted-foreground">
                                        Обновите страницу или попробуйте позже.
                                    </p>
                                </Card>
                            </div>
                        ) : !data?.pages[0]?.operations.length ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FileText />
                                    </EmptyMedia>
                                    <EmptyContent>
                                        <EmptyTitle>Операции не найдены</EmptyTitle>
                                        <EmptyDescription>
                                            Нет операций, соответствующих выбранным фильтрам. Попробуйте изменить
                                            параметры поиска или создайте новую операцию.
                                        </EmptyDescription>
                                    </EmptyContent>
                                </EmptyHeader>
                            </Empty>
                        ) : (
                            <div>
                                {data?.pages.map((page, pageIndex) => (
                                    <Fragment key={pageIndex}>
                                        {page.operations
                                            .filter((operation) =>
                                                activeTab === 'all' ? true : operation.type.id === activeTab,
                                            )
                                            .map((operation, operationIndex) => {
                                                const isLast =
                                                    pageIndex === data.pages.length - 1 &&
                                                    operationIndex === page.operations.length - 1;

                                                const showDetails = expandedIds.includes(operation.id);
                                                const isUpdated =
                                                    new Date(operation.updatedAt).getTime() >
                                                    new Date(operation.createdAt).getTime();

                                                return (
                                                    <DropdownMenu key={operation.id}>
                                                        <Card
                                                            ref={isLast ? lastOperationRef : null}
                                                            className="relative mb-2 gap-0 py-4 transition-colors hover:bg-accent/50 sm:mb-1 sm:gap-6 sm:py-6"
                                                        >
                                                            <CardContent className="relative px-4 py-0 sm:px-6">
                                                                <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                                    <div className="min-w-0 flex-1 space-y-2 pr-11 sm:pr-0">
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <p className="font-semibold">
                                                                                {operation.type.name}
                                                                            </p>
                                                                            {operation.applicationId && (
                                                                                <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md">
                                                                                    Заявка #{operation.applicationId}
                                                                                </span>
                                                                            )}
                                                                            {operation.conversionGroupId && (
                                                                                <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md">
                                                                                    Конвертация #
                                                                                    {operation.conversionGroupId}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
                                                                            <p className="text-sm">
                                                                                {operation.created_by?.username}
                                                                            </p>
                                                                            <span className="text-xs sm:hidden">•</span>
                                                                            <p className="text-xs sm:hidden">
                                                                                {formatDateTime(operation.createdAt)}
                                                                            </p>
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            {[...operation.entries]
                                                                                .sort(
                                                                                    (a, b) =>
                                                                                        (a.direction === 'debit'
                                                                                            ? 0
                                                                                            : 1) -
                                                                                        (b.direction === 'debit'
                                                                                            ? 0
                                                                                            : 1),
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
                                                                                                    onPointerDown={(
                                                                                                        e,
                                                                                                    ) => {
                                                                                                        e.preventDefault();
                                                                                                        e.stopPropagation();
                                                                                                    }}
                                                                                                    onClick={(e) => {
                                                                                                        e.preventDefault();
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
                                                                                                {entry.direction ===
                                                                                                'credit' ? (
                                                                                                    <>
                                                                                                        <span className="text-muted-foreground">
                                                                                                            {entry.before ??
                                                                                                                0}{' '}
                                                                                                            +{' '}
                                                                                                        </span>
                                                                                                        <span className="text-success/80 font-semibold">
                                                                                                            {
                                                                                                                entry.amount
                                                                                                            }
                                                                                                        </span>
                                                                                                        <span className="text-muted-foreground">
                                                                                                            {' '}
                                                                                                            ={' '}
                                                                                                            {entry.after ??
                                                                                                                0}
                                                                                                        </span>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <>
                                                                                                        <span className="text-muted-foreground">
                                                                                                            {entry.before ??
                                                                                                                0}{' '}
                                                                                                            -{' '}
                                                                                                        </span>
                                                                                                        <span className="text-destructive/80 font-semibold">
                                                                                                            {
                                                                                                                entry.amount
                                                                                                            }
                                                                                                        </span>
                                                                                                        <span className="text-muted-foreground">
                                                                                                            {' '}
                                                                                                            ={' '}
                                                                                                            {entry.after ??
                                                                                                                0}
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
                                                                                                    onPointerDown={(
                                                                                                        e,
                                                                                                    ) => {
                                                                                                        e.preventDefault();
                                                                                                        e.stopPropagation();
                                                                                                    }}
                                                                                                    onClick={(e) => {
                                                                                                        e.preventDefault();
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
                                                                                                        entry.direction ===
                                                                                                        'credit'
                                                                                                            ? 'text-success/80 font-semibold'
                                                                                                            : 'text-destructive/80 font-semibold'
                                                                                                    }
                                                                                                >
                                                                                                    {entry.direction ===
                                                                                                    'credit'
                                                                                                        ? '+'
                                                                                                        : '−'}
                                                                                                    {formatNumber(
                                                                                                        entry.amount,
                                                                                                    )}{' '}
                                                                                                    {
                                                                                                        entry.wallet
                                                                                                            .currency
                                                                                                            ?.code
                                                                                                    }
                                                                                                </span>
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                        </div>

                                                                        {operation.description && (
                                                                            <p
                                                                                className={
                                                                                    showDetails
                                                                                        ? 'text-sm text-muted-foreground'
                                                                                        : 'line-clamp-2 text-sm text-muted-foreground'
                                                                                }
                                                                            >
                                                                                {operation.description}
                                                                            </p>
                                                                        )}
                                                                        {showDetails && isUpdated && (
                                                                            <div className="text-xs leading-relaxed text-muted-foreground sm:hidden">
                                                                                <p>
                                                                                    Изменено:{' '}
                                                                                    {formatDateTime(
                                                                                        operation.updatedAt,
                                                                                    )}
                                                                                </p>
                                                                                {operation.updated_by?.username && (
                                                                                    <p>
                                                                                        Исполнитель:{' '}
                                                                                        {operation.updated_by.username}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="absolute right-3 top-0 flex flex-col items-end text-right sm:static">
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="mb-2 ml-auto h-11 w-11 sm:h-9 sm:w-9"
                                                                                aria-label="Открыть меню операции"
                                                                                onPointerDown={(event) =>
                                                                                    event.stopPropagation()
                                                                                }
                                                                            >
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <p className="hidden text-sm leading-tight text-muted-foreground sm:block">
                                                                            {formatDateTime(operation.createdAt)}
                                                                        </p>
                                                                        {isUpdated && (
                                                                            <div className="mt-2 hidden text-left text-[11px] leading-tight text-muted-foreground sm:block sm:text-right">
                                                                                <p className="whitespace-nowrap">
                                                                                    Изменено:{' '}
                                                                                    {formatDateTime(
                                                                                        operation.updatedAt,
                                                                                    )}
                                                                                </p>
                                                                                {operation.updated_by?.username && (
                                                                                    <p className="whitespace-nowrap">
                                                                                        Исполнитель:{' '}
                                                                                        {operation.updated_by.username}
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
                                                                    router.push(
                                                                        ROUTER_MAP.OPERATIONS_EDIT + '/' + operation.id,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4 text-primary" />{' '}
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
                                                                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                                                {showDetails ? 'Скрыть' : 'Подробнее'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="hover:bg-primary/60 dark:hover:bg-primary/60"
                                                                onClick={() => copyOperation(operation)}
                                                            >
                                                                <Copy className="mr-2 h-4 w-4 text-primary" />{' '}
                                                                Копировать
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                                                                onClick={() => deleteOperation(operation.id)}
                                                            >
                                                                <Trash className="mr-2 h-4 w-4 text-destructive/60" />{' '}
                                                                Удалить
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                );
                                            })}
                                    </Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                    {isFetching && hasNextPage && <Loading className="py-4" />}
                </div>
            </form>
        </Form>
    );
}
