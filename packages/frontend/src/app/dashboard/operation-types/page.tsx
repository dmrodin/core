'use client';

import { useCallback, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { ListChecks, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';

import { useOperationTypes } from '@/entities/operations/model/use-operation-type';
import { useDeleteOperationType } from '@/features/operation-types/hooks/use-delete-operation-type';
import { useRestoreOperationType } from '@/features/operation-types/hooks/use-restore-operation-type';

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

export default function OperationTypesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [operationTypeToDelete, setOperationTypeToDelete] = useState<string | null>(null);

    const tab = searchParams.get('tab') || 'all';
    const showDeleted = tab === 'deleted' ? true : undefined;

    const { data: operationTypes, isLoading } = useOperationTypes(showDeleted);
    const deleteMutation = useDeleteOperationType();
    const restoreMutation = useRestoreOperationType();

    const handleTabChange = useCallback(
        (value: string) => {
            router.push(`${ROUTER_MAP.OPERATION_TYPES}?tab=${value}`);
        },
        [router],
    );

    const handleDeleteClick = (id: string) => {
        setOperationTypeToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (operationTypeToDelete) {
            await deleteMutation.mutateAsync(operationTypeToDelete);
            setDeleteDialogOpen(false);
            setOperationTypeToDelete(null);
        }
    };

    const handleRestore = async (id: string) => {
        await restoreMutation.mutateAsync(id);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-2xl">Типы операций</CardTitle>
                    <Button asChild>
                        <Link href={ROUTER_MAP.OPERATION_TYPES_CREATE}>
                            <Plus className="w-4 h-4 mr-2" />
                            Создать тип операции
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
                    ) : !operationTypes || operationTypes.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <ListChecks />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>Типы операций ещё не созданы</EmptyTitle>
                                    <EmptyDescription>
                                        Создайте первый тип операции для использования в системе.
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
                                        <TableHead>Описание</TableHead>
                                        <TableHead>Отдельный таб</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead className="text-right">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {operationTypes.map((operationType) => (
                                        <TableRow
                                            key={operationType.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() =>
                                                router.push(`${ROUTER_MAP.OPERATION_TYPES_EDIT}/${operationType.id}`)
                                            }
                                        >
                                            <TableCell className="font-medium">{operationType.code}</TableCell>
                                            <TableCell>{operationType.name}</TableCell>
                                            <TableCell>{operationType.description || 'Не указано'}</TableCell>
                                            <TableCell>{operationType.isSeparateTab ? 'Да' : 'Нет'}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        operationType.active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {operationType.active ? 'Активен' : 'Неактивен'}
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
                                                                handleRestore(operationType.id);
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
                                                                        `${ROUTER_MAP.OPERATION_TYPES_EDIT}/${operationType.id}`,
                                                                    );
                                                                }}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            {!operationType.isSystem && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteClick(operationType.id);
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
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Удалить тип операции?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Это действие нельзя будет отменить. Тип операции будет удален навсегда.
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
