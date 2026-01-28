'use client';

import { useCallback, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Boxes, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';

import { usePlatforms } from '@/entities/platform';
import { useDeletePlatform } from '@/features/platforms/hooks/use-delete-platform';
import { useRestorePlatform } from '@/features/platforms/hooks/use-restore-platform';
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

export default function PlatformsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [platformToDelete, setPlatformToDelete] = useState<string | null>(null);

    const tab = searchParams.get('tab') || 'all';
    const showDeleted = tab === 'deleted' ? true : undefined;

    const { data, isLoading } = usePlatforms();
    const deleteMutation = useDeletePlatform();
    const restoreMutation = useRestorePlatform();

    const handleTabChange = useCallback(
        (value: string) => {
            router.push(`${ROUTER_MAP.PLATFORMS}?tab=${value}`);
        },
        [router],
    );

    const handleDeleteClick = (id: string) => {
        setPlatformToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (platformToDelete) {
            await deleteMutation.mutateAsync(platformToDelete);
            setDeleteDialogOpen(false);
            setPlatformToDelete(null);
        }
    };

    const handleRestore = async (id: string) => {
        await restoreMutation.mutateAsync(id);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-2xl">Платформы</CardTitle>
                    <Button asChild>
                        <Link href={ROUTER_MAP.PLATFORMS_CREATE}>
                            <Plus className="w-4 h-4 mr-2" />
                            Создать платформу
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
                    ) : data?.platforms.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Boxes />
                                </EmptyMedia>
                                <EmptyContent>
                                    <EmptyTitle>
                                        {tab === 'deleted' ? 'Нет удалённых платформ' : 'Платформы ещё не созданы'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {tab === 'deleted'
                                            ? 'Все удалённые платформы будут отображаться здесь.'
                                            : 'Создайте первую платформу для использования в системе.'}
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
                                {data?.platforms.map((platform) => (
                                    <TableRow
                                        key={platform.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() =>
                                            !showDeleted && router.push(`${ROUTER_MAP.PLATFORMS_EDIT}/${platform.id}`)
                                        }
                                    >
                                        <TableCell className="font-medium">{platform.code}</TableCell>
                                        <TableCell>{platform.name}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    platform.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {platform.active ? 'Активна' : 'Неактивна'}
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
                                                            handleRestore(platform.id);
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
                                                                    `${ROUTER_MAP.PLATFORMS_EDIT}/${platform.id}`,
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
                                                                handleDeleteClick(platform.id);
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
                        <AlertDialogTitle>Удалить платформу?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Платформа будет перемещена в удаленные. Вы сможете восстановить её позже из вкладки
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
