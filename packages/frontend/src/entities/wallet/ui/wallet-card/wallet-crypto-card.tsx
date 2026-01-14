'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';

import { WalletOwner } from '@/entities/wallet';
import type { Wallet } from '@/entities/wallet';
import { WalletService } from '@/entities/wallet/api/wallet-service';
import { WalletMonthlyLimit } from '@/entities/wallet/ui/wallet-monthly-limit/wallet-monthly-limit';
import { ChangeOwnerDialog } from '@/features/wallets/ui/change-owner-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ROUTER_MAP } from '@/shared/utils/constants/router-map';
import { cn, formatDate } from '@/shared/lib/utils';
import {
  formatSpecialWalletCopyText,
  formatWalletCopyText,
  formatWalletRequisites,
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
}

export const CryptoWalletCard = ({
  wallet,
  selectionMode = false,
  isSelected = false,
  onSelect,
  onEnterSelectionMode,
}: CryptoWalletCardProps) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [changeOwnerDialogOpen, setChangeOwnerDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const togglePinMutation = useMutation({
    mutationFn: ({
      pinned,
      pinOnMain,
    }: {
      pinned: boolean;
      pinOnMain: boolean;
    }) => WalletService.toggleWalletPin(wallet.id, pinned, pinOnMain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] });
      queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
      toast.success('Настройки обновлены');
    },
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setMenuOpen(true);
    }
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
    mutationFn: (status: string) =>
      WalletService.updateBalanceStatus(wallet.id, status),
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
    mutationFn: (active: boolean) =>
      WalletService.toggleActive(wallet.id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', wallet.id] });
      queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
      toast.success(
        wallet.active ? 'Кошелек деактивирован' : 'Кошелек активирован',
      );
    },
  });

  const handleToggleActive = () => {
    toggleActiveMutation.mutate(!wallet.active);
    setMenuOpen(false);
  };

  const toggleVisibleMutation = useMutation({
    mutationFn: (visible: boolean) =>
      WalletService.toggleVisible(wallet.id, visible),
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

  const getBorderClass = (status: string) => {
    switch (status) {
      case 'positive':
        return 'border-l-[6px] border-l-green-600';
      case 'negative':
        return 'border-l-[6px] border-l-destructive/60';
      case 'neutral':
        return 'border-l-[6px] border-l-gray-700 dark:border-l-gray-600';
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
      <DropdownMenu
        open={!selectionMode && menuOpen}
        onOpenChange={setMenuOpen}
      >
        <DropdownMenuTrigger asChild>
          <Card
            role="button"
            tabIndex={0}
            onClick={(e) => {
              // Не открываем меню если кликнули на кнопку названия или чекбокс
              if (
                (e.target as HTMLElement).closest('button[data-wallet-link]') ||
                (e.target as HTMLElement).closest('[data-checkbox]')
              ) {
                return;
              }

              if (selectionMode) {
                onSelect?.(wallet.id);
                return;
              }

              setMenuOpen(true);
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full cursor-pointer overflow-hidden focus:outline-none focus-visible:outline-none',
              wallet.monthlyLimit && wallet.monthlyLimit > 0
                ? 'py-0 gap-0'
                : 'gap-3',
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
              className={
                wallet.monthlyLimit && wallet.monthlyLimit > 0
                  ? 'pt-6 pb-6'
                  : ''
              }
            >
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
                      className="text-lg sm:text-xl p-0 h-auto font-semibold relative z-10 no-underline hover:no-underline cursor-pointer"
                      data-wallet-link
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        router.push(ROUTER_MAP.WALLET_OPERATIONS(wallet.id));
                      }}
                    >
                      {getWalletTypeLabel(wallet.walletType)} {wallet.name}
                    </Button>
                    {formatWalletRequisites(wallet) && (
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
                    <WalletOwner
                      user={wallet.user}
                      secondUser={wallet.secondUser}
                    />
                  </div>
                  {getFullDescription() && (
                    <CardDescription>
                      <span
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {getFullDescription()}
                      </span>
                    </CardDescription>
                  )}
                </div>
                <div className="text-left sm:text-right">
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
                  </div>
                  {/* Кнопки копирования реквизитов */}
                  {formatWalletRequisites(wallet) && (
                    <div className="mt-3 flex gap-2 items-center">
                      {isSpecialWallet(wallet) ? (
                        <>
                          {isBybitWallet(wallet) && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  handleCopySpecialTemplate(
                                    `<${wallet.currency.code}>, TRON (TRC-20):`,
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
                                  e.stopPropagation();
                                  const template =
                                    getSpecialWalletTemplate(wallet);
                                  if (template)
                                    handleCopySpecialTemplate(template);
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
                                e.stopPropagation();
                                const template =
                                  getSpecialWalletTemplate(wallet);
                                if (template)
                                  handleCopySpecialTemplate(template);
                              }}
                              className="relative z-10 cursor-pointer"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Копировать шаблон
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            handleCopyRequisites();
                          }}
                          className="relative z-10 cursor-pointer"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Копировать реквизиты
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="z-50 w-56">
          <div className="px-2 py-1.5">
            <div className="text-xs text-muted-foreground mb-2">
              Статус баланса:
            </div>
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
              <button
                onClick={() => handleBalanceStatusChange('neutral')}
                className={cn(
                  'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                  wallet.balanceStatus === 'neutral'
                    ? 'border-gray-700 dark:border-gray-600 bg-gray-700 dark:bg-gray-600'
                    : 'border-gray-700/30 dark:border-gray-600/30 bg-gray-700/60 dark:bg-gray-600/60',
                )}
                title="Темно-серый"
              />
            </div>
          </div>
          <DropdownMenuItem onSelect={handleEnterSelectionMode}>
            Выбрать
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleOperations}>
            Операции
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleEdit}>Изменить</DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggleVisible}>
            {wallet.visible ? 'Скрыть' : 'Показать'}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleTogglePinned}>
            {wallet.pinned ? 'Открепить' : 'Быстрый доступ'}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleTogglePinOnMain}>
            {wallet.pinOnMain ? 'Открепить с главной' : 'Закрепить на главной'}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleToggleActive}>
            {wallet.active ? 'Деактивировать' : 'Активировать'}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleChangeOwner}>
            Держатель
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive/60"
            onSelect={handleDelete}
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
