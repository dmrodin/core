'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { axiosInstance } from '@/shared/api/axios-instance';
import { API_MAP } from '@/shared/utils/constants/api-map';

export const useBulkWalletActions = () => {
    const queryClient = useQueryClient();

    const bulkUpdateMutation = useMutation({
        mutationFn: async ({
            walletIds,
            updates,
        }: {
            walletIds: string[];
            updates: Partial<{
                visible: boolean;
                active: boolean;
                pinned: boolean;
                pinOnMain: boolean;
                deleted: boolean;
            }>;
        }) => {
            const promises = walletIds.map((id) => axiosInstance.patch(`${API_MAP.WALLETS.WALLETS}/${id}`, updates));
            return Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
            toast.success('Кошельки успешно обновлены');
        },
        onError: (error: unknown) => {
            const message = isAxiosError(error)
                ? error.response?.data?.message || 'Не удалось обновить кошельки'
                : 'Не удалось обновить кошельки';
            toast.error(message);
        },
    });

    const bulkToggleVisible = (walletIds: string[], visible: boolean) => {
        bulkUpdateMutation.mutate({
            walletIds,
            updates: { visible },
        });
    };

    const bulkToggleActive = (walletIds: string[], active: boolean) => {
        bulkUpdateMutation.mutate({
            walletIds,
            updates: { active },
        });
    };

    const bulkTogglePinned = (walletIds: string[], pinned: boolean) => {
        bulkUpdateMutation.mutate({
            walletIds,
            updates: { pinned },
        });
    };

    const bulkTogglePinOnMain = (walletIds: string[], pinOnMain: boolean) => {
        bulkUpdateMutation.mutate({
            walletIds,
            updates: { pinOnMain },
        });
    };

    const bulkFastAccessPersonalMutation = useMutation({
        mutationFn: async ({ walletIds, pinned }: { walletIds: string[]; pinned: boolean }) => {
            const settled = await Promise.allSettled(
                walletIds.map((id) =>
                    axiosInstance.put(`${API_MAP.WALLETS.WALLETS}/${id}/fast-access-personal`, { pinned }),
                ),
            );
            const ok = settled.filter((r) => r.status === 'fulfilled').length;
            return { ok, total: walletIds.length };
        },
        onSuccess: ({ ok, total }) => {
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            if (ok === total) {
                toast.success('Кошельки успешно обновлены');
            } else if (ok === 0) {
                toast.error('Не удалось обновить кошельки');
            } else {
                toast.warning(`Обновлено ${ok} из ${total}. Не удалось обновить ${total - ok}.`);
            }
        },
    });

    const bulkToggleFastAccessPersonal = (walletIds: string[], pinned: boolean) => {
        bulkFastAccessPersonalMutation.mutate({ walletIds, pinned });
    };

    const bulkDelete = (walletIds: string[]) => {
        bulkUpdateMutation.mutate({
            walletIds,
            updates: { deleted: true },
        });
    };

    const bulkBalanceStatusChange = (walletIds: string[], balanceStatus: string) => {
        const promises = walletIds.map((id) =>
            axiosInstance.patch(`${API_MAP.WALLETS.WALLETS}/${id}`, {
                balanceStatus,
            }),
        );

        Promise.all(promises)
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ['wallets'] });
                queryClient.invalidateQueries({ queryKey: ['pinnedWallets'] });
                toast.success('Статус баланса обновлен');
            })
            .catch((error: unknown) => {
                const message = isAxiosError(error)
                    ? error.response?.data?.message || 'Не удалось обновить статус баланса'
                    : 'Не удалось обновить статус баланса';
                toast.error(message);
            });
    };

    return {
        bulkToggleVisible,
        bulkToggleActive,
        bulkTogglePinned,
        bulkTogglePinOnMain,
        bulkToggleFastAccessPersonal,
        bulkDelete,
        bulkBalanceStatusChange,
        isPending: bulkUpdateMutation.isPending || bulkFastAccessPersonalMutation.isPending,
    };
};
