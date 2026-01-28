'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Pencil } from 'lucide-react';

import { useOperation } from '@/entities/operations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';
import { formatNumber } from '@/shared/lib/utils/format-number';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';
import { Loading } from '@/shared';

interface OperationViewDialogProps {
    operationId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OperationViewDialog({ operationId, open, onOpenChange }: OperationViewDialogProps) {
    const router = useRouter();
    const { data: operation, isLoading } = useOperation(operationId || '');

    const handleEdit = () => {
        if (operationId) {
            onOpenChange(false);
            router.push(ROUTER_MAP.OPERATIONS_EDIT + '/' + operationId);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Информация об операции</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <Loading />
                ) : operation ? (
                    <div className="space-y-6">
                        {/* Основная информация */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Тип операции</p>
                                    <div className="flex items-center gap-2 flex-wrap mt-1">
                                        <p className="font-medium">{operation.type.name}</p>
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
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Дата создания</p>
                                    <p className="font-medium">
                                        {format(new Date(operation.createdAt), 'dd MMMM yyyy, HH:mm', {
                                            locale: ru,
                                        })}
                                    </p>
                                </div>
                            </div>

                            {operation.description && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Описание</p>
                                    <p className="font-medium">{operation.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {operation.created_by && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Создал</p>
                                        <p className="font-medium">{operation.created_by.username}</p>
                                    </div>
                                )}
                                {operation.updated_by && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Обновил</p>
                                        <p className="font-medium">{operation.updated_by.username}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Записи операции */}
                        <div>
                            <h3 className="font-semibold mb-3">Движения по кошелькам</h3>
                            <div className="space-y-2">
                                {operation.entries.map((entry) => (
                                    <div key={entry.id} className="p-3 rounded-md bg-muted/50 border">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{entry.wallet.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {entry.direction === 'credit' ? 'Приход' : 'Расход'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm">
                                                    <span className="text-muted-foreground">
                                                        {formatNumber(entry.before ?? 0)}
                                                    </span>{' '}
                                                    {entry.direction === 'credit' ? '+' : '-'}{' '}
                                                    <span
                                                        className={
                                                            entry.direction === 'credit'
                                                                ? 'text-success/80 font-semibold'
                                                                : 'text-destructive/80 font-semibold'
                                                        }
                                                    >
                                                        {formatNumber(entry.amount)}
                                                    </span>
                                                    {' = '}
                                                    <span className="text-muted-foreground">
                                                        {formatNumber(entry.after ?? 0)}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Кнопка редактирования */}
                        {operationId && (
                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={handleEdit} className="gap-2">
                                    <Pencil className="h-4 w-4" />
                                    Редактировать операцию
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">Операция не найдена</p>
                )}
            </DialogContent>
        </Dialog>
    );
}
