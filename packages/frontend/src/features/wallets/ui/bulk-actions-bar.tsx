'use client';

import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import { cn } from '@/shared/lib/utils';

interface BulkActionsBarProps {
    selectedCount: number;
    onCancel: () => void;
    onToggleVisible: (visible: boolean) => void;
    onToggleActive: (active: boolean) => void;
    onTogglePinned: (pinned: boolean) => void;
    onTogglePinOnMain: (pinOnMain: boolean) => void;
    onTogglePersonalPin: (pinned: boolean) => void;
    onDelete: () => void;
    onBalanceStatusChange: (status: string) => void;
    totalCount: number;
    onSelectAll: () => void;
    onCancelAll: () => void;
    isUserRole?: boolean;
}

export function BulkActionsBar({
    selectedCount,
    onCancel,
    onToggleVisible,
    onToggleActive,
    onTogglePinned,
    onTogglePinOnMain,
    onTogglePersonalPin,
    onDelete,
    onBalanceStatusChange,
    totalCount,
    onSelectAll,
    onCancelAll,
    isUserRole = false,
}: BulkActionsBarProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    if (selectedCount === 0) return null;

    const allSelected = selectedCount === totalCount;

    const handleAction = (action: () => void) => {
        action();
        setMenuOpen(false);
    };

    return (
        <div className="sticky bottom-6 left-1/2  z-50 w-full max-w-5xl px-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-3 border rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
                <div className="flex items-center gap-2 mr-auto">
                    <Check className="size-5 text-primary" />
                    <span className="font-semibold">Выбрано: {selectedCount}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={allSelected ? onCancelAll : onSelectAll}
                        className="text-primary"
                    >
                        {allSelected ? 'Снять выделение' : 'Выбрать все'}
                    </Button>
                </div>

                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="default" size="sm">
                            Действия
                            <ChevronDown className="size-4 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-56 mb-2">
                        <div className="px-2 py-1.5">
                            <div className="text-xs text-muted-foreground mb-2">Статус баланса:</div>
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => handleAction(() => onBalanceStatusChange('unknown'))}
                                    className={cn(
                                        'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                                        'border-muted-foreground/30 bg-background',
                                    )}
                                    title="Без цвета"
                                />
                                <button
                                    onClick={() => handleAction(() => onBalanceStatusChange('negative'))}
                                    className={cn(
                                        'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                                        'border-destructive/30 bg-destructive/60',
                                    )}
                                    title="Красный"
                                />
                                <button
                                    onClick={() => handleAction(() => onBalanceStatusChange('positive'))}
                                    className={cn(
                                        'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                                        'border-success/30 bg-success/60',
                                    )}
                                    title="Зеленый"
                                />
                            </div>
                        </div>
                        <DropdownMenuItem
                            className={isUserRole ? 'hidden' : ''}
                            onSelect={() => handleAction(() => onToggleVisible(false))}
                        >
                            Скрыть
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={isUserRole ? 'hidden' : ''}
                            onSelect={() => handleAction(() => onToggleVisible(true))}
                        >
                            Показать
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction(() => onTogglePinned(true))}>
                            Быстрый доступ
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction(() => onTogglePinned(false))}>
                            Открепить
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={isUserRole ? 'hidden' : ''}
                            onSelect={() => handleAction(() => onTogglePinOnMain(true))}
                        >
                            Закрепить на главной для всех
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={isUserRole ? 'hidden' : ''}
                            onSelect={() => handleAction(() => onTogglePinOnMain(false))}
                        >
                            Открепить с главной для всех
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction(() => onTogglePersonalPin(true))}>
                            Закрепить на главной для себя
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAction(() => onTogglePersonalPin(false))}>
                            Открепить с главной для себя
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={isUserRole ? 'hidden' : ''}
                            onSelect={() => handleAction(() => onToggleActive(false))}
                        >
                            Деактивировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={isUserRole ? 'hidden' : ''}
                            onSelect={() => handleAction(() => onToggleActive(true))}
                        >
                            Активировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={isUserRole ? 'hidden' : 'text-destructive/60'}
                            onSelect={() => handleAction(onDelete)}
                        >
                            Удалить
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="sm" onClick={onCancel} className="ml-1">
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}
