'use client';

import { useCallback, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Network, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';

import { useNetworksList } from '@/entities/network/model/use-networks-list';
import { useDeleteNetwork } from '@/features/network/hooks/use-delete-network';
import { useRestoreNetwork } from '@/features/network/hooks/use-restore-network';
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

export default function NetworksPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [networkToDelete, setNetworkToDelete] = useState<string | null>(null);

    const tab = searchParams.get('tab') || 'all';
    const showDeleted = tab === 'deleted' ? true : undefined;

    const { data, isLoading } = useNetworksList(showDeleted);
    const deleteMutation = useDeleteNetwork();
    const restoreMutation = useRestoreNetwork();

    const handleTabChange = useCallback(
        (value: string) => {
            router.push(`${ROUTER_MAP.NETWORKS}?tab=${value}`);
        },
        [router],
    );

    const handleDeleteClick = (id: string) => {
        setNetworkToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (networkToDelete) {
            await deleteMutation.mutateAsync(networkToDelete);
            setDeleteDialogOpen(false);
            setNetworkToDelete(null);
        }
    };

    const handleRestore = async (id: string) => {
        await restoreMutation.mutateAsync(id);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-2xl">Сети</CardTitle>
                    <Button asChild>
                        <Link href={ROUTER_MAP.NETWORKS_CREATE}>
                            <Plus className="w-4 h-4 mr-2" />
                            Создать сеть
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
                    ) : data?.networks.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Network />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>
                                        {tab === 'deleted' ? 'Нет удалённых сетей' : 'Сети ещё не созданы'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {tab === 'deleted'
                                            ? 'Все удалённые сети будут отображаться здесь.'
                                            : 'Создайте первую сеть для использования в системе.'}
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
                                {data?.networks.map((network) => (
                                    <TableRow
                                        key={network.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            !showDeleted && router.push(`${ROUTER_MAP.NETWORKS_EDIT}/${network.id}`)
                                        }
                                    >
                                        <TableCell className="font-medium">{network.code}</TableCell>
                                        <TableCell>{network.name}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    network.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {network.active ? 'Активна' : 'Неактивна'}
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
                                                            handleRestore(network.id);
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
                                                                    `${ROUTER_MAP.NETWORKS_EDIT}/${network.id}`,
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
                                                                handleDeleteClick(network.id);
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
                        <AlertDialogTitle>Удалить сеть?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Сеть будет перемещена в удаленные. Вы сможете восстановить её позже из вкладки
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
