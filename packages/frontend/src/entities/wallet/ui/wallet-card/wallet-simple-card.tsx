'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, MoreHorizontal } from 'lucide-react';

import { WalletOwner } from '@/entities/wallet';
import type { Wallet } from '@/entities/wallet';
import { WalletService } from '@/entities/wallet/api/wallet-service';
import { WalletMonthlyLimit } from '@/entities/wallet/ui/wallet-monthly-limit/wallet-monthly-limit';
import { ChangeOwnerDialog } from '@/features/wallets/ui/change-owner-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';
import { cn, formatDate, formatDateTime } from '@/shared/lib/utils';
import { formatWalletCopyText, formatWalletRequisites } from '@/shared/lib/wallet-copy-helpers';
import { Button } from '@/shared/ui/shadcn/button';
import { Checkbox } from '@/shared/ui/shadcn/checkbox';
import { formatNumber } from '@/shared/lib/utils/format-number';
import { Card, CardContent, CardDescription } from '@/shared/ui/shadcn/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';

interface SimpleWalletCardProps {
    wallet: Wallet;
    selectionMode?: boolean;
    isSelected?: boolean;
    onSelect?: (walletId: string) => void;
    onEnterSelectionMode?: () => void;
    isUserRole?: boolean;
}

export const SimpleWalletCard = ({
    wallet,
    selectionMode = false,
    isSelected = false,
    onSelect,
    onEnterSelectionMode,
    isUserRole = false,
}: SimpleWalletCardProps) => {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [changeOwnerDialogOpen, setChangeOwnerDialogOpen] = useState(false);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const touchMovedRef = useRef(false);
    const queryClient = useQueryClient();

    const togglePinMutation = useMutation({
        mutationFn: ({ pinned, pinOnMain }: { pinned: boolean; pinOnMain: boolean }) =>
            WalletService.toggleWalletPin(wallet.id, pinned, pinOnMain),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] });
            queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
            toast.success('Настройки обновлены');
        },
    });

    const handleCopyRequisites = () => {
        const copyText = formatWalletCopyText(wallet);
        if (copyText) {
            navigator.clipboard
                .writeText(copyText)
                .then(() => {
                    toast.success(`Реквизиты кошелька "${wallet.name}" скопированы`);
                })
                .catch((err) => {
                    toast.error(`Не удалось скопировать: ${err}`);
                });
        } else {
            toast.error('Нет данных для копирования');
        }
    };

    const getBorderClass = (status: string) => {
        switch (status) {
            case 'positive':
                return 'border-l-[18px] border-l-green-600';
            case 'negative':
                return 'border-l-[18px] border-l-destructive/60';
            default:
                return '';
        }
    };

    const getWalletTypeLabel = (
        type:
            | string
            | {
                  id: string;
                  code: string;
                  name: string;
                  description: string | null;
                  showInTabs: boolean;
                  tabOrder: number;
              }
            | null
            | undefined,
    ) => {
        if (!type) {
            return '';
        }

        return typeof type === 'string' ? type : type.name;
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (selectionMode) {
                onSelect?.(wallet.id);
            }
        }
    };

    const handleMenuTriggerTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
        const touch = event.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        touchMovedRef.current = false;
    };

    const handleMenuTriggerTouchMove = (event: React.TouchEvent<HTMLButtonElement>) => {
        if (!touchStartRef.current) return;
        const touch = event.touches[0];
        const dx = Math.abs(touch.clientX - touchStartRef.current.x);
        const dy = Math.abs(touch.clientY - touchStartRef.current.y);
        if (dx > 10 || dy > 10) {
            touchMovedRef.current = true;
        }
    };

    const handleMenuTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (touchMovedRef.current) {
            event.preventDefault();
            touchMovedRef.current = false;
            return;
        }
        setMenuOpen(true);
    };

    const handleOperations = () => {
        router.push(ROUTER_MAP.WALLET_OPERATIONS(wallet.id));
        setMenuOpen(false);
    };

    const handleEdit = () => {
        router.push(`${ROUTER_MAP.WALLETS_EDIT}/${wallet.id}`);
        setMenuOpen(false);
    };

    const handleEnterSelectionMode = () => {
        setMenuOpen(false);
        onEnterSelectionMode?.();
    };

    const toggleDeleteMutation = useMutation({
        mutationFn: () => WalletService.deleteWallet(wallet.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] });
            queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
            if (wallet.deleted) toast.success('Кошелек удален');
        },
    });

    const handleDelete = () => {
        console.info('Delete wallet', wallet.id);
        toggleDeleteMutation.mutate();
        setMenuOpen(false);
    };

    const handleChangeOwner = () => {
        setMenuOpen(false);
        setChangeOwnerDialogOpen(true);
    };

    const handleTogglePinned = () => {
        togglePinMutation.mutate({
            pinned: !wallet.pinned,
            pinOnMain: wallet.pinOnMain,
        });
        setMenuOpen(false);
    };

    const handleTogglePinOnMain = () => {
        togglePinMutation.mutate({
            pinned: wallet.pinned,
            pinOnMain: !wallet.pinOnMain,
        });
        setMenuOpen(false);
    };

    const balanceStatusMutation = useMutation({
        mutationFn: (status: string) => {
            const payload = {
                balanceStatus: status,
                lastReconciledAt: new Date().toISOString(),
            };
            return WalletService.updateBalanceStatus(wallet.id, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] });
            queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
            toast.success('Статус баланса обновлен');
        },
    });

    const handleBalanceStatusChange = (status: string) => {
        balanceStatusMutation.mutate(status);
    };

    const toggleActiveMutation = useMutation({
        mutationFn: (active: boolean) => WalletService.toggleActive(wallet.id, active),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] });
            queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
            toast.success(wallet.active ? 'Кошелек деактивирован' : 'Кошелек активирован');
        },
    });

    const handleToggleActive = () => {
        toggleActiveMutation.mutate(!wallet.active);
        setMenuOpen(false);
    };

    const toggleVisibleMutation = useMutation({
        mutationFn: (visible: boolean) => WalletService.toggleVisible(wallet.id, visible),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] });
            queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
            toast.success(wallet.visible ? 'Кошелек скрыт' : 'Кошелек показан');
        },
    });

    const handleToggleVisible = () => {
        toggleVisibleMutation.mutate(!wallet.visible);
        setMenuOpen(false);
    };

    return (
        <>
            <DropdownMenu open={!selectionMode && menuOpen} onOpenChange={setMenuOpen}>
                <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                        if (selectionMode) {
                            onSelect?.(wallet.id);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        'w-full cursor-pointer overflow-hidden focus:outline-none focus-visible:outline-none',
                        wallet.monthlyLimit && wallet.monthlyLimit > 0 ? 'py-0 gap-0' : '',
                        getBorderClass(wallet.balanceStatus),
                        !wallet.active && 'opacity-40',
                    )}
                >
                    {wallet.monthlyLimit && wallet.monthlyLimit > 0 && (
                        <div className="border-b border-border/40 bg-muted/20 px-4 py-1.5">
                            <WalletMonthlyLimit
                                walletId={wallet.id}
                                currencyCode={wallet.currency.code}
                                limit={wallet.monthlyLimit}
                            />
                        </div>
                    )}
                    <CardContent className={wallet.monthlyLimit && wallet.monthlyLimit > 0 ? 'pt-6 pb-6' : ''}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-2 sm:max-w-[70%]">
                                <div className="flex flex-wrap items-center gap-2">
                                    {selectionMode && (
                                        <Checkbox
                                            data-checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onSelect?.(wallet.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="relative z-10"
                                        />
                                    )}
                                    <Button
                                        variant="link"
                                        className="text-sm sm:text-base p-0 h-auto font-semibold relative z-10 no-underline hover:no-underline cursor-pointer"
                                        data-wallet-link
                                        onPointerDown={(e) => {
                                            e.stopPropagation();
                                            router.push(ROUTER_MAP.WALLET_OPERATIONS(wallet.id));
                                        }}
                                    >
                                        {wallet.walletType ? `${getWalletTypeLabel(wallet.walletType)} ` : ''}
                                        {wallet.walletKind === 'simple' ? 'Касса ' : ''}
                                        {wallet.name}
                                    </Button>
                                    {formatWalletRequisites(wallet) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 relative z-20 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleCopyRequisites();
                                            }}
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                            title="Скопировать реквизиты"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                    <WalletOwner user={wallet.user} secondUser={wallet.secondUser} />
                                </div>
                                {wallet.description && <CardDescription>{wallet.description}</CardDescription>}
                            </div>
                            <div className="text-left sm:text-right">
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="mb-2 ml-auto h-8 w-8"
                                        aria-label="Открыть меню кошелька"
                                        onTouchStart={handleMenuTriggerTouchStart}
                                        onTouchMove={handleMenuTriggerTouchMove}
                                        onTouchEnd={(event) => {
                                            touchStartRef.current = null;
                                            event.stopPropagation();
                                        }}
                                        onClick={handleMenuTriggerClick}
                                        onPointerDown={(event) => event.stopPropagation()}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <p className="text-xl font-bold leading-tight sm:text-2xl">
                                    {formatNumber(wallet.amount)} {wallet.currency.code}
                                </p>
                                <div className="mt-2 space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        Создан: {formatDate(new Date(wallet.createdAt))}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Обновлен: {formatDate(new Date(wallet.updatedAt))}
                                    </p>
                                    {wallet.lastReconciledAt && (
                                        <p className="text-xs text-muted-foreground">
                                            Дата последней сверки: {formatDateTime(wallet.lastReconciledAt)} <br />
                                            Выполнил: {wallet.lastReconciledBy ? wallet.updated_by.username : '-'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <DropdownMenuContent align="center" className="z-50 w-56">
                    <div className="px-2 py-1.5">
                        <div className="text-xs text-muted-foreground mb-2">Статус баланса:</div>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={() => handleBalanceStatusChange('unknown')}
                                className={cn(
                                    'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                                    wallet.balanceStatus === 'unknown'
                                        ? 'border-muted-foreground bg-background'
                                        : 'border-muted-foreground/30 bg-background',
                                )}
                                title="Без цвета"
                            />
                            <button
                                onClick={() => handleBalanceStatusChange('negative')}
                                className={cn(
                                    'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                                    wallet.balanceStatus === 'negative'
                                        ? 'border-destructive bg-destructive/60'
                                        : 'border-destructive/30 bg-destructive/60',
                                )}
                                title="Красный"
                            />
                            <button
                                onClick={() => handleBalanceStatusChange('positive')}
                                className={cn(
                                    'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                                    wallet.balanceStatus === 'positive'
                                        ? 'border-success bg-success'
                                        : 'border-success/30 bg-success/60',
                                )}
                                title="Зеленый"
                            />
                        </div>
                    </div>
                    <DropdownMenuItem onSelect={() => handleBalanceStatusChange('positive')}>
                        Баланс верный
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleBalanceStatusChange('negative')}>
                        Баланс неверный
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleEnterSelectionMode}>Выбрать</DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleOperations}>Операции</DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={isUserRole ? () => undefined : handleEdit}
                        className={isUserRole ? 'hidden' : ''}
                    >
                        Изменить
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={isUserRole ? () => undefined : handleToggleVisible}
                        className={isUserRole ? 'hidden' : ''}
                    >
                        {wallet.visible ? 'Скрыть' : 'Показать'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleTogglePinned}>
                        {wallet.pinned ? 'Открепить' : 'Быстрый доступ'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={isUserRole ? () => undefined : handleTogglePinOnMain}
                        className={isUserRole ? 'hidden' : ''}
                    >
                        {wallet.pinOnMain ? 'Открепить с главной' : 'Закрепить на главной'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={isUserRole ? () => undefined : handleToggleActive}
                        className={isUserRole ? 'hidden' : ''}
                    >
                        {wallet.active ? 'Деактивировать' : 'Активировать'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleChangeOwner}>Держатель</DropdownMenuItem>
                    <DropdownMenuItem
                        className={isUserRole ? 'hidden' : 'text-destructive/60'}
                        onSelect={isUserRole ? () => undefined : handleDelete}
                    >
                        Удалить
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ChangeOwnerDialog
                open={changeOwnerDialogOpen}
                onOpenChange={setChangeOwnerDialogOpen}
                walletId={wallet.id}
                walletName={wallet.name}
                currentOwner={wallet.user}
                currentSecondOwner={wallet.secondUser}
            />
        </>
    );
};
