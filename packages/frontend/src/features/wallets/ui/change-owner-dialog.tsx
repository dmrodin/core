'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { UserService } from '@/entities/users/api/users-service';
import type { UserType } from '@/entities/users/model/user-schemas';
import { WalletService } from '@/entities/wallet/api/wallet-service';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { Loader2 } from 'lucide-react';

interface ChangeOwnerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    walletId: string;
    walletName: string;
    currentOwner?: {
        id: string;
        username: string;
    } | null;
    currentSecondOwner?: {
        id: string;
        username: string;
    } | null;
    onConfirm?: (newOwnerId: string, newSecondOwnerId?: string) => void;
}

export const ChangeOwnerDialog = ({
    open,
    onOpenChange,
    walletId,
    walletName,
    currentOwner,
    currentSecondOwner,
    onConfirm,
}: ChangeOwnerDialogProps) => {
    const [selectedOwnerId, setSelectedOwnerId] = useState<string>(currentOwner?.id || '');
    const [selectedSecondOwnerId, setSelectedSecondOwnerId] = useState<string>(currentSecondOwner?.id || '');
    const queryClient = useQueryClient();

    const { data: holdersData, isLoading } = useQuery({
        queryKey: ['users', 'holders'],
        queryFn: () =>
            UserService.getUsers({
                isHolder: true,
                limit: 100,
            }),
        enabled: open,
    });

    const changeOwnerMutation = useMutation({
        mutationFn: async ({ userId, secondUserId }: { userId?: string; secondUserId?: string }) => {
            // If primary owner changed, use changeWalletOwner
            if (userId && userId !== currentOwner?.id) {
                await WalletService.changeWalletOwner(walletId, userId);
            }

            // If second owner changed, use updateSecondOwner
            const currentSecondId = currentSecondOwner?.id || '';
            if (secondUserId !== currentSecondId) {
                await WalletService.updateSecondOwner(walletId, secondUserId || undefined);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
            queryClient.invalidateQueries({ queryKey: ['wallet', walletId] });
            toast.success('Владельцы кошелька успешно изменены');
            onConfirm?.(selectedOwnerId, selectedSecondOwnerId || undefined);
            onOpenChange(false);
        },
    });

    const holders = holdersData?.users || [];

    const handleConfirm = () => {
        const ownerChanged = selectedOwnerId !== currentOwner?.id;
        const secondOwnerChanged = selectedSecondOwnerId !== (currentSecondOwner?.id || '');

        if (selectedOwnerId && (ownerChanged || secondOwnerChanged)) {
            changeOwnerMutation.mutate({
                userId: selectedOwnerId,
                secondUserId: selectedSecondOwnerId || undefined,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Изменить владельцев кошелька</DialogTitle>
                    <DialogDescription>Выберите владельцев для кошелька &quot;{walletName}&quot;</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Владелец 1 <span className="text-destructive">*</span>
                                </label>
                                <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Выберите владельца" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {holders.map((holder: UserType) => (
                                            <SelectItem key={holder.id} value={holder.id}>
                                                {holder.username}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {currentOwner && (
                                    <p className="text-xs text-muted-foreground">Текущий: {currentOwner.username}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Владелец 2 (опционально)</label>
                                <Select
                                    value={selectedSecondOwnerId || 'none'}
                                    onValueChange={(val) => setSelectedSecondOwnerId(val === 'none' ? '' : val)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Не выбран" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Не выбран</SelectItem>
                                        {holders
                                            .filter((h: UserType) => h.id !== selectedOwnerId)
                                            .map((holder: UserType) => (
                                                <SelectItem key={holder.id} value={holder.id}>
                                                    {holder.username}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {currentSecondOwner && (
                                    <p className="text-xs text-muted-foreground">
                                        Текущий: {currentSecondOwner.username}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                    {!isLoading && holders.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Нет доступных держателей. Назначьте пользователям статус держателя в разделе управления
                            пользователями.
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={changeOwnerMutation.isPending}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={
                            !selectedOwnerId ||
                            (selectedOwnerId === currentOwner?.id &&
                                selectedSecondOwnerId === (currentSecondOwner?.id || '')) ||
                            changeOwnerMutation.isPending
                        }
                    >
                        {changeOwnerMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Изменение...
                            </>
                        ) : (
                            'Изменить'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
