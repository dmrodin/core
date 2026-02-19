'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LockOpen, Plus } from 'lucide-react';

import {
    CreateLockedPeriodRequest,
    CreateLockedPeriodSchema,
    useLockedPeriods,
} from '@/entities/locked-period';
import { useCreateLockedPeriod, useOpenLockedPeriod } from '@/features/locked-periods';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    Badge,
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Loading,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    formatDate,
    formatDateTime,
} from '@/shared';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/ui/shadcn/dialog';

export function LockedPeriodsPanel() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { data, isLoading } = useLockedPeriods();
    const createMutation = useCreateLockedPeriod();
    const openMutation = useOpenLockedPeriod();

    const form = useForm<CreateLockedPeriodRequest>({
        resolver: zodResolver(CreateLockedPeriodSchema),
        defaultValues: {
            dateFrom: '',
            dateTo: '',
        },
    });

    const lockedPeriods = data?.lockedPeriods ?? [];
    const hasPeriods = lockedPeriods.length > 0;

    const handleSubmit = async (values: CreateLockedPeriodRequest) => {
        await createMutation.mutateAsync(values);
        form.reset();
        setDialogOpen(false);
    };

    const formatDateValue = (value: string) => {
        if (!value) return '-';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return '-';
        const result = formatDate(parsed);
        return result || '-';
    };

    const formatDateTimeValue = (value: string) => {
        const result = formatDateTime(value);
        return result || '-';
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl">Периоды</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Закрывайте периоды, чтобы запретить создание операций в указанном диапазоне дат.
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить период
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Добавить период блокировки</DialogTitle>
                                <DialogDescription>
                                    Укажите даты, в течение которых будет запрещено создание операций.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="dateFrom"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Дата начала</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dateTo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Дата окончания</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">
                                                Отмена
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={createMutation.isPending}>
                                            {createMutation.isPending ? 'Добавление...' : 'Добавить'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Loading />
                    ) : hasPeriods ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Дата начала</TableHead>
                                    <TableHead>Дата окончания</TableHead>
                                    <TableHead>Дата установки</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead className="text-right">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lockedPeriods.map((period) => (
                                    <TableRow key={period.id}>
                                        <TableCell className="font-medium">
                                            {formatDateValue(period.dateFrom)}
                                        </TableCell>
                                        <TableCell>{formatDateValue(period.dateTo)}</TableCell>
                                        <TableCell>{formatDateTimeValue(period.lockedAt)}</TableCell>
                                        <TableCell>
                                            <Badge variant={period.isActive ? 'success' : 'secondary'}>
                                                {period.isActive ? 'Активен' : 'Открыт'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {period.isActive ? (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <LockOpen className="h-4 w-4 mr-2" />
                                                            Открыть
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Открыть период?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Период {formatDateValue(period.dateFrom)} -{' '}
                                                                {formatDateValue(period.dateTo)} станет доступен для
                                                                создания операций.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                disabled={openMutation.isPending}
                                                                onClick={() => openMutation.mutate(period.id)}
                                                            >
                                                                Открыть период
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            ) : (
                                                <Button variant="ghost" size="sm" disabled>
                                                    Открыт
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <LockOpen />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Периоды ещё не созданы</EmptyTitle>
                                    <EmptyDescription>
                                        Добавьте первый период, чтобы ограничить создание операций.
                                    </EmptyDescription>
                                </EmptyContent>
                            </EmptyHeader>
                        </Empty>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
