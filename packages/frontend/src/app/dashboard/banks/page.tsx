'use client';

import { useCallback, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Building2, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';

import { useBanks } from '@/entities/bank';
import { useDeleteBank } from '@/features/banks/hooks/use-delete-bank';
import { useRestoreBank } from '@/features/banks/hooks/use-restore-bank';
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

export default function BanksPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bankToDelete, setBankToDelete] = useState<string | null>(null);

    const tab = searchParams.get('tab') || 'all';
    const showDeleted = tab === 'deleted' ? true : undefined;

    const { data, isLoading } = useBanks();
    const deleteMutation = useDeleteBank();
    const restoreMutation = useRestoreBank();

    const handleTabChange = useCallback(
        (value: string) => {
            router.push(`${ROUTER_MAP.BANKS}?tab=${value}`);
        },
        [router],
    );

    const handleDeleteClick = (id: string) => {
        setBankToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (bankToDelete) {
            await deleteMutation.mutateAsync(bankToDelete);
            setDeleteDialogOpen(false);
            setBankToDelete(null);
        }
    };

    const handleRestore = async (id: string) => {
        await restoreMutation.mutateAsync(id);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-2xl">Банки</CardTitle>
                    <Button asChild>
                        <Link href={ROUTER_MAP.BANKS_CREATE}>
                            <Plus className="w-4 h-4 mr-2" />
                            Создать банк
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
                    ) : data?.banks.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Building2 />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>
                                        {tab === 'deleted' ? 'Нет удалённых банков' : 'Банки ещё не созданы'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {tab === 'deleted'
                                            ? 'Все удалённые банки будут отображаться здесь.'
                                            : 'Создайте первый банк для использования в системе.'}
                                    </EmptyDescription>
                                </EmptyContent>
                            </EmptyHeader>
                        </Empty>
                    ) : (
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
                                {data?.banks.map((bank) => (
                                    <TableRow
                                        key={bank.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            !showDeleted && router.push(`${ROUTER_MAP.BANKS_EDIT}/${bank.id}`)
                                        }
                                    >
                                        <TableCell className="font-medium">{bank.code}</TableCell>
                                        <TableCell>{bank.name}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    bank.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {bank.active ? 'Активен' : 'Неактивен'}
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
                                                            handleRestore(bank.id);
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
                                                                router.push(`${ROUTER_MAP.BANKS_EDIT}/${bank.id}`);
                                                            }}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(bank.id);
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
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить банк?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Банк будет перемещён в удаленные. Вы сможете восстановить его позже из вкладки
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
