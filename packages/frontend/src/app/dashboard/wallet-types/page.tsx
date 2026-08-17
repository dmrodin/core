'use client';

import { useCallback, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { FolderOpen, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';

import { useWalletTypes } from '@/entities/wallet-type';
import { useDeleteWalletType } from '@/features/wallet-types/hooks/use-delete-wallet-type';
import { useRestoreWalletType } from '@/features/wallet-types/hooks/use-restore-wallet-type';

const SYSTEM_WALLET_TYPE_CODES = ['inskech', 'bet11', 'vnj'];
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

export default function WalletTypesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<string | null>(null);

    const tab = searchParams.get('tab') || 'all';
    const showDeleted = tab === 'deleted';

    const { data, isLoading } = useWalletTypes(showDeleted ? true : undefined);
    const deleteMutation = useDeleteWalletType();
    const restoreMutation = useRestoreWalletType();

    const handleTabChange = useCallback(
        (value: string) => {
            router.push(`${ROUTER_MAP.WALLET_TYPES}?tab=${value}`);
        },
        [router],
    );

    const handleDeleteClick = (id: string) => {
        setTypeToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (typeToDelete) {
            await deleteMutation.mutateAsync(typeToDelete);
            setDeleteDialogOpen(false);
            setTypeToDelete(null);
        }
    };

    const handleRestore = async (id: string) => {
        await restoreMutation.mutateAsync(id);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="hidden text-2xl md:block">Типы кошельков</CardTitle>
                    <Button asChild>
                        <Link href={ROUTER_MAP.WALLET_TYPES_CREATE}>
                            <Plus className="w-4 h-4 mr-2" />
                            Создать тип
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
                    ) : (data?.walletTypes?.length ?? 0) === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FolderOpen />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Типы кошельков ещё не созданы</EmptyTitle>
                                    <EmptyDescription>
                                        Создайте первый тип кошелька для категоризации ваших кошельков.
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
                                    <TableHead>Показывать в табах</TableHead>
                                    <TableHead>Порядок</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead className="text-right">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.walletTypes.map((type) => (
                                    <TableRow
                                        key={type.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.push(`${ROUTER_MAP.WALLET_TYPES_EDIT}/${type.id}`)}
                                    >
                                        <TableCell className="font-medium">{type.code}</TableCell>
                                        <TableCell>{type.name}</TableCell>
                                        <TableCell>{type.showInTabs ? 'Да' : 'Нет'}</TableCell>
                                        <TableCell>{type.tabOrder}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    type.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {type.active ? 'Активен' : 'Неактивен'}
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
                                                            handleRestore(type.id);
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
                                                                    `${ROUTER_MAP.WALLET_TYPES_EDIT}/${type.id}`,
                                                                );
                                                            }}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        {!SYSTEM_WALLET_TYPE_CODES.includes(type.code) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(type.id);
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
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
                        <AlertDialogTitle>Удалить тип кошелька?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Тип кошелька будет перемещен в удаленные. Вы сможете восстановить его позже из вкладки
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
