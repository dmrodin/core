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
import {
    formatSpecialWalletCopyText,
    formatWalletCopyText,
    formatWalletRequisites,
    getBybitBbCopyText,
    getBybitTrcCopyText,
    getSpecialWalletTemplate,
    isSpecialWallet,
    isBybitWallet,
    isTrustWallet,
} from '@/shared/lib/wallet-copy-helpers';
import { Button } from '@/shared/ui/shadcn/button';
import { Checkbox } from '@/shared/ui/shadcn/checkbox';
import { formatNumber } from '@/shared/lib/utils/format-number';
import { Card, CardDescription, CardHeader } from '@/shared/ui/shadcn/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';

interface CryptoWalletCardProps {
    wallet: Wallet;
    selectionMode?: boolean;
    isSelected?: boolean;
    onSelect?: (walletId: string) => void;
    onEnterSelectionMode?: () => void;
    isUserRole?: boolean;
}

export const CryptoWalletCard = ({
    wallet,
    selectionMode = false,
    isSelected = false,
    onSelect,
    onEnterSelectionMode,
    isUserRole = false,
}: CryptoWalletCardProps) => {
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

    const toggleFastAccessPersonalMutation = useMutation({
        mutationFn: (pinned: boolean) => WalletService.toggleWalletFastAccessPersonal(wallet.id, pinned),
        onSuccess: (_data, pinned) => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] });
            toast.success(pinned ? 'Добавлено в быстрый доступ' : 'Убрано из быстрого доступа');
        },
    });

    const handleToggleFastAccessPersonal = () => {
        toggleFastAccessPersonalMutation.mutate(!wallet.isFastAccessByCurrentUser);
        setMenuOpen(false);
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

    const handleCopySpecialTemplate = (template: string) => {
        const copyText = formatSpecialWalletCopyText(wallet, template);
        navigator.clipboard
            .writeText(copyText)
            .then(() => {
                toast.success(`Шаблон для "${wallet.name}" скопирован`);
            })
            .catch((err) => {
                toast.error(`Не удалось скопировать: ${err}`);
            });
    };

    const handleCopySpecificRequisite = (value: string | null | undefined, label: string) => {
        if (!value) {
            toast.error(`Нет данных для копирования (${label})`);
            return;
        }

        navigator.clipboard
            .writeText(value)
            .then(() => {
                toast.success(`${label} скопирован`);
            })
            .catch((err) => {
                toast.error(`Не удалось скопировать: ${err}`);
            });
    };

    const getFullDescription = () => {
        const parts = [];

        if (wallet.details) {
            if (wallet.details.address) {
                parts.push(`Адрес: ${wallet.details.address}`);
            }
            if (wallet.details.exchangeUid) {
                parts.push(`UID: ${wallet.details.exchangeUid}`);
            }
            if (wallet.details.network || wallet.details.networkType) {
                const networkParts = [];
                if (wallet.details.network?.name) {
                    networkParts.push(wallet.details.network.name);
                }
                if (wallet.details.networkType?.name) {
                    networkParts.push(wallet.details.networkType.name);
                }
                if (networkParts.length > 0) {
                    parts.push(`Сеть: ${networkParts.join(' / ')}`);
                }
            }
        }

        if (wallet.description) {
            parts.push(wallet.description);
        }

        return parts.join(' • ');
    };

    const getFullDescriptionWithoutAddress = () => {
        const parts = [];

        if (wallet.details) {
            if (wallet.details.network || wallet.details.networkType) {
                const networkParts = [];
                if (wallet.details.network?.name) {
                    networkParts.push(wallet.details.network.name);
                }
                if (wallet.details.networkType?.name) {
                    networkParts.push(wallet.details.networkType.name);
                }
                if (networkParts.length > 0) {
                    parts.push(`Сеть: ${networkParts.join(' / ')}`);
                }
            }
        }

        if (wallet.description) {
            parts.push(wallet.description);
        }

        return parts.join(' • ');
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
                        wallet.monthlyLimit && wallet.monthlyLimit > 0 ? 'py-0 gap-0' : 'gap-3',
                        getBorderClass(wallet.balanceStatus),
                        !wallet.active && 'opacity-40',
                    )}
                >
                    {wallet.monthlyLimit && wallet.monthlyLimit > 0 && (
                        <div className="border-b border-border/40 bg-muted/20 px-6 py-1.5">
                            <WalletMonthlyLimit
                                walletId={wallet.id}
                                currencyCode={wallet.currency.code}
                                limit={wallet.monthlyLimit}
                            />
                        </div>
                    )}
                    <CardHeader
                        className={cn(
                            wallet.monthlyLimit && wallet.monthlyLimit > 0 ? 'pt-3 pb-3 sm:pt-6 sm:pb-6' : '',
                            'relative',
                        )}
                    >
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-8 w-8 z-10"
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
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2 pr-8">
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
                                    {wallet.name}
                                </Button>
                                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                    Крипто
                                </span>
                                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                                    {getWalletTypeLabel(wallet.walletType)}
                                </span>
                                {formatWalletRequisites(wallet) && !isSpecialWallet(wallet) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 relative z-10 cursor-pointer"
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
                            {getFullDescription() && (
                                <CardDescription>
                                    <span
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {isSpecialWallet(wallet) ? (
                                            <>
                                                {wallet.details?.address && (
                                                    <>
                                                        <span>Адрес: </span>
                                                        <span
                                                            className="text-primary cursor-pointer"
                                                            onPointerDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                handleCopySpecificRequisite(
                                                                    wallet.details?.address,
                                                                    'Адрес кошелька',
                                                                );
                                                            }}
                                                        >
                                                            {wallet.details.address}
                                                        </span>
                                                    </>
                                                )}
                                                {wallet.details?.exchangeUid && (
                                                    <>
                                                        {wallet.details?.address && ' • '}
                                                        <span>UID: </span>
                                                        <span
                                                            className="text-primary cursor-pointer"
                                                            onPointerDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                handleCopySpecificRequisite(
                                                                    wallet.details?.exchangeUid,
                                                                    'UID',
                                                                );
                                                            }}
                                                        >
                                                            {wallet.details.exchangeUid}
                                                        </span>
                                                    </>
                                                )}
                                                {getFullDescriptionWithoutAddress() &&
                                                    ` • ${getFullDescriptionWithoutAddress()}`}
                                            </>
                                        ) : (
                                            getFullDescription()
                                        )}
                                    </span>
                                </CardDescription>
                            )}
                            <div className="flex items-end justify-between mt-1">
                                <p className="text-base font-bold leading-tight sm:text-xl">
                                    {formatNumber(wallet.amount)} {wallet.currency.code}
                                </p>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                                        Создан: {formatDate(new Date(wallet.createdAt))}
                                    </p>
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                                        Обновлен: {formatDate(new Date(wallet.updatedAt))}
                                    </p>
                                    {wallet.lastReconciledAt && (
                                        <p className="text-xs text-muted-foreground">
                                            Сверка: {formatDateTime(wallet.lastReconciledAt)}
                                            {wallet.lastReconciled_by?.username && (
                                                <> ({wallet.lastReconciled_by.username})</>
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {formatWalletRequisites(wallet) && (
                                <div className="mt-2 flex gap-2 items-center">
                                    {isSpecialWallet(wallet) && (
                                        <>
                                            {isBybitWallet(wallet) && (
                                                <>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onPointerDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const text = getBybitTrcCopyText(wallet);
                                                            navigator.clipboard
                                                                .writeText(text)
                                                                .then(() => toast.success('TRC шаблон скопирован'))
                                                                .catch((err) =>
                                                                    toast.error(`Не удалось скопировать: ${err}`),
                                                                );
                                                        }}
                                                        className="relative z-10 cursor-pointer"
                                                    >
                                                        TRC
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onPointerDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const text = getBybitBbCopyText(wallet);
                                                            navigator.clipboard
                                                                .writeText(text)
                                                                .then(() => toast.success('BB шаблон скопирован'))
                                                                .catch((err) =>
                                                                    toast.error(`Не удалось скопировать: ${err}`),
                                                                );
                                                        }}
                                                        className="relative z-10 cursor-pointer"
                                                    >
                                                        BB
                                                    </Button>
                                                </>
                                            )}
                                            {isTrustWallet(wallet) && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onPointerDown={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const template = getSpecialWalletTemplate(wallet);
                                                        if (template) handleCopySpecialTemplate(template);
                                                    }}
                                                    className="relative z-10 cursor-pointer"
                                                >
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    Копировать с шаблоном
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardHeader>
                </Card>
                <DropdownMenuContent align="center" className="z-50 w-56">
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
                    <DropdownMenuItem onSelect={handleToggleFastAccessPersonal}>
                        {wallet.isFastAccessByCurrentUser ? 'Убрать из быстрого доступа' : 'В быстрый доступ'}
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
                    <DropdownMenuItem
                        onSelect={isUserRole ? () => undefined : handleChangeOwner}
                        className={isUserRole ? 'hidden' : ''}
                    >
                        Держатель
                    </DropdownMenuItem>
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
