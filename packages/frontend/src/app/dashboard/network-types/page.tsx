'use client';

import { useCallback, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Layers, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';

import { useNetworkTypesList } from '@/entities/network/model/use-network-types-list';
import { useDeleteNetworkType } from '@/features/network/hooks/use-delete-network-type';
import { useRestoreNetworkType } from '@/features/network/hooks/use-restore-network-type';
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

export default function NetworkTypesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [networkTypeToDelete, setNetworkTypeToDelete] = useState<string | null>(null);

    const tab = searchParams.get('tab') || 'all';
    const showDeleted = tab === 'deleted' ? true : false;

    const { data, isLoading } = useNetworkTypesList(showDeleted);
    const deleteMutation = useDeleteNetworkType();
    const restoreMutation = useRestoreNetworkType();

    const handleTabChange = useCallback(
        (value: string) => {
            router.push(`${ROUTER_MAP.NETWORK_TYPES}?tab=${value}`);
        },
        [router],
    );

    const handleDeleteClick = (id: string) => {
        setNetworkTypeToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (networkTypeToDelete) {
            await deleteMutation.mutateAsync(networkTypeToDelete);
            setDeleteDialogOpen(false);
            setNetworkTypeToDelete(null);
        }
    };

    const handleRestore = async (id: string) => {
        await restoreMutation.mutateAsync(id);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="hidden text-2xl md:block">Типы сетей</CardTitle>
                    <Button asChild>
                        <Link href={ROUTER_MAP.NETWORK_TYPES_CREATE}>
                            <Plus className="w-4 h-4 mr-2" />
                            Создать тип
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs value={tab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="all">Активные</TabsTrigger>
                            <TabsTrigger value="deleted">Удалённые</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    {isLoading ? (
                        <Loading />
                    ) : data?.networkTypes.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Layers />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>
                                        {tab === 'deleted' ? 'Нет удалённых типов сетей' : 'Типы сетей ещё не созданы'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {tab === 'deleted'
                                            ? 'Все удалённые типы сетей будут отображаться здесь.'
                                            : 'Создайте первый тип сети для использования в системе.'}
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
                                {data?.networkTypes.map((networkType) => (
                                    <TableRow
                                        key={networkType.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            !showDeleted &&
                                            router.push(`${ROUTER_MAP.NETWORK_TYPES_EDIT}/${networkType.id}`)
                                        }
                                    >
                                        <TableCell className="font-medium">{networkType.code}</TableCell>
                                        <TableCell>{networkType.name}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    networkType.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {networkType.active ? 'Активен' : 'Неактивен'}
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
                                                            handleRestore(networkType.id);
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
                                                                    `${ROUTER_MAP.NETWORK_TYPES_EDIT}/${networkType.id}`,
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
                                                                handleDeleteClick(networkType.id);
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
                        <AlertDialogTitle>Удалить тип сети?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Тип сети будет перемещен в удаленные. Вы сможете восстановить его позже из вкладки
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
